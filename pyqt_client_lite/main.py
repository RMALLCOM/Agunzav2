#!/usr/bin/env python3
"""
Airport Luggage Validation Kiosk - Lite Version
Lightweight version with camera streaming and image capture
"""

import sys
import os
from PyQt5.QtWidgets import QApplication, QStackedWidget, QMainWindow
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ui.welcome_screen import WelcomeScreen
from ui.setup_screen import SetupScreen
from ui.start_screen import StartScreen
from ui.scan_screen import ScanScreen
from ui.validate_screen import ValidateScreen
from ui.goodbye_screen import GoodbyeScreen


class KioskMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("JetSMART - Validador de Equipaje (Lite)")
        self.setWindowFlags(Qt.FramelessWindowHint)
        
        # Simple language state
        self.language = 'es'
        
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
        self.screens['goodbye'] = GoodbyeScreen(self)
        
        # Add screens to stacked widget
        for screen in self.screens.values():
            self.stacked_widget.addWidget(screen)
    
    def setup_navigation(self):
        """Set up navigation signals between screens"""
        # Welcome screen
        self.screens['welcome'].start_clicked.connect(lambda: self.goto_screen('setup'))
        self.screens['welcome'].language_changed.connect(self.change_language)
        
        # Setup screen
        self.screens['setup'].setup_saved.connect(lambda: self.goto_screen('start'))
        self.screens['setup'].back_clicked.connect(lambda: self.goto_screen('welcome'))
        
        # Start screen
        self.screens['start'].go_scan_clicked.connect(lambda: self.goto_screen('scan'))
        
        # Scan screen
        self.screens['scan'].image_captured.connect(self.handle_image_captured)
        self.screens['scan'].back_clicked.connect(lambda: self.goto_screen('welcome'))
        
        # Validate screen
        self.screens['validate'].continue_clicked.connect(lambda: self.goto_screen('goodbye'))
        
        # Goodbye screen
        self.screens['goodbye'].timeout_finished.connect(lambda: self.goto_screen('start'))
    
    def goto_screen(self, screen_name):
        """Navigate to a specific screen"""
        if screen_name in self.screens:
            screen = self.screens[screen_name]
            self.stacked_widget.setCurrentWidget(screen)
            
            # Update screen content when entering
            if hasattr(screen, 'on_enter'):
                screen.on_enter()
    
    def handle_image_captured(self, image_path):
        """Handle image capture and navigate to validate screen"""
        self.screens['validate'].set_captured_image(image_path)
        self.goto_screen('validate')
    
    def change_language(self, language):
        """Change language across all screens"""
        self.language = language
        
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
