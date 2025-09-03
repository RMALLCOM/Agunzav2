"""
Weight demo dialog - Modal for simulating weight readings in demo mode
"""

from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont
import random


class WeightDemoDialog(QDialog):
    weight_set = pyqtSignal(float)
    
    def __init__(self, i18n_manager=None, parent=None):
        super().__init__(parent)
        self.i18n = i18n_manager
        self.current_weight = 0.0
        
        self.setup_ui()
        self.update_texts()
        
        # Set focus to read weight button
        self.read_button.setFocus()
    
    def setup_ui(self):
        """Set up the dialog UI"""
        self.setWindowTitle("Demo Weight")
        self.setModal(True)
        self.setFixedSize(400, 300)
        
        # Remove window frame for kiosk-like appearance
        self.setWindowFlags(Qt.Dialog | Qt.FramelessWindowHint)
        
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 30, 30, 30)
        
        # Title
        self.title_label = QLabel()
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("""
            QLabel {
                font-size: 20px;
                font-weight: bold;
                color: #1E3F8A;
                margin-bottom: 20px;
            }
        """)
        
        # Weight display frame
        weight_frame = QFrame()
        weight_frame.setStyleSheet("""
            QFrame {
                background-color: #f8f9fa;
                border: 2px solid #1E3F8A;
                border-radius: 10px;
                padding: 20px;
                margin: 10px 0;
            }
        """)
        
        weight_layout = QVBoxLayout(weight_frame)
        weight_layout.setAlignment(Qt.AlignCenter)
        
        # Large weight display
        self.weight_display = QLabel("0.0")
        self.weight_display.setAlignment(Qt.AlignCenter)
        self.weight_display.setStyleSheet("""
            QLabel {
                font-size: 48px;
                font-weight: bold;
                color: #E20C18;
                margin: 10px 0;
            }
        """)
        
        # Units label
        self.units_label = QLabel("kg")
        self.units_label.setAlignment(Qt.AlignCenter)
        self.units_label.setStyleSheet("""
            QLabel {
                font-size: 18px;
                color: #666;
            }
        """)
        
        weight_layout.addWidget(self.weight_display)
        weight_layout.addWidget(self.units_label)
        
        # Buttons
        button_layout = QVBoxLayout()
        button_layout.setSpacing(10)
        
        # Read weight button
        self.read_button = QPushButton()
        self.read_button.setObjectName("btn_read_weight")
        self.read_button.setFixedHeight(50)
        self.read_button.setStyleSheet("""
            QPushButton {
                background-color: #17a2b8;
                color: white;
                font-size: 16px;
                font-weight: bold;
                border: none;
                border-radius: 8px;
                padding: 10px;
            }
            QPushButton:hover {
                background-color: #138496;
            }
            QPushButton:pressed {
                background-color: #0f6674;
            }
        """)
        self.read_button.clicked.connect(self.read_weight)
        
        # Bottom buttons row
        bottom_buttons = QHBoxLayout()
        
        # Cancel button
        self.cancel_button = QPushButton()
        self.cancel_button.setObjectName("btn_cancel_weight")
        self.cancel_button.setFixedHeight(45)
        self.cancel_button.setStyleSheet("""
            QPushButton {
                background-color: #6c757d;
                color: white;
                font-size: 14px;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
            }
            QPushButton:hover {
                background-color: #5a6268;
            }
        """)
        self.cancel_button.clicked.connect(self.reject)
        
        # Set weight button
        self.set_button = QPushButton()
        self.set_button.setObjectName("btn_set_weight")
        self.set_button.setFixedHeight(45)
        self.set_button.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                font-size: 14px;
                font-weight: bold;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
            }
            QPushButton:hover {
                background-color: #218838;
            }
        """)
        self.set_button.clicked.connect(self.set_weight)
        
        bottom_buttons.addWidget(self.cancel_button)
        bottom_buttons.addStretch()
        bottom_buttons.addWidget(self.set_button)
        
        button_layout.addWidget(self.read_button)
        button_layout.addLayout(bottom_buttons)
        
        # Add to main layout
        layout.addWidget(self.title_label)
        layout.addWidget(weight_frame)
        layout.addLayout(button_layout)
        
        self.setLayout(layout)
    
    def read_weight(self):
        """Simulate reading weight with random value"""
        # Generate random weight between 0.0 and 35.0 kg with 1 decimal
        self.current_weight = round(random.uniform(0.0, 35.0), 1)
        self.weight_display.setText(f"{self.current_weight:.1f}")
    
    def set_weight(self):
        """Set the current weight and close dialog"""
        if self.current_weight > 0:
            self.weight_set.emit(self.current_weight)
            self.accept()
    
    def update_texts(self):
        """Update text content based on current language"""
        if self.i18n:
            lang = self.i18n.get_language()
            self.title_label.setText(self.i18n.t('scan.demo_weight_title'))
            self.read_button.setText(self.i18n.t('scan.read_weight'))
            self.set_button.setText(self.i18n.t('scan.set_weight'))
            self.cancel_button.setText(self.i18n.t('scan.cancel'))
        else:
            # Fallback to Spanish
            self.title_label.setText("Peso de maleta (demo)")
            self.read_button.setText("Leer peso")
            self.set_button.setText("Fijar peso")
            self.cancel_button.setText("Cancelar")