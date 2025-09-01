from PyQt5 import QtCore, QtWidgets
from ..i18n import STRINGS
from ..widgets.common import Card, PrimaryButton


class PantallaInicio(QtWidgets.QWidget):
    def __init__(self, app):
        super().__init__()
        self.app = app
        v = QtWidgets.QVBoxLayout(self)
        v.setContentsMargins(24, 24, 24, 24)
        v.addStretch(1)

        card = Card()
        card.setMaximumSize(900, 620)
        cv = QtWidgets.QVBoxLayout(card)
        cv.setContentsMargins(24, 24, 24, 16)
        cv.setSpacing(12)

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

        self.btnStart = PrimaryButton("COMENZAR")
        self.btnStart.clicked.connect(lambda: self.app.navigate("setup1"))
        cv.addWidget(self.btnStart, 0, QtCore.Qt.AlignHCenter)

        # Footer logos row
        footer = QtWidgets.QHBoxLayout()
        left = QtWidgets.QLabel("ALLCOM")
        right = QtWidgets.QLabel("JetSMART")
        footer.addWidget(left)
        footer.addStretch(1)
        footer.addWidget(right)
        cv.addLayout(footer)

        v.addWidget(card, 0, QtCore.Qt.AlignHCenter)
        v.addStretch(1)

    def set_strings(self, lang: str):
        self.btnStart.setText(STRINGS[lang]["start"])

    def on_enter(self, payload: dict):
        pass