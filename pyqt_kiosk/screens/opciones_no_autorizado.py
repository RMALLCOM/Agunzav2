from PyQt5 import QtCore, QtWidgets
from ..widgets.common import Card, PrimaryButton


class PantallaOpcionesNoAutorizado(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        card = Card(); card.setMaximumSize(900,620)
        cv = QtWidgets.QVBoxLayout(card); cv.setContentsMargins(24,24,24,24)
        cv.addWidget(QtWidgets.QLabel("Opciones (placeholder)"))
        cv.addWidget(QtWidgets.QLabel("• Ver Tarifas"))
        cv.addWidget(QtWidgets.QLabel("• Reintentar Escaneo"))
        cv.addWidget(QtWidgets.QLabel("• Llamar Asistencia"))

        btn = PrimaryButton("VOLVER A ESCANEO"); btn.clicked.connect(lambda: self.app.navigate("escaneo"))
        cv.addWidget(btn)
        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        pass