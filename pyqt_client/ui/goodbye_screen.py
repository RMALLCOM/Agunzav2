"""
Goodbye screen - Thank you message with auto-redirect
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame)
from PyQt5.QtCore import Qt, pyqtSignal, QTimer
from PyQt5.QtGui import QFont
from .base_screen import BaseScreen


class GoodbyeScreen(BaseScreen):
    timeout_finished = pyqtSignal()
    language_changed = pyqtSignal(str)
    
    def __init__(self, main_window):
        super().__init__(main_window)
        self.countdown_timer = QTimer()
        self.countdown_timer.timeout.connect(self.update_countdown)
        self.countdown_seconds = 3
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
        
        # Thank you message
        self.title_label = QLabel()
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setWordWrap(True)
        self.title_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 40px;
                padding: 0 50px;
            }
        """)
        
        # Countdown message
        self.countdown_label = QLabel()
        self.countdown_label.setAlignment(Qt.AlignCenter)
        self.countdown_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 18px;
                margin-bottom: 20px;
            }
        """)
        
        # Progress indicator (simple text)
        self.progress_label = QLabel("●●●")
        self.progress_label.setAlignment(Qt.AlignCenter)
        self.progress_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 24px;
            }
        """)
        
        main_layout.addWidget(self.title_label)
        main_layout.addWidget(self.countdown_label)
        main_layout.addWidget(self.progress_label)
        
        # Add to main layout
        layout.addLayout(lang_layout)
        layout.addWidget(main_frame)
        
        self.setLayout(layout)
    
    def on_enter(self):
        """Called when entering goodbye screen"""
        self.countdown_seconds = 3
        self.update_countdown_text()
        self.countdown_timer.start(1000)  # Update every second
        self.update_texts()
    
    def update_countdown(self):
        """Update countdown and finish when it reaches 0"""
        self.countdown_seconds -= 1
        
        if self.countdown_seconds <= 0:
            self.countdown_timer.stop()
            self.timeout_finished.emit()
        else:
            self.update_countdown_text()
            self.update_progress()
    
    def update_countdown_text(self):
        """Update countdown display"""
        current_lang = self.i18n.get_language()
        if current_lang == 'es':
            text = f"Regresando al inicio en {self.countdown_seconds} segundos..."
        else:
            text = f"Returning to start in {self.countdown_seconds} seconds..."
        
        self.countdown_label.setText(text)
    
    def update_progress(self):
        """Update progress indicator"""
        progress_chars = ["●●●", "●●○", "●○○", "○○○"]
        index = 3 - self.countdown_seconds
        if 0 <= index < len(progress_chars):
            self.progress_label.setText(progress_chars[index])
    
    def update_texts(self):
        """Update text content based on current language"""
        current_lang = self.i18n.get_language()
        
        self.title_label.setText(self.i18n.t('goodbye.title'))
        self.update_countdown_text()
        self.lang_toggle.setText(current_lang.upper())
    
    def toggle_language(self):
        """Toggle between Spanish and English"""
        current_lang = self.i18n.get_language()
        new_lang = 'en' if current_lang == 'es' else 'es'
        
        self.i18n.set_language(new_lang)
        self.config.set_app_setting('language', new_lang)
        
        self.update_texts()
        self.language_changed.emit(new_lang)