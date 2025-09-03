"""
Welcome screen - Entry point of the kiosk application
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont, QPixmap, QPalette
from .base_screen import BaseScreen


class WelcomeScreen(BaseScreen):
    start_clicked = pyqtSignal()
    language_changed = pyqtSignal(str)
    
    def __init__(self, main_window):
        super().__init__(main_window)
        self.setup_ui()
        self.update_texts()
    
    def setup_ui(self):
        """Set up the user interface"""
        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Language toggle button (top right)
        lang_layout = QHBoxLayout()
        lang_layout.addStretch()
        self.lang_toggle = QPushButton()
        self.lang_toggle.setObjectName("lang_toggle")
        self.lang_toggle.setFixedSize(120, 40)
        self.lang_toggle.clicked.connect(self.toggle_language)
        lang_layout.addWidget(self.lang_toggle)
        
        # Main content
        main_frame = QFrame()
        main_frame.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1: 0, y1: 0, x2: 1, y2: 1,
                    stop: 0 #87CEEB, stop: 1 #4682B4);
            }
        """)
        
        main_layout = QVBoxLayout(main_frame)
        main_layout.setAlignment(Qt.AlignCenter)
        
        # Title
        self.title_label = QLabel("JetSMART")
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 48px;
                font-weight: bold;
                margin-bottom: 20px;
            }
        """)
        
        # Subtitle
        self.subtitle_label = QLabel()
        self.subtitle_label.setAlignment(Qt.AlignCenter)
        self.subtitle_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 24px;
                margin-bottom: 40px;
            }
        """)
        
        # Start button
        self.start_button = QPushButton()
        self.start_button.setObjectName("btn_start")
        self.start_button.setFixedSize(200, 80)
        self.start_button.setStyleSheet("""
            QPushButton {
                background-color: #E20C18;
                color: white;
                font-size: 24px;
                font-weight: bold;
                border: none;
                border-radius: 10px;
            }
            QPushButton:hover {
                background-color: #C70A15;
            }
            QPushButton:pressed {
                background-color: #A00812;
            }
        """)
        self.start_button.clicked.connect(self.start_clicked.emit)
        
        main_layout.addWidget(self.title_label)
        main_layout.addWidget(self.subtitle_label)
        main_layout.addWidget(self.start_button, alignment=Qt.AlignCenter)
        
        # Add to main layout
        layout.addLayout(lang_layout)
        layout.addWidget(main_frame)
        
        self.setLayout(layout)
    
    def update_texts(self):
        """Update text content based on current language"""
        current_lang = self.i18n.get_language()
        
        self.subtitle_label.setText(self.i18n.t('welcome.title'))
        self.start_button.setText(self.i18n.t('welcome.start'))
        self.lang_toggle.setText(current_lang.upper())
    
    def toggle_language(self):
        """Toggle between Spanish and English"""
        current_lang = self.i18n.get_language()
        new_lang = 'en' if current_lang == 'es' else 'es'
        
        self.i18n.set_language(new_lang)
        self.config.set_app_setting('language', new_lang)
        
        self.update_texts()
        self.language_changed.emit(new_lang)