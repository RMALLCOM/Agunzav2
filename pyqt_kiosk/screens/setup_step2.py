from PyQt5 import QtCore, QtWidgets
from ..widgets.common import Card, SecondaryButton, ProgressWizard
from ..services import config_service


class PantallaSetupPaso2(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self)
        v.setContentsMargins(24, 24, 24, 24)

        card = Card(); card.setMaximumSize(900, 620)
        cv = QtWidgets.QVBoxLayout(card); cv.setContentsMargins(24,24,24,24)
        cv.addWidget(ProgressWizard(4,2))

        self.ddAirline = QtWidgets.QComboBox(); self.ddAirline.addItems(["JetSMART"]) 
        self.btnLoadHero = QtWidgets.QPushButton("Cargar imagen hero")
        self.btnLoadLogo = QtWidgets.QPushButton("Cargar logo")

        form = QtWidgets.QFormLayout()
        form.addRow("Aerolínea", self.ddAirline)
        form.addRow("", self.btnLoadHero)
        form.addRow("", self.btnLoadLogo)
        cv.addLayout(form)

        actions = QtWidgets.QHBoxLayout(); actions.addStretch(1)
        btnNext = SecondaryButton("Siguiente"); btnNext.clicked.connect(self.next)
        actions.addWidget(btnNext)
        cv.addLayout(actions)

        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)

    def next(self):
        self.app.navigate("setup3")

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        pass