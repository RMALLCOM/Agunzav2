"""
Tariffs screen - Display pricing breakdown
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame, QGridLayout)
from PyQt5.QtCore import Qt, pyqtSignal
from .base_screen import BaseScreen


class TariffsScreen(BaseScreen):
    pay_clicked = pyqtSignal()
    back_clicked = pyqtSignal()
    language_changed = pyqtSignal(str)
    
    def __init__(self, main_window):
        super().__init__(main_window)
        self.validation_result = None
        self.pricing = None
        self.setup_ui()
        self.update_texts()
    
    def setup_ui(self):
        """Set up the user interface"""
        layout = QVBoxLayout()
        layout.setContentsMargins(50, 50, 50, 50)
        
        # Language toggle button (top right)
        lang_layout = QHBoxLayout()
        lang_layout.addStretch()
        self.lang_toggle = QPushButton()
        self.lang_toggle.setObjectName("lang_toggle")
        self.lang_toggle.setFixedSize(120, 40)
        self.lang_toggle.clicked.connect(self.toggle_language)
        lang_layout.addWidget(self.lang_toggle)
        
        # Title
        self.title_label = QLabel()
        self.title_label.setStyleSheet("""
            QLabel {
                font-size: 28px;
                font-weight: bold;
                color: #1E3F8A;
                margin-bottom: 30px;
            }
        """)
        
        # Pricing breakdown
        self.pricing_frame = QFrame()
        self.pricing_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border-radius: 10px;
                padding: 30px;
            }
        """)
        
        pricing_layout = QVBoxLayout(self.pricing_frame)
        
        # Pricing grid
        self.pricing_grid = QGridLayout()
        
        # Oversize fee
        self.oversize_label = QLabel()
        self.oversize_value = QLabel("$0.00")
        self.oversize_value.setStyleSheet("font-weight: bold; font-size: 16px;")
        
        # Overweight fee
        self.overweight_label = QLabel()
        self.overweight_value = QLabel("$0.00")
        self.overweight_value.setStyleSheet("font-weight: bold; font-size: 16px;")
        
        # Total
        self.total_label = QLabel()
        self.total_value = QLabel("$0.00")
        self.total_value.setStyleSheet("""
            font-weight: bold; 
            font-size: 20px; 
            color: #E20C18;
            border-top: 2px solid #1E3F8A;
            padding-top: 10px;
            margin-top: 10px;
        """)
        
        # Add to grid
        self.pricing_grid.addWidget(self.oversize_label, 0, 0)
        self.pricing_grid.addWidget(self.oversize_value, 0, 1)
        self.pricing_grid.addWidget(self.overweight_label, 1, 0)
        self.pricing_grid.addWidget(self.overweight_value, 1, 1)
        self.pricing_grid.addWidget(self.total_label, 2, 0)
        self.pricing_grid.addWidget(self.total_value, 2, 1)
        
        pricing_layout.addLayout(self.pricing_grid)
        
        # Buttons
        button_layout = QHBoxLayout()
        
        self.back_button = QPushButton()
        self.back_button.setObjectName("btn_back_tariff")
        self.back_button.clicked.connect(self.back_clicked.emit)
        
        self.pay_button = QPushButton()
        self.pay_button.setObjectName("btn_pay")
        self.pay_button.setStyleSheet("""
            QPushButton {
                background-color: #E20C18;
                color: white;
                font-size: 18px;
                padding: 15px 30px;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #C70A15;
            }
        """)
        self.pay_button.clicked.connect(self.pay_clicked.emit)
        
        button_layout.addWidget(self.back_button)
        button_layout.addStretch()
        button_layout.addWidget(self.pay_button)
        
        # Add to main layout
        layout.addLayout(lang_layout)
        layout.addWidget(self.title_label)
        layout.addWidget(self.pricing_frame)
        layout.addLayout(button_layout)
        layout.addStretch()
        
        self.setLayout(layout)
    
    def on_enter(self):
        """Called when entering tariffs screen"""
        # Get validation result from main window or previous screen
        # For now, we'll use dummy data
        self.calculate_pricing()
        self.update_display()
        self.update_texts()
    
    def calculate_pricing(self):
        """Calculate pricing based on validation result"""
        # Simplified pricing calculation
        oversize_fee = 25.0  # USD per oversize
        overweight_fee_per_kg = 5.0  # USD per kg
        
        # For demo purposes, assume some excess
        oversize_count = 1  # Assume oversize
        overweight_kg = 2.5  # Assume 2.5kg excess
        
        oversize_total = oversize_count * oversize_fee
        overweight_total = overweight_kg * overweight_fee_per_kg
        total = oversize_total + overweight_total
        
        self.pricing = {
            'oversize_fee': oversize_total,
            'overweight_fee': overweight_total,
            'total': total
        }
    
    def update_display(self):
        """Update pricing display"""
        if not self.pricing:
            return
        
        self.oversize_value.setText(f"${self.pricing['oversize_fee']:.2f}")
        self.overweight_value.setText(f"${self.pricing['overweight_fee']:.2f}")
        self.total_value.setText(f"${self.pricing['total']:.2f}")
    
    def update_texts(self):
        """Update text content based on current language"""
        current_lang = self.i18n.get_language()
        
        self.title_label.setText(self.i18n.t('tariffs.title'))
        self.oversize_label.setText(self.i18n.t('tariffs.oversize'))
        self.overweight_label.setText(self.i18n.t('tariffs.overweight'))
        self.total_label.setText(self.i18n.t('tariffs.total'))
        self.pay_button.setText(self.i18n.t('tariffs.pay'))
        self.back_button.setText(self.i18n.t('tariffs.back'))
        self.lang_toggle.setText(current_lang.upper())
    
    def toggle_language(self):
        """Toggle between Spanish and English"""
        current_lang = self.i18n.get_language()
        new_lang = 'en' if current_lang == 'es' else 'es'
        
        self.i18n.set_language(new_lang)
        self.config.set_app_setting('language', new_lang)
        
        self.update_texts()
        self.language_changed.emit(new_lang)