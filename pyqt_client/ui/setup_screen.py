"""
Setup screen - Flight configuration
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QComboBox, QLineEdit, QCheckBox, QFormLayout,
                             QFrame)
from PyQt5.QtCore import Qt, pyqtSignal
from .base_screen import BaseScreen


class SetupScreen(BaseScreen):
    setup_saved = pyqtSignal()
    back_clicked = pyqtSignal()
    language_changed = pyqtSignal(str)
    
    def __init__(self, main_window):
        super().__init__(main_window)
        self.setup_ui()
        self.load_current_setup()
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
        
        # Form
        form_frame = QFrame()
        form_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
            }
        """)
        
        form_layout = QFormLayout(form_frame)
        form_layout.setSpacing(20)
        
        # Operator name
        self.operator_label = QLabel()
        self.operator_input = QLineEdit()
        self.operator_input.setObjectName("in_operator")
        
        # Gate
        self.gate_label = QLabel()
        self.gate_combo = QComboBox()
        self.gate_combo.setObjectName("cmb_gate")
        self.gate_combo.addItems(["A1", "A2", "A3", "A4", "A5"])
        
        # Flight number
        self.flight_label = QLabel()
        self.flight_combo = QComboBox()
        self.flight_combo.setObjectName("cmb_flight")
        self.flight_combo.addItems(["JAT36", "JAT40", "JAT50", "JAT811", "JAT56"])
        
        # Destination
        self.destination_label = QLabel()
        self.destination_combo = QComboBox()
        self.destination_combo.setObjectName("cmb_destination")
        destinations = [
            "Antofagasta — ANF",
            "Arica — ACM", 
            "Temuco — ZCO",
            "Valdivia — ZAL",
            "Puerto Montt — PMC"
        ]
        self.destination_combo.addItems(destinations)
        
        # International checkbox
        self.international_checkbox = QCheckBox()
        self.international_checkbox.setObjectName("chk_international")
        
        # Add to form
        form_layout.addRow(self.operator_label, self.operator_input)
        form_layout.addRow(self.gate_label, self.gate_combo)
        form_layout.addRow(self.flight_label, self.flight_combo)
        form_layout.addRow(self.destination_label, self.destination_combo)
        form_layout.addRow(self.international_checkbox)
        
        # Buttons
        button_layout = QHBoxLayout()
        
        self.save_button = QPushButton()
        self.save_button.setObjectName("btn_save_setup")
        self.save_button.setStyleSheet("""
            QPushButton {
                background-color: #1E3F8A;
                color: white;
                font-size: 18px;
                padding: 15px 30px;
            }
            QPushButton:hover {
                background-color: #2D4F9A;
            }
        """)
        self.save_button.clicked.connect(self.save_setup)
        
        self.back_button = QPushButton()
        self.back_button.setObjectName("btn_back_setup")
        self.back_button.clicked.connect(self.back_clicked.emit)
        
        button_layout.addWidget(self.back_button)
        button_layout.addStretch()
        button_layout.addWidget(self.save_button)
        
        # Add to main layout
        layout.addLayout(lang_layout)
        layout.addWidget(self.title_label)
        layout.addWidget(form_frame)
        layout.addLayout(button_layout)
        layout.addStretch()
        
        self.setLayout(layout)
    
    def load_current_setup(self):
        """Load current setup configuration"""
        setup = self.config.load_setup_config()
        
        self.operator_input.setText(setup.get('operator_name', ''))
        
        gate = setup.get('gate', 'A1')
        index = self.gate_combo.findText(gate)
        if index >= 0:
            self.gate_combo.setCurrentIndex(index)
        
        flight = setup.get('flight_number', 'JAT36')
        index = self.flight_combo.findText(flight)
        if index >= 0:
            self.flight_combo.setCurrentIndex(index)
        
        destination = setup.get('destination', 'Antofagasta — ANF')
        index = self.destination_combo.findText(destination)
        if index >= 0:
            self.destination_combo.setCurrentIndex(index)
        
        self.international_checkbox.setChecked(setup.get('is_international', False))
    
    def save_setup(self):
        """Save setup configuration"""
        setup_data = {
            'operator_name': self.operator_input.text(),
            'gate': self.gate_combo.currentText(),
            'flight_number': self.flight_combo.currentText(),
            'destination': self.destination_combo.currentText(),
            'is_international': self.international_checkbox.isChecked()
        }
        
        self.config.save_setup_config(setup_data)
        self.setup_saved.emit()
    
    def update_texts(self):
        """Update text content based on current language"""
        current_lang = self.i18n.get_language()
        
        self.title_label.setText(self.i18n.t('setup.title'))
        self.operator_label.setText(self.i18n.t('setup.operator'))
        self.gate_label.setText(self.i18n.t('setup.gate'))
        self.flight_label.setText(self.i18n.t('setup.flight'))
        self.destination_label.setText(self.i18n.t('setup.destination'))
        self.international_checkbox.setText(self.i18n.t('setup.international'))
        self.save_button.setText(self.i18n.t('setup.save'))
        self.back_button.setText(self.i18n.t('setup.back'))
        self.lang_toggle.setText(current_lang.upper())
    
    def toggle_language(self):
        """Toggle between Spanish and English"""
        current_lang = self.i18n.get_language()
        new_lang = 'en' if current_lang == 'es' else 'es'
        
        self.i18n.set_language(new_lang)
        self.config.set_app_setting('language', new_lang)
        
        self.update_texts()
        self.language_changed.emit(new_lang)