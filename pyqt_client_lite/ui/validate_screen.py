"""
Validate screen - Show captured image and simple validation
"""

from PyQt5.QtWidgets import (QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QPixmap
from .base_screen import BaseScreen


class ValidateScreen(BaseScreen):
    continue_clicked = pyqtSignal()
    
    def __init__(self, main_window):
        super().__init__(main_window)
        self.captured_image_path = None
        self.setup_ui()
        self.update_texts()
    
    def setup_ui(self):
        """Set up the user interface"""
        layout = QVBoxLayout()
        layout.setContentsMargins(50, 50, 50, 50)
        
        # Title
        self.title_label = QLabel()
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("""
            QLabel {
                font-size: 28px;
                font-weight: bold;
                color: #1E3F8A;
                margin-bottom: 30px;
            }
        """)
        
        # Image display frame
        image_frame = QFrame()
        image_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 3px solid #1E3F8A;
                border-radius: 10px;
                padding: 20px;
            }
        """)
        
        image_layout = QVBoxLayout(image_frame)
        
        # Captured image display
        self.image_label = QLabel()
        self.image_label.setFixedSize(400, 300)
        self.image_label.setStyleSheet("""
            QLabel {
                border: 2px solid #ccc;
                border-radius: 5px;
                background-color: #f9f9f9;
            }
        """)
        self.image_label.setScaledContents(True)
        self.image_label.setAlignment(Qt.AlignCenter)
        
        # Image path label
        self.path_label = QLabel()
        self.path_label.setAlignment(Qt.AlignCenter)
        self.path_label.setStyleSheet("""
            QLabel {
                color: #666;
                font-size: 12px;
                margin-top: 10px;
                word-wrap: break-word;
            }
        """)
        self.path_label.setWordWrap(True)
        
        image_layout.addWidget(self.image_label, alignment=Qt.AlignCenter)
        image_layout.addWidget(self.path_label)
        
        # Status message
        self.status_label = QLabel()
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setStyleSheet("""
            QLabel {
                font-size: 18px;
                color: #28a745;
                font-weight: bold;
                margin: 20px 0;
                padding: 15px;
                background-color: #d4edda;
                border: 2px solid #28a745;
                border-radius: 8px;
            }
        """)
        self.status_label.setText("✓ Imagen capturada correctamente")
        
        # Continue button
        self.continue_button = QPushButton()
        self.continue_button.setFixedSize(200, 60)
        self.continue_button.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                font-size: 18px;
                font-weight: bold;
                border: none;
                border-radius: 10px;
            }
            QPushButton:hover {
                background-color: #218838;
            }
        """)
        self.continue_button.clicked.connect(self.continue_clicked.emit)
        
        # Add to main layout
        layout.addWidget(self.title_label)
        layout.addWidget(image_frame)
        layout.addWidget(self.status_label)
        layout.addWidget(self.continue_button, alignment=Qt.AlignCenter)
        layout.addStretch()
        
        self.setLayout(layout)
    
    def set_captured_image(self, image_path):
        """Set the captured image to display"""
        self.captured_image_path = image_path
        
        try:
            # Load and display image
            pixmap = QPixmap(image_path)
            if not pixmap.isNull():
                self.image_label.setPixmap(pixmap)
                self.path_label.setText(f"Guardado en: {image_path}")
            else:
                self.image_label.setText("No se pudo cargar la imagen")
                self.path_label.setText("")
        except Exception as e:
            self.image_label.setText(f"Error: {e}")
            self.path_label.setText("")
    
    def update_texts(self):
        """Update text content based on current language"""
        self.title_label.setText(self.get_text('validate_title'))
        self.continue_button.setText(self.get_text('continue'))
