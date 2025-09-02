from PyQt5 import QtCore, QtWidgets
from ..i18n import STRINGS
from ..widgets.common import Card, PrimaryButton


class PantallaInicio(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        self.start_mode = False  # False: COMENZAR -> setup, True: COMENZAR ESCANEO -> escaneo
        self.tap_count = 0
        self.tap_timer = QtCore.QTimer(self)
        self.tap_timer.setInterval(1200)
        self.tap_timer.setSingleShot(True)
        self.tap_timer.timeout.connect(self._reset_taps)

        outer = QtWidgets.QVBoxLayout(self)
        outer.setContentsMargins(24, 24, 24, 24)
        outer.addStretch(1)

        self.card = Card()
        self.card.setMaximumSize(900, 620)
        cv = QtWidgets.QVBoxLayout(self.card)
        cv.setContentsMargins(24, 16, 16, 16)
        cv.setSpacing(12)

        # fila superior del card para botón invisible (derecha)
        toprow = QtWidgets.QHBoxLayout(); toprow.setContentsMargins(0,0,0,0)
        toprow.addStretch(1)
        self.btnHidden = QtWidgets.QPushButton("")
        self.btnHidden.setFixedSize(80, 56)
        self.btnHidden.setStyleSheet("background:transparent;border:none;")
        self.btnHidden.clicked.connect(self._hidden_tap)
        toprow.addWidget(self.btnHidden, 0, QtCore.Qt.AlignRight)
        cv.addLayout(toprow)

        # Hero placeholder
        hero = QtWidgets.QLabel()
        hero.setFixedHeight(260)
        hero.setStyleSheet("border-radius:16px;background:#e9eef7;")
        hero.setAlignment(QtCore.Qt.AlignCenter)
        hero.setText("HERO JETSMART")
        cv.addWidget(hero)

        # Badge logo placeholder
        badge = QtWidgets.QLabel()
        badge.setFixedSize(120, 120)
        badge.setAlignment(QtCore.Qt.AlignCenter)
        badge.setStyleSheet("background:#fff;border:2px solid #eef2ff;border-radius:60px;margin-top:-60px;")
        badge.setText("LOGO")
        cv.addWidget(badge, 0, QtCore.Qt.AlignHCenter)

        self.btnMain = PrimaryButton("COMENZAR")
        self.btnMain.clicked.connect(self._on_main)
        cv.addWidget(self.btnMain, 0, QtCore.Qt.AlignHCenter)

        # Footer logos row
        footer = QtWidgets.QHBoxLayout()
        left = QtWidgets.QLabel("ALLCOM")
        right = QtWidgets.QLabel("JetSMART")
        footer.addWidget(left)
        footer.addStretch(1)
        footer.addWidget(right)
        cv.addLayout(footer)

        outer.addWidget(self.card, 0, QtCore.Qt.AlignHCenter)
        outer.addStretch(1)

    def _on_main(self):
        if self.start_mode:
            self.app.navigate("escaneo")
        else:
            self.app.navigate("setup1")

    def _hidden_tap(self):
        self.tap_count += 1
        if not self.tap_timer.isActive():
            self.tap_timer.start()
        if self.tap_count >= 3:
            self._reset_taps()
            self.app.navigate("setup1")

    def _reset_taps(self):
        self.tap_count = 0

    def set_strings(self, lang: str):
        self.btnMain.setText("COMENZAR ESCANEO" if self.start_mode else STRINGS[lang]["start"])

    def on_enter(self, payload: dict):
        self.start_mode = bool(payload.get("start_mode", False))
        self.set_strings(self.app.lang)