from PyQt5 import QtCore, QtWidgets
from ..widgets.common import Card, PrimaryButton


class PantallaDetalleNoCumple(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        self.payload = {}
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        card = Card(); card.setMaximumSize(900,620)
        cv = QtWidgets.QVBoxLayout(card); cv.setContentsMargins(24,24,24,24)

        self.title = QtWidgets.QLabel("¿Por qué no cumple?"); self.title.setStyleSheet("font-size:24px;font-weight:800;color:#1E3F8A")
        cv.addWidget(self.title)
        self.txt = QtWidgets.QTextEdit(); self.txt.setReadOnly(True)
        cv.addWidget(self.txt, 1)

        btn = PrimaryButton("VOLVER A ESCANEO"); btn.clicked.connect(lambda: self.app.navigate("escaneo"))
        cv.addWidget(btn)
        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        self.payload = payload or {}
        reasons = payload.get("reasons", [])
        measure = payload.get("measure", {})
        rules = payload.get("rules", {})
        text = ["Detalle:"]
        text.append(f"Medición: {measure}")
        text.append(f"Reglas: {rules}")
        if reasons:
            text.append("Motivos:")
            for r in reasons:
                text.append(f" - {r}")
        self.txt.setPlainText("\n".join(text))