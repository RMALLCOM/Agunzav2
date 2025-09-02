from PyQt5 import QtCore, QtWidgets
from widgets.common import Card, PrimaryButton, SecondaryButton
from services.config_service import get_rules
from services.validation import validate


class PantallaValidacion(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        self.measure = None
        self.result = None
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        self.card = Card(); self.card.setMaximumSize(900,620)
        cv = QtWidgets.QVBoxLayout(self.card); cv.setContentsMargins(24,24,24,24)

        self.title = QtWidgets.QLabel("Resultado"); self.title.setStyleSheet("font-size:28px;font-weight:800;")
        cv.addWidget(self.title)

        self.details = QtWidgets.QLabel("")
        self.details.setStyleSheet("color:#374151"); self.details.setWordWrap(True)
        cv.addWidget(self.details)

        actions = QtWidgets.QHBoxLayout()
        self.btnFinish = SecondaryButton("TERMINAR"); self.btnFinish.clicked.connect(lambda: self.app.navigate("despedida"))
        self.btnOptions = PrimaryButton("VER OPCIONES"); self.btnOptions.clicked.connect(lambda: self.app.navigate("op_no_aut"))
        self.btnWhy = PrimaryButton("¿Por Qué?"); self.btnWhy.clicked.connect(self.open_why)
        self.btnBack = PrimaryButton("VOLVER A ESCANEO"); self.btnBack.clicked.connect(lambda: self.app.navigate("escaneo"))
        actions.addWidget(self.btnBack); actions.addWidget(self.btnWhy); actions.addWidget(self.btnOptions); actions.addWidget(self.btnFinish)
        cv.addLayout(actions)

        v.addWidget(self.card, 0, QtCore.Qt.AlignHCenter)

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        self.measure = payload
        rules = get_rules()
        self.result = validate(self.measure, rules)
        if self.result["authorized"]:
            self.title.setText("AUTORIZADO")
            self.title.setStyleSheet("font-size:38px;font-weight:900;color:#10b981;")
            self.btnOptions.setEnabled(False)
            self.btnWhy.setEnabled(False)
            self.btnFinish.setEnabled(True)
        else:
            self.title.setText("NO AUTORIZADO")
            self.title.setStyleSheet("font-size:38px;font-weight:900;color:#ef4444;")
            self.btnOptions.setEnabled(True)
            self.btnWhy.setEnabled(True)
            self.btnFinish.setEnabled(False)
        self.details.setText(f"Medición: {self.measure}\nReglas: {rules}\nMotivos: {'; '.join(self.result['reasons'])}")

    def open_why(self):
        from services.config_service import get_rules
        self.app.navigate("detalle_nocumple", {
            "measure": self.measure,
            "rules": get_rules(),
            "reasons": self.result.get("reasons", [])
        })