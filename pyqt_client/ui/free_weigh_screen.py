"""
Free Weighing screen - Scale-only mode for simple weight measurement
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame)
from PyQt5.QtCore import Qt, pyqtSignal, QTimer
from PyQt5.QtGui import QFont
from .base_screen import BaseScreen
from ..services.devices.scale_service import ScaleService


class FreeWeighScreen(BaseScreen):
    back_clicked = pyqtSignal()
    
    def __init__(self, main_window):
        super().__init__(main_window)
        
        # Initialize scale service
        scale_port = self.config.get_app_setting('scale_port', 'COM3')
        scale_baudrate = self.config.get_app_setting('scale_baudrate', 9600)
        self.scale_service = ScaleService(scale_port, scale_baudrate)
        
        # Current weight
        self.current_weight = 0.0
        
        # Setup UI
        self.setup_ui()
        self.update_texts()
        
        # Setup weight reading timer
        self.weight_timer = QTimer()
        self.weight_timer.timeout.connect(self.update_weight)
    
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
                margin-bottom: 40px;
            }
        """)
        
        # Weight display frame
        weight_frame = QFrame()
        weight_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 3px solid #1E3F8A;
                border-radius: 15px;
                padding: 60px;
                margin: 40px;
            }
        """)
        
        weight_layout = QVBoxLayout(weight_frame)
        weight_layout.setAlignment(Qt.AlignCenter)
        
        # Large weight display
        self.weight_display = QLabel("0.0")
        self.weight_display.setAlignment(Qt.AlignCenter)
        self.weight_display.setStyleSheet("""
            QLabel {
                font-size: 120px;
                font-weight: bold;
                color: #E20C18;
                margin-bottom: 20px;
            }
        """)
        
        # Units label
        self.units_label = QLabel("kg")
        self.units_label.setAlignment(Qt.AlignCenter)
        self.units_label.setStyleSheet("""
            QLabel {
                font-size: 36px;
                font-weight: bold;
                color: #1E3F8A;
            }
        """)
        
        weight_layout.addWidget(self.weight_display)
        weight_layout.addWidget(self.units_label)
        
        # Scale status indicator
        self.status_label = QLabel()
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setStyleSheet("""
            QLabel {
                font-size: 16px;
                color: #666;
                margin-top: 20px;
            }
        """)
        
        # Back button
        button_layout = QHBoxLayout()
        
        self.back_button = QPushButton()
        self.back_button.setObjectName("btn_back_free_weigh")
        self.back_button.setFixedSize(150, 60)
        self.back_button.setStyleSheet("""
            QPushButton {
                background-color: #6c757d;
                color: white;
                font-size: 18px;
                font-weight: bold;
                border: none;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #5a6268;
            }
            QPushButton:pressed {
                background-color: #495057;
            }
        """)
        self.back_button.clicked.connect(self.go_back)
        
        # Tare button (if scale supports it)
        self.tare_button = QPushButton("TARA")
        self.tare_button.setObjectName("btn_tare")
        self.tare_button.setFixedSize(150, 60)
        self.tare_button.setStyleSheet("""
            QPushButton {
                background-color: #17a2b8;
                color: white;
                font-size: 18px;
                font-weight: bold;
                border: none;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #138496;
            }
            QPushButton:pressed {
                background-color: #0f6674;
            }
        """)
        self.tare_button.clicked.connect(self.tare_scale)
        
        button_layout.addStretch()
        button_layout.addWidget(self.tare_button)
        button_layout.addSpacing(20)
        button_layout.addWidget(self.back_button)
        button_layout.addStretch()
        
        # Add to main layout
        layout.addWidget(self.title_label)
        layout.addWidget(weight_frame)
        layout.addWidget(self.status_label)
        layout.addLayout(button_layout)
        layout.addStretch()
        
        self.setLayout(layout)
    
    def on_enter(self):
        """Called when entering free weigh screen"""
        self.weight_timer.start(500)  # Update weight every 500ms for responsive display
        self.update_status()
        self.update_texts()
    
    def on_exit(self):
        """Called when leaving free weigh screen"""
        self.weight_timer.stop()
    
    def update_weight(self):
        """Update weight reading from scale"""
        try:
            weight = self.scale_service.read_weight()
            self.current_weight = weight
            self.weight_display.setText(f"{weight:.1f}")
            
            # Update status
            if self.scale_service.is_connected():
                self.status_label.setText("Balanza conectada")
                self.status_label.setStyleSheet(self.status_label.styleSheet() + "color: green;")
            else:
                self.status_label.setText("Modo simulación")
                self.status_label.setStyleSheet(self.status_label.styleSheet() + "color: orange;")
                
        except Exception as e:
            self.status_label.setText(f"Error en balanza: {e}")
            self.status_label.setStyleSheet(self.status_label.styleSheet() + "color: red;")
            self.weight_display.setText("---")
    
    def update_status(self):
        """Update scale connection status"""
        if self.scale_service.is_connected():
            status_text = "Balanza conectada" if self.i18n.get_language() == 'es' else "Scale connected"
            self.status_label.setText(status_text)
            self.status_label.setStyleSheet("""
                QLabel {
                    font-size: 16px;
                    color: green;
                    margin-top: 20px;
                }
            """)
        else:
            status_text = "Modo simulación" if self.i18n.get_language() == 'es' else "Simulation mode"
            self.status_label.setText(status_text)
            self.status_label.setStyleSheet("""
                QLabel {
                    font-size: 16px;
                    color: orange;
                    margin-top: 20px;
                }
            """)
    
    def tare_scale(self):
        """Tare (zero) the scale"""
        try:
            success = self.scale_service.tare()
            if success:
                # Show brief feedback
                original_text = self.tare_button.text()
                self.tare_button.setText("OK" if self.i18n.get_language() == 'en' else "OK")
                QTimer.singleShot(1000, lambda: self.tare_button.setText(original_text))
            else:
                # Show error feedback
                original_text = self.tare_button.text()
                self.tare_button.setText("ERROR")
                QTimer.singleShot(1000, lambda: self.tare_button.setText(original_text))
        except Exception as e:
            print(f"Error during tare: {e}")
    
    def go_back(self):
        """Handle back button click"""
        self.on_exit()
        self.back_clicked.emit()
    
    def update_texts(self):
        """Update text content based on current language"""
        current_lang = self.i18n.get_language()
        
        self.title_label.setText(self.i18n.t('free_weigh.title'))
        self.back_button.setText(self.i18n.t('free_weigh.back'))
        
        # Update tare button text
        self.tare_button.setText("TARE" if current_lang == 'en' else "TARA")
        
        # Update status text
        self.update_status()