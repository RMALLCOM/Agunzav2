from PyQt5 import QtCore, QtWidgets
from ..i18n import STRINGS
from ..widgets.common import Card, PrimaryButton, SecondaryButton, ProgressWizard
from ..services import config_service


class PantallaSetupPaso1(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self)
        v.setContentsMargins(24, 24, 24, 24)

        self.card = Card()
        self.card.setMaximumSize(900, 620)
        cv = QtWidgets.QVBoxLayout(self.card)
        cv.setContentsMargins(24, 24, 24, 24)
        cv.setSpacing(12)

        cv.addWidget(ProgressWizard(4, 1))

        self.grpLang = QtWidgets.QGroupBox("Idioma")
        hl = QtWidgets.QHBoxLayout(self.grpLang)
        self.rbEs = QtWidgets.QRadioButton("ES")
        self.rbEn = QtWidgets.QRadioButton("EN")
        self.rbEs.setChecked(True)
        hl.addWidget(self.rbEs); hl.addWidget(self.rbEn)

        self.country = QtWidgets.QLineEdit("CL")
        self.tz = QtWidgets.QLineEdit("America/Santiago")

        form = QtWidgets.QFormLayout()
        form.addRow("País", self.country)
        form.addRow("Zona horaria", self.tz)

        cv.addWidget(self.grpLang)
        cv.addLayout(form)

        actions = QtWidgets.QHBoxLayout()
        actions.addStretch(1)
        btnNext = SecondaryButton("Siguiente")
        btnNext.clicked.connect(self.next)
        actions.addWidget(btnNext)

        cv.addLayout(actions)
        v.addWidget(self.card, 0, QtCore.Qt.AlignHCenter)

    def next(self):
        theme = config_service.get_theme()
        theme["lang"] = "es" if self.rbEs.isChecked() else "en"
        config_service.save_theme(theme)
        self.app.set_language(theme["lang"])
        self.app.navigate("setup2")

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        pass