import sys
from pathlib import Path
from PyQt5 import QtCore, QtGui, QtWidgets

from i18n import STRINGS
from services import config_service

BASE = Path(__file__).resolve().parent
ASSETS = BASE / "assets" / "ui"

PRIMARY = QtGui.QColor("#1E3F8A")
ACCENT = QtGui.QColor("#E51937")


class MainWindow(QtWidgets.QMainWindow):
    languageChanged = QtCore.pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Kiosco JetSMART")
        self.setWindowFlag(QtCore.Qt.FramelessWindowHint)
        self.showFullScreen()

        self.lang = config_service.get_theme().get("lang", "es")

        # Central stack
        self.stack = QtWidgets.QStackedWidget()
        self.setCentralWidget(self.stack)

        # TopBar
        from widgets.topbar import TopBar
        self.topbar = TopBar(self.lang)
        self.topbar.requestBack.connect(self.handle_back)
        self.topbar.languageChanged.connect(self.set_language)

        wrapper = QtWidgets.QWidget()
        v = QtWidgets.QVBoxLayout(wrapper)
        v.setContentsMargins(0, 0, 0, 0)
        v.setSpacing(0)
        v.addWidget(self.topbar)
        v.addWidget(self.stack)
        self.setCentralWidget(wrapper)

        # Screens
        from screens.inicio import PantallaInicio
        from screens.setup_step1 import PantallaSetupPaso1
        from screens.setup_step2 import PantallaSetupPaso2
        from screens.setup_step3 import PantallaSetupPaso3
        from screens.setup_step4 import PantallaSetupPaso4
        from screens.menu_escaneo import PantallaMenuEscaneo
        from screens.escaneo import PantallaEscaneo
        from screens.validacion import PantallaValidacion
        from screens.opciones_no_autorizado import PantallaOpcionesNoAutorizado
        from screens.despedida import PantallaDespedida
        from screens.pesaje_libre import PantallaPesajeLibre
        from screens.detalle_no_cumple import PantallaDetalleNoCumple

        self.routes = {
            "inicio": PantallaInicio,
            "setup1": PantallaSetupPaso1,
            "setup2": PantallaSetupPaso2,
            "setup3": PantallaSetupPaso3,
            "setup4": PantallaSetupPaso4,
            "menu": PantallaMenuEscaneo,
            "escaneo": PantallaEscaneo,
            "validacion": PantallaValidacion,
            "op_no_aut": PantallaOpcionesNoAutorizado,
            "despedida": PantallaDespedida,
            "pesaje": PantallaPesajeLibre,
            "detalle_nocumple": PantallaDetalleNoCumple,
        }

        self.instances = {}
        self.history = []
        self.navigate("inicio")
        self.apply_styles()

    def apply_styles(self):
        self.setStyleSheet(
            """
            QWidget { font-family: 'Segoe UI', sans-serif; font-size: 16px; }
            QPushButton { padding: 12px 16px; border-radius: 18px; }
            .Primary { color: #1E3F8A; border: 2px solid #1E3F8A; background: #fff; }
            .Primary:hover { background: #F2F5FF; }
            .Secondary { color: #fff; background: #1E3F8A; }
            .Danger { color: #fff; background: #E51937; }
            .Card { background: #fff; border-radius: 20px; }
            .Shadow { box-shadow: 0px 12px 30px rgba(0,0,0,0.1); }
            """
        )

    def set_language(self, lang: str):
        self.lang = lang
        theme = config_service.get_theme(); theme["lang"] = lang; config_service.save_theme(theme)
        self.languageChanged.emit(lang)

    def navigate(self, route: str, payload: dict = None, push_history: bool = True):
        if route not in self.routes:
            return
        if push_history and self.stack.currentWidget():
            self.history.append(self.stack.currentWidget())
        if route not in self.instances:
            widget = self.routes[route](self)
            self.instances[route] = widget
            self.languageChanged.connect(widget.set_strings)
            self.stack.addWidget(widget)
        else:
            widget = self.instances[route]
        widget.on_enter(payload or {})
        widget.set_strings(self.lang)
        self.stack.setCurrentWidget(widget)

    def handle_back(self):
        if self.history:
            w = self.history.pop()
            self.stack.setCurrentWidget(w)
        else:
            # desde inicio ignoramos
            pass


def bootstrap_configs():
    from services import config_service
    if not config_service.get_theme():
        config_service.save_theme({"primary":"#1E3F8A","accent":"#E51937","background":"assets/ui/hero_jetsmart.jpg","lang":"es"})
    if not config_service.get_devices():
        config_service.save_devices({"camera_index":0,"scale_port":"COM3","px_per_cm":10.0,"simulate":True})
    if not config_service.get_rules():
        config_service.save_rules({
            "profile":"cabin","tolerance_cm":1.0,
            "handbag":{"width":45,"height":35,"length":25,"weight":10.0},
            "cabin":  {"width":55,"height":35,"length":25,"weight":10.0}
        })


def main():
    bootstrap_configs()
    app = QtWidgets.QApplication(sys.argv)
    win = MainWindow(); win.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()