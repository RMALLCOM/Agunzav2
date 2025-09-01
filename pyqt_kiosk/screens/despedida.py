from PyQt5 import QtCore, QtWidgets
from ..widgets.common import Card


class PantallaDespedida(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        self.s = 5
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        card = Card(); card.setMaximumSize(900,620)
        cv = QtWidgets.QVBoxLayout(card); cv.setContentsMargins(24,24,24,24)

        self.title = QtWidgets.QLabel("¡Buen viaje!")
        self.title.setStyleSheet("font-size:48px;font-weight:900;color:#1E3F8A;")
        self.title.setAlignment(QtCore.Qt.AlignCenter)
        self.subtitle = QtWidgets.QLabel("Gracias por usar el kiosco.")
        self.subtitle.setAlignment(QtCore.Qt.AlignCenter)
        self.countdown = QtWidgets.QLabel(""); self.countdown.setAlignment(QtCore.Qt.AlignCenter)

        cv.addWidget(self.title)
        cv.addWidget(self.subtitle)
        cv.addWidget(self.countdown)
        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)

        self.timer = QtCore.QTimer(self); self.timer.timeout.connect(self.tick)

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        self.s = 5
        self.timer.start(1000)
        self.update_label()

    def tick(self):
        self.s -= 1
        self.update_label()
        if self.s <= 0:
            self.timer.stop()
            self.app.navigate("menu")

    def update_label(self):
        self.countdown.setText(f"Regresando en {self.s}s")