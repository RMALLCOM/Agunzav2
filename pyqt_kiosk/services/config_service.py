import json
from pathlib import Path
from typing import Any, Dict

BASE = Path(__file__).resolve().parent.parent
CONFIG = BASE / "config"
CONFIG.mkdir(parents=True, exist_ok=True)


def _read_json(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _write_json(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def get_theme() -> Dict[str, Any]:
    return _read_json(CONFIG / "theme.json")


def save_theme(data: Dict[str, Any]) -> None:
    _write_json(CONFIG / "theme.json", data)


def get_devices() -> Dict[str, Any]:
    return _read_json(CONFIG / "devices.json")


def save_devices(data: Dict[str, Any]) -> None:
    _write_json(CONFIG / "devices.json", data)


def get_rules() -> Dict[str, Any]:
    return _read_json(CONFIG / "rules" / "current.json")


def save_rules(data: Dict[str, Any]) -> None:
    _write_json(CONFIG / "rules" / "current.json", data)