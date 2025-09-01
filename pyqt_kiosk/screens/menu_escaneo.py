from PyQt5 import QtCore, QtWidgets
from ..i18n import STRINGS
from ..widgets.common import Card, PrimaryButton, SecondaryButton


class PantallaMenuEscaneo(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        card = Card(); card.setMaximumSize(900,620)
        cv = QtWidgets.QVBoxLayout(card); cv.setContentsMargins(24,24,24,24)
        title = QtWidgets.QLabel("Validación de equipaje"); title.setStyleSheet("font-weight:800;font-size:22px;color:#1E3F8A")
        cv.addWidget(title)

        btnScan = SecondaryButton("ESCANEAR"); btnScan.clicked.connect(lambda: self.app.navigate("escaneo"))
        btnWeigh = PrimaryButton("PESAJE LIBRE"); btnWeigh.clicked.connect(lambda: self.app.navigate("pesaje"))
        btnSetup = PrimaryButton("CONFIGURACIÓN"); btnSetup.clicked.connect(lambda: self.app.navigate("setup1"))

        cv.addWidget(btnScan)
        cv.addWidget(btnWeigh)
        cv.addWidget(btnSetup)
        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        pass