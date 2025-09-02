from PyQt5 import QtCore, QtWidgets
from ..widgets.common import Card, PrimaryButton, SecondaryButton, ProgressWizard


class PantallaSetupPaso2(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        card = Card(); card.setMaximumSize(900,620)
        cv = QtWidgets.QVBoxLayout(card); cv.setContentsMargins(24,24,24,24)
        cv.addWidget(ProgressWizard(4,2))

        self.ddAirline = QtWidgets.QComboBox(); self.ddAirline.addItems(["JetSMART"]) 
        self.btnLoadHero = QtWidgets.QPushButton("Cargar imagen hero")
        self.btnLoadLogo = QtWidgets.QPushButton("Cargar logo")
        form = QtWidgets.QFormLayout(); form.addRow("Aerolínea", self.ddAirline); form.addRow("", self.btnLoadHero); form.addRow("", self.btnLoadLogo)
        cv.addLayout(form)

        actions = QtWidgets.QHBoxLayout()
        btnBack = PrimaryButton("Volver"); btnBack.clicked.connect(lambda: self.app.navigate("inicio"))
        actions.addWidget(btnBack); actions.addStretch(1)
        btnPrev = PrimaryButton("Anterior"); btnPrev.clicked.connect(lambda: self.app.navigate("setup1"))
        actions.addWidget(btnPrev)
        btnNext = SecondaryButton("Siguiente"); btnNext.clicked.connect(lambda: self.app.navigate("setup3"))
        actions.addWidget(btnNext)
        cv.addLayout(actions)

        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        pass