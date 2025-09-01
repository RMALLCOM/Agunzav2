import random
from typing import List, Dict


PRIORITY = ["maleta", "mochila", "bolso", "otro"]


class YOLOService:
    def __init__(self):
        self.loaded = False

    def load(self, weights_path: str):
        # Stub: pretend to load weights
        self.loaded = True

    def predict(self, frame_bgr) -> List[Dict]:
        # Stub: random single detection with random size
        h, w = frame_bgr.shape[:2]
        cls = random.choice(PRIORITY)
        x1 = int(w * random.uniform(0.2, 0.4))
        y1 = int(h * random.uniform(0.2, 0.4))
        x2 = int(w * random.uniform(0.6, 0.8))
        y2 = int(h * random.uniform(0.6, 0.8))
        return [{
            "class": cls,
            "conf": round(random.uniform(0.5, 0.95), 2),
            "xyxy": [x1, y1, x2, y2],
            "w_px": x2 - x1,
            "h_px": y2 - y1,
        }]

    @staticmethod
    def pick_best(dets: List[Dict]):
        if not dets:
            return None
        # by class priority first, then confidence
        dets_sorted = sorted(
            dets,
            key=lambda d: (PRIORITY.index(d.get("class", "otro")), -d.get("conf", 0.0))
        )
        return dets_sorted[0]