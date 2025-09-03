"""
Validate screen - Display validation results
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame, QListWidget, QListWidgetItem)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont
from .base_screen import BaseScreen


class ValidateScreen(BaseScreen):
    continue_ok_clicked = pyqtSignal()
    continue_to_payment_clicked = pyqtSignal()
    language_changed = pyqtSignal(str)
    
    def __init__(self, main_window):
        super().__init__(main_window)
        self.scan_result = None
        self.validation_result = None
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
        
        # Result card
        self.result_frame = QFrame()
        self.result_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border-radius: 10px;
                padding: 30px;
                margin: 20px;
            }
        """)
        
        result_layout = QVBoxLayout(self.result_frame)
        
        # Result status
        self.result_label = QLabel()
        self.result_label.setObjectName("lbl_result")
        self.result_label.setAlignment(Qt.AlignCenter)
        self.result_label.setStyleSheet("""
            QLabel {
                font-size: 32px;
                font-weight: bold;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
            }
        """)
        
        # Result message
        self.message_label = QLabel()
        self.message_label.setAlignment(Qt.AlignCenter)
        self.message_label.setStyleSheet("""
            QLabel {
                font-size: 18px;
                margin-bottom: 20px;
            }
        """)
        
        # Reasons list (for failures)
        self.reasons_label = QLabel()
        self.reasons_label.setObjectName("lbl_reasons")
        self.reasons_label.setStyleSheet("""
            QLabel {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
            }
        """)
        
        self.reasons_list = QListWidget()
        self.reasons_list.setStyleSheet("""
            QListWidget {
                border: 1px solid #ccc;
                border-radius: 5px;
                background-color: #f9f9f9;
                padding: 10px;
                margin-bottom: 20px;
            }
            QListWidgetItem {
                color: #E20C18;
                font-weight: bold;
                padding: 5px;
            }
        """)
        
        result_layout.addWidget(self.result_label)
        result_layout.addWidget(self.message_label)
        result_layout.addWidget(self.reasons_label)
        result_layout.addWidget(self.reasons_list)
        
        # Buttons
        self.button_layout = QHBoxLayout()
        
        self.continue_ok_button = QPushButton()
        self.continue_ok_button.setObjectName("btn_continue_validate_ok")
        self.continue_ok_button.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                font-size: 18px;
                padding: 15px 30px;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #218838;
            }
        """)
        self.continue_ok_button.clicked.connect(self.continue_ok_clicked.emit)
        
        self.continue_to_payment_button = QPushButton()
        self.continue_to_payment_button.setObjectName("btn_continue_to_payment")
        self.continue_to_payment_button.setStyleSheet("""
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
        self.continue_to_payment_button.clicked.connect(self.continue_to_payment_clicked.emit)
        
        result_layout.addLayout(self.button_layout)
        
        # Add to main layout
        layout.addLayout(lang_layout)
        layout.addWidget(self.result_frame)
        layout.addStretch()
        
        self.setLayout(layout)
    
    def set_result(self, scan_result):
        """Set scan result and perform validation"""
        self.scan_result = scan_result
        self.validation_result = self.validate_luggage(scan_result)
        self.update_display()
    
    def validate_luggage(self, scan_result):
        """Validate luggage based on rules"""
        # Get airline rules (simplified for demo)
        max_width = 35.0  # cm
        max_length = 55.0  # cm
        max_weight = 10.0  # kg
        max_linear = 115.0  # cm
        
        width = scan_result.get('width_cm', 0)
        length = scan_result.get('length_cm', 0)
        weight = scan_result.get('weight_kg', 0)
        
        errors = []
        
        # Check dimensions
        if width > max_width:
            errors.append(f"Excede ancho {width - max_width:.1f} cm")
        
        if length > max_length:
            errors.append(f"Excede largo {length - max_length:.1f} cm")
        
        # Check weight
        if weight > max_weight:
            errors.append(f"Excede peso {weight - max_weight:.1f} kg")
        
        # Check linear dimensions
        linear = width + length
        if linear > max_linear:
            errors.append(f"Excede suma lineal {linear - max_linear:.1f} cm")
        
        return {
            'compliant': len(errors) == 0,
            'errors': errors,
            'measurements': {
                'width_cm': width,
                'length_cm': length,
                'weight_kg': weight
            }
        }
    
    def update_display(self):
        """Update display based on validation result"""
        if not self.validation_result:
            return
        
        # Clear button layout
        for i in reversed(range(self.button_layout.count())):
            self.button_layout.itemAt(i).widget().setParent(None)
        
        if self.validation_result['compliant']:
            # Show OK result
            self.result_label.setText(self.i18n.t('validate.ok'))
            self.result_label.setStyleSheet(self.result_label.styleSheet() + "background-color: #28a745; color: white;")
            self.message_label.setText(self.i18n.t('validate.ok_message'))
            
            # Hide reasons
            self.reasons_label.hide()
            self.reasons_list.hide()
            
            # Show continue button
            self.button_layout.addStretch()
            self.button_layout.addWidget(self.continue_ok_button)
            self.button_layout.addStretch()
            
        else:
            # Show FAIL result
            self.result_label.setText(self.i18n.t('validate.fail'))
            self.result_label.setStyleSheet(self.result_label.styleSheet() + "background-color: #E20C18; color: white;")
            self.message_label.setText("")
            
            # Show reasons
            self.reasons_label.show()
            self.reasons_list.show()
            self.reasons_list.clear()
            
            for error in self.validation_result['errors']:
                item = QListWidgetItem(error)
                self.reasons_list.addItem(item)
            
            # Show payment button
            self.button_layout.addStretch()
            self.button_layout.addWidget(self.continue_to_payment_button)
            self.button_layout.addStretch()
        
        self.update_texts()
    
    def update_texts(self):
        """Update text content based on current language"""
        current_lang = self.i18n.get_language()
        
        if self.validation_result:
            if self.validation_result['compliant']:
                self.continue_ok_button.setText(self.i18n.t('validate.continue_ok'))
            else:
                self.continue_to_payment_button.setText(self.i18n.t('validate.continue_to_payment'))
        
        self.reasons_label.setText("Razones:" if current_lang == 'es' else "Reasons:")
        self.lang_toggle.setText(current_lang.upper())
    
    def toggle_language(self):
        """Toggle between Spanish and English"""
        current_lang = self.i18n.get_language()
        new_lang = 'en' if current_lang == 'es' else 'es'
        
        self.i18n.set_language(new_lang)
        self.config.set_app_setting('language', new_lang)
        
        # Re-validate to update error messages in new language
        if self.scan_result:
            self.validation_result = self.validate_luggage(self.scan_result)
            self.update_display()
        
        self.language_changed.emit(new_lang)