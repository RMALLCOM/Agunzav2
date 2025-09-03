"""
Base screen class for all kiosk screens
"""

from PyQt5.QtWidgets import QWidget
from PyQt5.QtCore import Qt


class BaseScreen(QWidget):
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self.config = main_window.config
        self.i18n = main_window.i18n
        
        # Set common properties
        self.setStyleSheet("""
            QWidget {
                background-color: #F7FAFF;
                font-family: Arial, sans-serif;
            }
            QPushButton {
                padding: 10px 20px;
                font-size: 16px;
                font-weight: bold;
                border: 2px solid #1E3F8A;
                border-radius: 8px;
                background-color: white;
                color: #1E3F8A;
            }
            QPushButton:hover {
                background-color: #F2F5FF;
            }
            QPushButton:pressed {
                background-color: #E6EDFF;
            }
            QComboBox {
                padding: 8px;
                font-size: 14px;
                border: 2px solid #1E3F8A;
                border-radius: 4px;
                background-color: white;
            }
            QLineEdit {
                padding: 8px;
                font-size: 14px;
                border: 2px solid #1E3F8A;
                border-radius: 4px;
                background-color: white;
            }
            QLabel {
                color: #1E3F8A;
                font-size: 14px;
            }
        """)
    
    def on_enter(self):
        """Called when screen is entered (shown)"""
        pass
    
    def update_texts(self):
        """Update text content based on current language"""
        pass