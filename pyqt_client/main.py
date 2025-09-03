#!/usr/bin/env python3
"""
Airport Luggage Validation Kiosk - PyQt5 Native Client
Main entry point for the kiosk application
"""

import sys
import os
from PyQt5.QtWidgets import QApplication, QStackedWidget, QMainWindow
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.config import ConfigManager
from core.i18n import I18nManager
from ui.welcome_screen import WelcomeScreen
from ui.setup_screen import SetupScreen
from ui.start_screen import StartScreen
from ui.scan_screen import ScanScreen
from ui.validate_screen import ValidateScreen
from ui.tariffs_screen import TariffsScreen
from ui.payment_screen import PaymentScreen
from ui.goodbye_screen import GoodbyeScreen
from ui.free_weigh_screen import FreeWeighScreen


class KioskMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("JetSMART - Validador de Equipaje")
        self.setWindowFlags(Qt.FramelessWindowHint)
        
        # Initialize managers
        self.config = ConfigManager()
        self.i18n = I18nManager()
        
        # Create stacked widget for navigation
        self.stacked_widget = QStackedWidget()
        self.setCentralWidget(self.stacked_widget)
        
        # Initialize screens
        self.screens = {}
        self.init_screens()
        
        # Set up navigation connections
        self.setup_navigation()
        
        # Start with welcome screen
        self.goto_screen('welcome')
        
        # Make fullscreen
        self.showFullScreen()
    
    def init_screens(self):
        """Initialize all screens"""
        self.screens['welcome'] = WelcomeScreen(self)
        self.screens['setup'] = SetupScreen(self)
        self.screens['start'] = StartScreen(self)
        self.screens['scan'] = ScanScreen(self)
        self.screens['validate'] = ValidateScreen(self)
        self.screens['tariffs'] = TariffsScreen(self)
        self.screens['payment'] = PaymentScreen(self)
        self.screens['goodbye'] = GoodbyeScreen(self)
        self.screens['free_weigh'] = FreeWeighScreen(self)
        
        # Add screens to stacked widget
        for screen_name, screen in self.screens.items():
            self.stacked_widget.addWidget(screen)
    
    def setup_navigation(self):
        """Set up navigation signals between screens"""
        # Welcome screen
        self.screens['welcome'].start_clicked.connect(lambda: self.goto_screen('setup'))
        
        # Setup screen
        self.screens['setup'].setup_saved.connect(lambda: self.goto_screen('start'))
        self.screens['setup'].back_clicked.connect(lambda: self.goto_screen('welcome'))
        
        # Start screen
        self.screens['start'].go_scan_clicked.connect(lambda: self.goto_screen('scan'))
        self.screens['start'].setup_clicked.connect(lambda: self.goto_screen('setup'))
        
        # Scan screen
        self.screens['scan'].continue_clicked.connect(self.handle_scan_result)
        self.screens['scan'].back_clicked.connect(lambda: self.goto_screen('welcome'))
        self.screens['scan'].setup_clicked.connect(lambda: self.goto_screen('setup'))
        self.screens['scan'].free_weigh_clicked.connect(lambda: self.goto_screen('free_weigh'))
        
        # Free weigh screen
        self.screens['free_weigh'].back_clicked.connect(lambda: self.goto_screen('scan'))
        
        # Validate screen
        self.screens['validate'].continue_ok_clicked.connect(lambda: self.goto_screen('goodbye'))
        self.screens['validate'].continue_to_payment_clicked.connect(lambda: self.goto_screen('tariffs'))
        
        # Tariffs screen
        self.screens['tariffs'].pay_clicked.connect(lambda: self.goto_screen('payment'))
        self.screens['tariffs'].back_clicked.connect(lambda: self.goto_screen('validate'))
        
        # Payment screen
        self.screens['payment'].finish_clicked.connect(lambda: self.goto_screen('goodbye'))
        
        # Goodbye screen
        self.screens['goodbye'].timeout_finished.connect(lambda: self.goto_screen('start'))
        
        # Language change handling
        self.screens['welcome'].language_changed.connect(self.handle_language_change)
        for screen_name in ['setup', 'start', 'validate', 'tariffs', 'payment', 'goodbye']:
            if hasattr(self.screens[screen_name], 'language_changed'):
                self.screens[screen_name].language_changed.connect(self.handle_language_change)
    
    def goto_screen(self, screen_name):
        """Navigate to a specific screen"""
        if screen_name in self.screens:
            screen = self.screens[screen_name]
            self.stacked_widget.setCurrentWidget(screen)
            
            # Update screen content when entering
            if hasattr(screen, 'on_enter'):
                screen.on_enter()
    
    def handle_scan_result(self, result):
        """Handle scan result and navigate to validate screen"""
        self.screens['validate'].set_result(result)
        self.goto_screen('validate')
    
    def handle_language_change(self, language):
        """Handle language change across all screens"""
        self.i18n.set_language(language)
        
        # Update all screens
        for screen in self.screens.values():
            if hasattr(screen, 'update_texts'):
                screen.update_texts()


def main():
    app = QApplication(sys.argv)
    
    # Set application font
    font = QFont("Arial", 12)
    app.setFont(font)
    
    # Create and show main window
    window = KioskMainWindow()
    window.show()
    
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()