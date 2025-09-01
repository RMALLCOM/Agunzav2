from PyQt5 import QtCore
import numpy as np
import cv2
from . import config_service


class CameraThread(QtCore.QThread):
    frameReady = QtCore.pyqtSignal(object)  # emits ndarray (BGR)
    error = QtCore.pyqtSignal(str)

    def __init__(self, parent=None, fps: int = 8):
        super().__init__(parent)
        self.running = False
        self.fps = fps
        self.cap = None

    def run(self):
        cfg = config_service.get_devices()
        simulate = bool(cfg.get("simulate", True))
        cam_index = int(cfg.get("camera_index", 0))
        delay = max(1, int(1000 / max(1, self.fps)))
        self.running = True

        if not simulate:
            try:
                self.cap = cv2.VideoCapture(cam_index)
                if not self.cap.isOpened():
                    self.error.emit("No se pudo abrir la cámara. Simulando...")
                    simulate = True
            except Exception as e:
                self.error.emit(str(e))
                simulate = True

        while self.running:
            if simulate:
                frame = self._synthetic_frame()
            else:
                ret, frame = self.cap.read()
                if not ret:
                    frame = self._synthetic_frame()
            self.frameReady.emit(frame)
            self.msleep(delay)

        if self.cap is not None:
            try:
                self.cap.release()
            except Exception:
                pass

    def stop(self):
        self.running = False
        self.wait(1000)

    def _synthetic_frame(self):
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        img[:] = (220, 230, 240)
        cv2.putText(img, 'CAMARA (demo)', (160, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (60, 60, 60), 2, cv2.LINE_AA)
        return img