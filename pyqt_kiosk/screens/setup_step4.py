from PyQt5 import QtCore, QtWidgets
from ..widgets.common import Card, PrimaryButton, SecondaryButton, ProgressWizard
from ..services.config_service import save_rules


class PantallaSetupPaso4(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        card = Card(); card.setMaximumSize(900,620)
        cv = QtWidgets.QVBoxLayout(card); cv.setContentsMargins(24,24,24,24)
        cv.addWidget(ProgressWizard(4,4))

        self.rbHand = QtWidgets.QRadioButton("Equipaje mano 45×35×25 cm, 10 kg")
        self.rbCabin = QtWidgets.QRadioButton("Cabina 55×35×25 cm, 10 kg"); self.rbCabin.setChecked(True)
        self.tolerance = QtWidgets.QDoubleSpinBox(); self.tolerance.setDecimals(1); self.tolerance.setRange(0,10); self.tolerance.setValue(1.0)

        form = QtWidgets.QFormLayout();
        form.addRow("Perfil por defecto", self.rbCabin); form.addRow("", self.rbHand); form.addRow("Tolerancia (cm)", self.tolerance)
        cv.addLayout(form)

        actions = QtWidgets.QHBoxLayout()
        btnBack = PrimaryButton("Volver"); btnBack.clicked.connect(lambda: self.app.navigate("inicio"))
        actions.addWidget(btnBack); actions.addStretch(1)
        btnPrev = PrimaryButton("Anterior"); btnPrev.clicked.connect(lambda: self.app.navigate("setup3"))
        actions.addWidget(btnPrev)
        btnFinish = SecondaryButton("Finalizar"); btnFinish.clicked.connect(self.finish)
        actions.addWidget(btnFinish)
        cv.addLayout(actions)

        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)

    def finish(self):
        data = {
            "profile": "cabin" if self.rbCabin.isChecked() else "handbag",
            "tolerance_cm": float(self.tolerance.value()),
            "handbag": {"width":45,"height":35,"length":25,"weight":10.0},
            "cabin":   {"width":55,"height":35,"length":25,"weight":10.0}
        }
        save_rules(data)
        # Ir a inicio pero en modo "Comenzar escaneo"
        self.app.navigate("inicio", {"start_mode": True})

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        pass