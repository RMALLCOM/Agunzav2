from PyQt5 import QtCore, QtWidgets
from widgets.common import Card, VideoWidget, DataCard, SecondaryButton, PrimaryButton
from services.camera_thread import CameraThread
from services.yolo_service import YOLOService
from services.scale_service import ScaleService
from services.config_service import get_devices


class PantallaEscaneo(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        grid = QtWidgets.QGridLayout(); grid.setSpacing(16)
        v.addLayout(grid)

        # center video
        self.video = VideoWidget()
        grid.addWidget(self.video, 0, 0, 1, 2)

        # right data card
        self.data = DataCard()
        grid.addWidget(self.data, 0, 2)

        # bottom actions
        self.btnBack = PrimaryButton("VOLVER")
        self.btnBack.clicked.connect(lambda: self.app.navigate("inicio", {"start_mode": True}))
        self.btnAgain = SecondaryButton("MEDIR DE NUEVO")
        self.btnContinue = SecondaryButton("CONTINUAR")
        self.btnAgain.clicked.connect(self.reset_measure)
        self.btnContinue.clicked.connect(self.continue_next)

        row = QtWidgets.QHBoxLayout()
        row.addWidget(self.btnBack)
        row.addWidget(self.btnAgain)
        row.addWidget(self.btnContinue)
        v.addLayout(row)

        # services
        self.cam = CameraThread(self, fps=8)
        self.cam.frameReady.connect(self.on_frame)
        self.cam.start()

        self.yolo = YOLOService(); self.yolo.load("weights.pt")
        self.scale = ScaleService(); self.scale.open(get_devices().get("scale_port", "COM3"))

        self.measure = None

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        self.measure = None

    def reset_measure(self):
        self.measure = None

    def continue_next(self):
        if not self.measure:
            return
        self.app.navigate("validacion", self.measure)

    def on_frame(self, frame):
        self.video.set_frame(frame)
        dets = self.yolo.predict(frame)
        best = YOLOService.pick_best(dets)
        if best:
            px_per_cm = float(get_devices().get("px_per_cm", 10.0))
            w_cm = best["w_px"] / px_per_cm
            l_cm = best["h_px"] / px_per_cm
            kg = self.scale.read_weight()
            self.data.set_values(best["class"], w_cm, l_cm, best["w_px"], best["h_px"], kg)
            self.measure = {"class": best["class"], "width_cm": w_cm, "length_cm": l_cm, "weight_kg": kg}