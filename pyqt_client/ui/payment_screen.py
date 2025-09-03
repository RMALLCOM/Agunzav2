"""
Payment screen - Process payment and show results
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame)
from PyQt5.QtCore import Qt, pyqtSignal, QTimer
from .base_screen import BaseScreen
import random


class PaymentScreen(BaseScreen):
    finish_clicked = pyqtSignal()
    language_changed = pyqtSignal(str)
    
    def __init__(self, main_window):
        super().__init__(main_window)
        self.payment_processed = False
        self.payment_approved = False
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
        
        # Payment status card
        self.status_frame = QFrame()
        self.status_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border-radius: 10px;
                padding: 40px;
                margin: 20px;
            }
        """)
        
        status_layout = QVBoxLayout(self.status_frame)
        
        # Status message
        self.status_label = QLabel()
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
        """)
        
        # Processing message
        self.processing_label = QLabel("Procesando pago...")
        self.processing_label.setAlignment(Qt.AlignCenter)
        self.processing_label.setStyleSheet("""
            QLabel {
                font-size: 18px;
                color: #666;
                margin-bottom: 20px;
            }
        """)
        
        status_layout.addWidget(self.status_label)
        status_layout.addWidget(self.processing_label)
        
        # Buttons
        self.button_layout = QHBoxLayout()
        
        self.print_receipt_button = QPushButton()
        self.print_receipt_button.setObjectName("btn_print_receipt")
        self.print_receipt_button.setStyleSheet("""
            QPushButton {
                background-color: #6c757d;
                color: white;
                font-size: 16px;
                padding: 12px 24px;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #5a6268;
            }
        """)
        self.print_receipt_button.clicked.connect(self.print_receipt)
        self.print_receipt_button.hide()
        
        self.finish_button = QPushButton()
        self.finish_button.setObjectName("btn_finish_payment")
        self.finish_button.setStyleSheet("""
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
        self.finish_button.clicked.connect(self.finish_clicked.emit)
        self.finish_button.hide()
        
        status_layout.addLayout(self.button_layout)
        
        # Add to main layout
        layout.addLayout(lang_layout)
        layout.addWidget(self.title_label)
        layout.addWidget(self.status_frame)
        layout.addStretch()
        
        self.setLayout(layout)
    
    def on_enter(self):
        """Called when entering payment screen"""
        self.process_payment()
        self.update_texts()
    
    def process_payment(self):
        """Simulate payment processing"""
        self.payment_processed = False
        self.processing_label.show()
        self.status_label.setText("Procesando pago...")
        self.status_label.setStyleSheet(self.status_label.styleSheet() + "background-color: #ffc107; color: black;")
        
        # Hide buttons
        self.print_receipt_button.hide()
        self.finish_button.hide()
        
        # Simulate payment processing delay
        QTimer.singleShot(3000, self.payment_completed)
    
    def payment_completed(self):
        """Handle payment completion"""
        self.payment_processed = True
        self.payment_approved = random.choice([True, True, True, False])  # 75% success rate
        
        self.processing_label.hide()
        
        if self.payment_approved:
            self.status_label.setText(self.i18n.t('payment.approved'))
            self.status_label.setStyleSheet(self.status_label.styleSheet() + "background-color: #28a745; color: white;")
            
            # Show buttons
            self.button_layout.addWidget(self.print_receipt_button)
            self.button_layout.addStretch()
            self.button_layout.addWidget(self.finish_button)
            
            self.print_receipt_button.show()
            self.finish_button.show()
        else:
            self.status_label.setText(self.i18n.t('payment.declined'))
            self.status_label.setStyleSheet(self.status_label.styleSheet() + "background-color: #dc3545; color: white;")
            
            # For declined payments, you might want to add retry options
            # For now, we'll just show a finish button after a delay
            QTimer.singleShot(3000, self.show_finish_button)
    
    def show_finish_button(self):
        """Show finish button for declined payments"""
        self.button_layout.addStretch()
        self.button_layout.addWidget(self.finish_button)
        self.finish_button.show()
    
    def print_receipt(self):
        """Handle receipt printing (stub)"""
        # This is a stub for POS integration
        print("Printing receipt...")
        
        # In a real implementation, this would interface with a POS printer
        # For now, we'll just show a message
        self.processing_label.setText("Imprimiendo recibo...")
        self.processing_label.show()
        
        QTimer.singleShot(2000, lambda: self.processing_label.hide())
    
    def update_texts(self):
        """Update text content based on current language"""
        current_lang = self.i18n.get_language()
        
        self.title_label.setText(self.i18n.t('payment.title'))
        self.print_receipt_button.setText(self.i18n.t('payment.print_receipt'))
        self.finish_button.setText(self.i18n.t('payment.finish'))
        self.lang_toggle.setText(current_lang.upper())
        
        # Update status if payment is processed
        if self.payment_processed:
            if self.payment_approved:
                self.status_label.setText(self.i18n.t('payment.approved'))
            else:
                self.status_label.setText(self.i18n.t('payment.declined'))
    
    def toggle_language(self):
        """Toggle between Spanish and English"""
        current_lang = self.i18n.get_language()
        new_lang = 'en' if current_lang == 'es' else 'es'
        
        self.i18n.set_language(new_lang)
        self.config.set_app_setting('language', new_lang)
        
        self.update_texts()
        self.language_changed.emit(new_lang)