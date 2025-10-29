"""
Goodbye screen - Thank you message with auto-redirect
"""

from PyQt5.QtWidgets import (QVBoxLayout, QLabel, QFrame)
from PyQt5.QtCore import Qt, pyqtSignal, QTimer
from .base_screen import BaseScreen


class GoodbyeScreen(BaseScreen):
    timeout_finished = pyqtSignal()
    
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
        
        main_layout.addWidget(self.title_label)
        main_layout.addWidget(self.countdown_label)
        
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
    
    def update_countdown_text(self):
        """Update countdown display"""
        lang = self.main_window.language
        if lang == 'es':
            text = f"Regresando al inicio en {self.countdown_seconds} segundos..."
        else:
            text = f"Returning to start in {self.countdown_seconds} seconds..."
        
        self.countdown_label.setText(text)
    
    def update_texts(self):
        """Update text content based on current language"""
        self.title_label.setText(self.get_text('goodbye_title'))
        self.update_countdown_text()
