"""
Start screen - Entry to scanning process
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame)
from PyQt5.QtCore import Qt, pyqtSignal, QTimer
from .base_screen import BaseScreen


class StartScreen(BaseScreen):
    go_scan_clicked = pyqtSignal()
    setup_clicked = pyqtSignal()
    language_changed = pyqtSignal(str)
    
    def __init__(self, main_window):
        super().__init__(main_window)
        
        # Triple-tap detection for hidden setup access
        self.tap_count = 0
        self.tap_timer = QTimer()
        self.tap_timer.timeout.connect(self.reset_tap_count)
        
        self.setup_ui()
        self.update_texts()
    
    def setup_ui(self):
        """Set up the user interface"""
        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Language toggle button (top right)
        lang_layout = QHBoxLayout()
        
        # Hidden setup hotspot (top-right corner, next to language toggle)
        self.hidden_setup_right = QLabel()
        self.hidden_setup_right.setObjectName("hidden_area_setup_right")
        self.hidden_setup_right.setFixedSize(60, 60)
        self.hidden_setup_right.setStyleSheet("background-color: transparent;")
        self.hidden_setup_right.mousePressEvent = self.hidden_setup_right_clicked
        
        lang_layout.addStretch()
        lang_layout.addWidget(self.hidden_setup_right)
        
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
        
        # Hidden setup hotspot (top-left corner)
        self.hidden_setup = QLabel()
        self.hidden_setup.setObjectName("hidden_area_setup")
        self.hidden_setup.setFixedSize(60, 60)
        self.hidden_setup.setStyleSheet("background-color: transparent;")
        self.hidden_setup.mousePressEvent = self.hidden_setup_clicked
        
        # Title
        self.title_label = QLabel()
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 48px;
                font-weight: bold;
                margin-bottom: 40px;
            }
        """)
        
        # Start scan button
        self.go_scan_button = QPushButton()
        self.go_scan_button.setObjectName("btn_go_scan")
        self.go_scan_button.setFixedSize(300, 80)
        self.go_scan_button.setStyleSheet("""
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
        self.go_scan_button.clicked.connect(self.go_scan_clicked.emit)
        
        # Position hidden setup area at top-left
        hidden_layout = QHBoxLayout()
        hidden_layout.addWidget(self.hidden_setup, alignment=Qt.AlignLeft | Qt.AlignTop)
        hidden_layout.addStretch()
        
        main_layout.addLayout(hidden_layout)
        main_layout.addWidget(self.title_label)
        main_layout.addWidget(self.go_scan_button, alignment=Qt.AlignCenter)
        main_layout.addStretch()
        
        # Add to main layout
        layout.addLayout(lang_layout)
        layout.addWidget(main_frame)
        
        self.setLayout(layout)
    
    def hidden_setup_clicked(self, event):
        """Handle triple-tap on hidden setup area"""
        self.tap_count += 1
        
        if self.tap_count == 1:
            self.tap_timer.start(1000)  # Reset after 1 second
        elif self.tap_count >= 3:
            self.tap_timer.stop()
            self.tap_count = 0
            self.setup_clicked.emit()
    
    def reset_tap_count(self):
        """Reset tap count"""
        self.tap_count = 0
        self.tap_timer.stop()
    
    def update_texts(self):
        """Update text content based on current language"""
        current_lang = self.i18n.get_language()
        
        self.title_label.setText(self.i18n.t('start.title'))
        self.go_scan_button.setText(self.i18n.t('start.go_scan'))
        self.lang_toggle.setText(current_lang.upper())
    
    def toggle_language(self):
        """Toggle between Spanish and English"""
        current_lang = self.i18n.get_language()
        new_lang = 'en' if current_lang == 'es' else 'es'
        
        self.i18n.set_language(new_lang)
        self.config.set_app_setting('language', new_lang)
        
        self.update_texts()
        self.language_changed.emit(new_lang)