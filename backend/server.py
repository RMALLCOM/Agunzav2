from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helpers for time and mongo serialization

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def uuid_str() -> str:
    return str(uuid.uuid4())


# Pydantic Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=uuid_str)
    client_name: str
    timestamp: str = Field(default_factory=now_iso)


class StatusCheckCreate(BaseModel):
    client_name: str


class Airline(BaseModel):
    id: str = Field(default_factory=uuid_str)
    code: str
    name: str
    logo_url: Optional[str] = None
    palette: Dict[str, str] = Field(default_factory=dict)


class Rules(BaseModel):
    id: str = Field(default_factory=uuid_str)
    airline_code: str
    max_weight_kg: float = 10.0
    dims_cm: Dict[str, float] = Field(default_factory=lambda: {"length": 55.0, "width": 35.0, "height": 25.0})
    max_linear_cm: float = 115.0
    overweight_fee_per_kg: float = 15.0
    oversize_fee_flat: float = 30.0
    currency: str = "USD"
    updated_at: str = Field(default_factory=now_iso)


class SessionCreate(BaseModel):
    airline_code: str
    language: str = "es"


class Session(BaseModel):
    id: str = Field(default_factory=uuid_str)
    airline_code: str
    language: str = "es"
    state: str = "started"
    created_at: str = Field(default_factory=now_iso)


class ScanRequest(BaseModel):
    session_id: str
    weight_kg: Optional[float] = None


class ScanResult(BaseModel):
    id: str = Field(default_factory=uuid_str)
    session_id: str
    dims_cm: Dict[str, float]
    weight_kg: float
    compliant: bool
    errors: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)


class PaymentRequest(BaseModel):
    session_id: str
    total: float
    method: str


class Payment(BaseModel):
    id: str = Field(default_factory=uuid_str)
    session_id: str
    total: float
    method: str
    status: str
    created_at: str = Field(default_factory=now_iso)


class LoginRequest(BaseModel):
    role: str  # operator | admin
    pin: str


class DatasetImage(BaseModel):
    id: str = Field(default_factory=uuid_str)
    label: str  # maleta | mochila | bolso | otro
    file_name: str
    airline_code: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class TrainStartRequest(BaseModel):
    airline_code: str


class TrainStatus(BaseModel):
    id: str = Field(default_factory=uuid_str)
    airline_code: str
    status: str = "scheduled"  # scheduled | running | success | failed
    created_at: str = Field(default_factory=now_iso)


# Routes
@api_router.get("/")
async def root():
    return {"message": "Kiosk API ready"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(client_name=input.client_name)
    await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(length=1000)
    return [StatusCheck(**sc) for sc in status_checks]


# Airline config
@api_router.get("/config/airlines", response_model=List[Airline])
async def list_airlines():
    items = await db.airlines.find().to_list(length=100)
    return [Airline(**it) for it in items]


@api_router.post("/config/airlines", response_model=Airline)
async def upsert_airline(airline: Airline):
    await db.airlines.update_one({"code": airline.code}, {"$set": airline.model_dump()}, upsert=True)
    return airline


@api_router.get("/rules/{airline_code}", response_model=Rules)
async def get_rules(airline_code: str):
    doc = await db.rules.find_one({"airline_code": airline_code})
    if not doc:
        raise HTTPException(status_code=404, detail="Rules not found")
    return Rules(**doc)


@api_router.post("/rules", response_model=Rules)
async def set_rules(rules: Rules):
    await db.rules.update_one({"airline_code": rules.airline_code}, {"$set": rules.model_dump()}, upsert=True)
    return rules


# Sessions
@api_router.post("/sessions", response_model=Session)
async def create_session(payload: SessionCreate):
    session = Session(airline_code=payload.airline_code, language=payload.language)
    await db.sessions.insert_one(session.model_dump())
    return session


# Scanning (simulated dimensions & validation)
@api_router.post("/scan", response_model=ScanResult)
async def scan(payload: ScanRequest):
    # Load rules for session airline
    session = await db.sessions.find_one({"id": payload.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    rules_doc = await db.rules.find_one({"airline_code": session['airline_code']})
    if not rules_doc:
        raise HTTPException(status_code=404, detail="Rules not found")
    rules = Rules(**rules_doc)

    # Simulate dimensions (cm)
    import random
    dims = {
        "length": round(random.uniform(45, 70), 1),
        "width": round(random.uniform(25, 45), 1),
        "height": round(random.uniform(18, 35), 1),
    }

    weight = payload.weight_kg if payload.weight_kg is not None else round(random.uniform(6, 16), 1)

    errors: List[str] = []
    compliant = True

    # Dimension checks
    if dims["length"] > rules.dims_cm["length"]:
        compliant = False
        errors.append(f"Excede largo {round(dims['length'] - rules.dims_cm['length'], 1)} cm")
    if dims["width"] > rules.dims_cm["width"]:
        compliant = False
        errors.append(f"Excede ancho {round(dims['width'] - rules.dims_cm['width'], 1)} cm")
    if dims["height"] > rules.dims_cm["height"]:
        compliant = False
        errors.append(f"Excede alto {round(dims['height'] - rules.dims_cm['height'], 1)} cm")

    linear = dims["length"] + dims["width"] + dims["height"]
    if linear > rules.max_linear_cm:
        compliant = False
        errors.append(f"Excede suma lineal {round(linear - rules.max_linear_cm, 1)} cm")

    if weight > rules.max_weight_kg:
        compliant = False
        errors.append(f"Excede peso {round(weight - rules.max_weight_kg, 1)} kg")

    result = ScanResult(
        session_id=payload.session_id,
        dims_cm=dims,
        weight_kg=weight,
        compliant=compliant,
        errors=errors,
    )
    await db.scans.insert_one(result.model_dump())
    return result


# Payments (simulated)
@api_router.post("/payments/simulate", response_model=Payment)
async def simulate_payment(req: PaymentRequest):
    import random
    status = "approved" if random.random() >= 0.15 else "rejected"
    payment = Payment(session_id=req.session_id, total=req.total, method=req.method, status=status)
    await db.payments.insert_one(payment.model_dump())
    return payment


# Auth (simple PIN demo)
@api_router.post("/auth/login")
async def login(req: LoginRequest):
    valid = (req.role == "operator" and req.pin == "1234") or (req.role == "admin" and req.pin == "9999")
    if not valid:
        raise HTTPException(status_code=401, detail="PIN inválido")
    return {"ok": True, "role": req.role}


# Dataset & Training stubs
@api_router.post("/dataset/images", response_model=DatasetImage)
async def add_dataset_image(img: DatasetImage):
    await db.dataset.insert_one(img.model_dump())
    return img


@api_router.get("/dataset/images", response_model=List[DatasetImage])
async def list_dataset_images():
    items = await db.dataset.find().to_list(length=200)
    return [DatasetImage(**it) for it in items]


@api_router.post("/train/start", response_model=TrainStatus)
async def train_start(req: TrainStartRequest):
    ts = TrainStatus(airline_code=req.airline_code, status="scheduled")
    await db.trains.insert_one(ts.model_dump())
    return ts


@api_router.get("/train/status/{airline_code}", response_model=List[TrainStatus])
async def train_status(airline_code: str):
    items = await db.trains.find({"airline_code": airline_code}).to_list(length=20)
    return [TrainStatus(**it) for it in items]


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def seed_defaults():
    # Seed airline JetSMART if not exists
    existing = await db.airlines.find_one({"code": "JSM"})
    if not existing:
        js = Airline(
            code="JSM",
            name="JetSMART",
            logo_url=None,
            palette={"primary": "#003595", "accent": "#E20C18", "bg": "#F7FAFF"},
        )
        await db.airlines.insert_one(js.model_dump())
    # Seed default rules for JetSMART
    rules = await db.rules.find_one({"airline_code": "JSM"})
    if not rules:
        r = Rules(airline_code="JSM", max_weight_kg=10.0,
                  dims_cm={"length": 55.0, "width": 35.0, "height": 25.0},
                  max_linear_cm=115.0,
                  overweight_fee_per_kg=15.0, oversize_fee_flat=30.0, currency="USD")
        await db.rules.insert_one(r.model_dump())


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()