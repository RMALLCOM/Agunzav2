from PyQt5 import QtCore, QtWidgets
from ..widgets.common import Card, PrimaryButton, SecondaryButton, ProgressWizard
from ..services.config_service import get_devices, save_devices


class PantallaSetupPaso3(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self); v.setContentsMargins(24,24,24,24)
        card = Card(); card.setMaximumSize(900,620)
        cv = QtWidgets.QVBoxLayout(card); cv.setContentsMargins(24,24,24,24)
        cv.addWidget(ProgressWizard(4,3))

        self.ddCamera = QtWidgets.QComboBox(); self.ddCamera.addItems(["0","1","2"]) 
        self.btnTestCam = QtWidgets.QPushButton("Probar cámara")
        self.lblCamStatus = QtWidgets.QLabel("-")

        self.ddPort = QtWidgets.QComboBox(); self.ddPort.addItems(["COM3","COM4","ttyUSB0"]) 
        self.btnTestScale = QtWidgets.QPushButton("Probar balanza")
        self.lblScaleStatus = QtWidgets.QLabel("-")

        form = QtWidgets.QFormLayout();
        form.addRow("Cámara", self.ddCamera); form.addRow("", self.btnTestCam); form.addRow("Estado cámara", self.lblCamStatus)
        form.addRow("Puerto balanza", self.ddPort); form.addRow("", self.btnTestScale); form.addRow("Estado balanza", self.lblScaleStatus)
        cv.addLayout(form)

        self.btnTestCam.clicked.connect(lambda: self.lblCamStatus.setText("OK (demo)"))
        self.btnTestScale.clicked.connect(lambda: self.lblScaleStatus.setText("OK (demo)"))

        actions = QtWidgets.QHBoxLayout()
        btnBack = PrimaryButton("Volver"); btnBack.clicked.connect(lambda: self.app.navigate("inicio"))
        actions.addWidget(btnBack); actions.addStretch(1)
        btnPrev = PrimaryButton("Anterior"); btnPrev.clicked.connect(lambda: self.app.navigate("setup2"))
        actions.addWidget(btnPrev)
        btnNext = SecondaryButton("Siguiente"); btnNext.clicked.connect(self.next)
        actions.addWidget(btnNext)
        cv.addLayout(actions)

        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)

    def next(self):
        dev = get_devices(); dev["camera_index"] = int(self.ddCamera.currentText()); dev["scale_port"] = self.ddPort.currentText(); save_devices(dev)
        self.app.navigate("setup4")

    def set_strings(self, lang: str):
        pass

    def on_enter(self, payload: dict):
        pass