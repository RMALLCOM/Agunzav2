from PyQt5 import QtCore, QtGui, QtWidgets
import numpy as np


class Card(QtWidgets.QFrame):
    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        self.setObjectName("Card")
        self.setStyleSheet("QFrame#Card{background:#fff;border-radius:20px;border:1px solid #eef1f8;}")


class PrimaryButton(QtWidgets.QPushButton):
    def __init__(self, text: str):
        super().__init__(text)
        self.setObjectName("Primary")
        self.setStyleSheet(".Primary{color:#1E3F8A;border:2px solid #1E3F8A;background:#fff;border-radius:16px;padding:14px 18px;} .Primary:hover{background:#F2F5FF}")


class SecondaryButton(QtWidgets.QPushButton):
    def __init__(self, text: str):
        super().__init__(text)
        self.setObjectName("Secondary")
        self.setStyleSheet(".Secondary{color:#fff;background:#1E3F8A;border:none;border-radius:16px;padding:14px 18px;}")


class VideoWidget(QtWidgets.QLabel):
    def __init__(self):
        super().__init__()
        self.setMinimumSize(640, 360)
        self.setAlignment(QtCore.Qt.AlignCenter)
        self.setStyleSheet("background:#e9eef7;border-radius:16px;")

    def set_frame(self, frame_bgr):
        h, w = frame_bgr.shape[:2]
        qimg = QtGui.QImage(frame_bgr.data, w, h, 3 * w, QtGui.QImage.Format_BGR888)
        pix = QtGui.QPixmap.fromImage(qimg)
        self.setPixmap(pix.scaled(self.size(), QtCore.Qt.KeepAspectRatio, QtCore.Qt.SmoothTransformation))


class DataCard(Card):
    def __init__(self):
        super().__init__()
        lay = QtWidgets.QFormLayout(self)
        lay.setContentsMargins(16, 16, 16, 16)
        self.lblClass = QtWidgets.QLabel('-')
        self.lblWcm = QtWidgets.QLabel('-')
        self.lblLcm = QtWidgets.QLabel('-')
        self.lblWpx = QtWidgets.QLabel('-')
        self.lblLpx = QtWidgets.QLabel('-')
        self.lblKg = QtWidgets.QLabel('-')
        self.lblCal = QtWidgets.QLabel('OK')
        lay.addRow("Clase:", self.lblClass)
        lay.addRow("Ancho (cm):", self.lblWcm)
        lay.addRow("Largo (cm):", self.lblLcm)
        lay.addRow("Ancho (px):", self.lblWpx)
        lay.addRow("Largo (px):", self.lblLpx)
        lay.addRow("Peso (kg):", self.lblKg)
        lay.addRow("Calibración:", self.lblCal)

    def set_values(self, cls, w_cm, l_cm, w_px, l_px, kg):
        self.lblClass.setText(str(cls))
        self.lblWcm.setText(f"{w_cm:.1f}")
        self.lblLcm.setText(f"{l_cm:.1f}")
        self.lblWpx.setText(str(w_px))
        self.lblLpx.setText(str(l_px))
        self.lblKg.setText(f"{kg:.1f}")


class ProgressWizard(QtWidgets.QWidget):
    def __init__(self, steps: int, current: int):
        super().__init__()
        h = QtWidgets.QHBoxLayout(self)
        h.setContentsMargins(0, 0, 0, 0)
        h.setSpacing(6)
        for i in range(1, steps + 1):
            dot = QtWidgets.QFrame()
            dot.setFixedHeight(8)
            dot.setStyleSheet("border-radius:4px;background:#e5e9f8;")
            w = 28 if i == current else 10
            dot.setFixedWidth(w)
            if i == current:
                dot.setStyleSheet("border-radius:4px;background:#1E3F8A;")
            h.addWidget(dot)