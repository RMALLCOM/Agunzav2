from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import asyncio
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Optional MongoDB (kept for template compatibility). Not required by this app.
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url) if mongo_url else None
if client:
    dbname = os.environ.get('DB_NAME', 'app')
    db = client[dbname]
else:
    db = None

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# --------- Models ---------
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ConfigModel(BaseModel):
    operator: str
    gate: str
    flight: str
    destination: str
    international: bool = False

class ScanStartRequest(BaseModel):
    file_name: str
    mime: str = "image/jpeg"
    total_size: int

class ScanFinishRequest(BaseModel):
    upload_id: str

# --------- Constants ---------
RULES = {"L": 55, "W": 35, "H": 25, "KG": 10}
DEFAULT_CHUNK_SIZE = 512 * 1024  # 512KB

# Upload sessions: {upload_id: {path, received, total, tmp_path}}
UPLOAD_DIR = Path("/tmp/jetsmart_uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
_uploads = {}
_uploads_lock = asyncio.Lock()

# --------- Helpers ---------

def get_home_dir() -> Path:
    return Path(os.path.expanduser("~"))


def get_desktop_dir() -> Path:
    home = get_home_dir()
    candidates = [
        home / "Desktop",
        home / "Escritorio",
    ]
    # Try XDG user dirs
    xdg = home / ".config" / "user-dirs.dirs"
    if xdg.exists():
        try:
            content = xdg.read_text(encoding="utf-8", errors="ignore")
            for line in content.splitlines():
                if line.startswith("XDG_DESKTOP_DIR") and "$HOME" in line:
                    path_str = line.split("=")[1].strip().strip('"')
                    path_str = path_str.replace("$HOME", str(home))
                    candidates.insert(0, Path(path_str))
        except Exception:
            pass
    for c in candidates:
        if c.exists():
            return c
    # fallback
    return home


def ensure_output_dir() -> Path:
    desktop = get_desktop_dir()
    out = desktop / "imagenes_ia"
    out.mkdir(parents=True, exist_ok=True)
    return out


def server_evaluate_baggage():
    import random
    L = int(round(random.uniform(RULES['L'] - 8, RULES['L'] + 12)))
    W = int(round(random.uniform(RULES['W'] - 6, RULES['W'] + 10)))
    H = int(round(random.uniform(RULES['H'] - 5, RULES['H'] + 8)))
    KG = round(random.uniform(RULES['KG'] - 3, RULES['KG'] + 5), 1)
    calibration_ok = random.random() > 0.1

    overL = max(0, L - RULES['L'])
    overW = max(0, W - RULES['W'])
    overH = max(0, H - RULES['H'])
    overKG = max(0.0, round(KG - RULES['KG'], 1))
    linear_rule = RULES['L'] + RULES['W'] + RULES['H']
    linear_sum = L + W + H
    overLinear = max(0, linear_sum - linear_rule)

    reasons = []
    if overL > 0:
        reasons.append({"code": "L", "label": f"Excede largo {overL} cm"})
    if overW > 0:
        reasons.append({"code": "W", "label": f"Excede ancho {overW} cm"})
    if overH > 0:
        reasons.append({"code": "H", "label": f"Excede alto {overH} cm"})
    if overLinear > 0:
        reasons.append({"code": "S", "label": f"Excede suma lineal {overLinear} cm"})
    if overKG > 0:
        reasons.append({"code": "KG", "label": f"Excede peso {overKG} kg"})

    complies = calibration_ok and overL == 0 and overW == 0 and overH == 0 and overKG == 0

    return {
        "L": L,
        "W": W,
        "H": H,
        "KG": KG,
        "calibrationOk": calibration_ok,
        "reasons": reasons,
        "complies": complies,
        "overages": {
            "overL": overL,
            "overW": overW,
            "overH": overH,
            "overKG": overKG,
            "overLinear": overLinear,
        },
    }


# --------- Routes ---------
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


@api_router.get("/rules")
async def get_rules():
    return RULES


CONFIG_DIR = get_home_dir() / ".jetsmart_kiosk"
CONFIG_DIR.mkdir(parents=True, exist_ok=True)
CONFIG_PATH = CONFIG_DIR / "config.json"


@api_router.get("/config")
async def get_config():
    if not CONFIG_PATH.exists():
        raise HTTPException(status_code=404, detail="No config")
    try:
        import json
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except Exception:
        raise HTTPException(status_code=500, detail="Config read error")


@api_router.post("/config")
async def post_config(cfg: ConfigModel):
    try:
        import json
        CONFIG_PATH.write_text(json.dumps(cfg.dict(), ensure_ascii=False), encoding="utf-8")
        return {"ok": True}
    except Exception:
        raise HTTPException(status_code=500, detail="Config write error")


@api_router.post("/scan/start")
async def scan_start(req: ScanStartRequest):
    upload_id = str(uuid.uuid4())
    tmp_path = UPLOAD_DIR / f"{upload_id}.part"
    async with _uploads_lock:
        _uploads[upload_id] = {
            "tmp_path": str(tmp_path),
            "received": 0,
            "total": int(req.total_size),
            "mime": req.mime,
            "file_name": req.file_name,
        }
    # ensure tmp file exists
    tmp_path.touch(exist_ok=True)
    return {"upload_id": upload_id, "chunk_size": DEFAULT_CHUNK_SIZE}


@api_router.post("/scan/chunk")
async def scan_chunk(
    upload_id: str = Form(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    chunk: UploadFile = File(...),
):
    async with _uploads_lock:
        session = _uploads.get(upload_id)
    if not session:
        raise HTTPException(status_code=404, detail="upload not found")
    tmp_path = Path(session["tmp_path"])
    data = await chunk.read()
    # append
    with open(tmp_path, "ab") as f:
        f.write(data)
    async with _uploads_lock:
        session["received"] += len(data)
    return {"received": len(data)}


@api_router.post("/scan/finish")
async def scan_finish(req: ScanFinishRequest):
    async with _uploads_lock:
        session = _uploads.pop(req.upload_id, None)
    if not session:
        raise HTTPException(status_code=404, detail="upload not found")
    tmp_path = Path(session["tmp_path"])
    if not tmp_path.exists():
        raise HTTPException(status_code=400, detail="temp file missing")

    out_dir = ensure_output_dir()
    ts = datetime.utcnow().isoformat().replace(":", "-").replace(".", "-")
    final_name = f"equipaje_{ts}.jpg"
    final_path = out_dir / final_name

    try:
        # Move temp to final
        tmp_bytes = tmp_path.read_bytes()
        final_path.write_bytes(tmp_bytes)
        tmp_path.unlink(missing_ok=True)
    except Exception:
        raise HTTPException(status_code=500, detail="file save error")

    results = server_evaluate_baggage()
    return {"saved_path": str(final_path), "file_name": final_name, "results": results}


# Legacy sample endpoints (keep, optional DB)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    if db:
        _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    if not db:
        return []
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
