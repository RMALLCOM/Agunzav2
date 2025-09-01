from PyQt5 import QtCore, QtWidgets
from ..i18n import STRINGS


class TopBar(QtWidgets.QWidget):
    requestBack = QtCore.pyqtSignal()
    languageChanged = QtCore.pyqtSignal(str)

    def __init__(self, lang: str = "es"):
        super().__init__()
        self.lang = lang
        self.setFixedHeight(56)

        h = QtWidgets.QHBoxLayout(self)
        h.setContentsMargins(12, 8, 12, 8)
        h.setSpacing(8)

        self.btnBack = QtWidgets.QPushButton("←")
        self.btnBack.setFixedWidth(56)
        self.btnBack.clicked.connect(self.requestBack.emit)
        h.addWidget(self.btnBack, 0)

        self.title = QtWidgets.QLabel(STRINGS[self.lang]["app_title"])
        self.title.setStyleSheet("color:#1E3F8A;font-weight:700")
        self.title.setAlignment(QtCore.Qt.AlignCenter)
        h.addWidget(self.title, 1)

        right = QtWidgets.QWidget()
        rh = QtWidgets.QHBoxLayout(right)
        rh.setContentsMargins(0, 0, 0, 0)
        rh.setSpacing(6)

        self.btnEs = QtWidgets.QPushButton("ES")
        self.btnEn = QtWidgets.QPushButton("EN")
        for b in (self.btnEs, self.btnEn):
            b.setFixedWidth(48)
        self.btnEs.clicked.connect(lambda: self._set_lang("es"))
        self.btnEn.clicked.connect(lambda: self._set_lang("en"))

        rh.addWidget(self.btnEs)
        rh.addWidget(self.btnEn)
        h.addWidget(right, 0)

        self.setStyleSheet("QPushButton{border-radius:12px;padding:6px 10px;border:1px solid #e6e8f2;background:#fff;}")

    def _set_lang(self, lang: str):
        if self.lang != lang:
            self.lang = lang
            self.title.setText(STRINGS[self.lang]["app_title"])
            self.languageChanged.emit(lang)