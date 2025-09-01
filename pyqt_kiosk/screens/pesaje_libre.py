from PyQt5 import QtCore, QtWidgets
from ..widgets.common import Card
from ..services.scale_service import ScaleService


class PantallaPesajeLibre(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        card = Card(); card.setMaximumSize(900,620)
        cv = QtWidgets.QVBoxLayout(card); cv.setContentsMargins(24,24,24,24)

        self.lbl = QtWidgets.QLabel("0.0 kg"); self.lbl.setStyleSheet("font-size:64px;font-weight:800;"); self.lbl.setAlignment(QtCore.Qt.AlignCenter)
        cv.addWidget(self.lbl, 1)

        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)

        self.scale = ScaleService(); self.scale.open("COM3")
        self.timer = QtCore.QTimer(self); self.timer.timeout.connect(self.tick); self.timer.start(1000)

    def tick(self):
        w = self.scale.read_weight()
        self.lbl.setText(f"{w:.1f} kg")

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        pass