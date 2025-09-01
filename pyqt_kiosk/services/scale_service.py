import random
from . import config_service


class ScaleService:
    def __init__(self):
        self.port = None
        self.simulate = True

    def open(self, port: str) -> bool:
        cfg = config_service.get_devices()
        self.simulate = bool(cfg.get("simulate", True))
        self.port = port
        # Stub: always success
        return True

    def read_weight(self) -> float:
        if self.simulate:
            return round(random.uniform(2.0, 18.0), 1)
        # Real implementation should read serial
        return 0.0