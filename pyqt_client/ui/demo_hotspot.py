"""
Demo hotspot widget - Hidden button for activating demo mode
"""

from PyQt5.QtWidgets import QLabel, QMessageBox
from PyQt5.QtCore import Qt, QTimer, pyqtSignal
from PyQt5.QtGui import QMouseEvent


class DemoHotspot(QLabel):
    demo_activated = pyqtSignal()
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        # Setup invisible hotspot
        self.setFixedSize(36, 36)
        self.setStyleSheet("""
            QLabel {
                background-color: transparent;
                border: none;
            }
        """)
        self.setToolTip("Technical area (tap 5 times)")
        
        # Tap counting
        self.tap_count = 0
        self.tap_timer = QTimer()
        self.tap_timer.timeout.connect(self.reset_tap_count)
        self.tap_timer.setSingleShot(True)
        
        # Required taps and timeout
        self.required_taps = 5
        self.timeout_ms = 3000  # 3 seconds
    
    def mousePressEvent(self, event: QMouseEvent):
        """Handle mouse press events for tap counting"""
        if event.button() == Qt.LeftButton:
            self.tap_count += 1
            
            if self.tap_count == 1:
                # Start timer on first tap
                self.tap_timer.start(self.timeout_ms)
            elif self.tap_count >= self.required_taps:
                # Activate demo mode
                self.tap_timer.stop()
                self.tap_count = 0
                self.activate_demo_mode()
        
        super().mousePressEvent(event)
    
    def activate_demo_mode(self):
        """Activate demo mode and show confirmation"""
        # Import here to avoid circular imports
        from ..core.demo_manager import demo_manager
        
        demo_manager.set_demo_mode(True)
        
        # Show confirmation message
        msg_box = QMessageBox(self)
        msg_box.setWindowTitle("Demo Mode")
        msg_box.setText("Modo demo activado" if self.get_language() == 'es' else "Demo mode activated")
        msg_box.setIcon(QMessageBox.Information)
        msg_box.exec_()
        
        # Emit signal
        self.demo_activated.emit()
    
    def reset_tap_count(self):
        """Reset tap count when timer expires"""
        self.tap_count = 0
    
    def get_language(self) -> str:
        """Get current language from parent or default to Spanish"""
        parent = self.parent()
        while parent:
            if hasattr(parent, 'i18n'):
                return parent.i18n.get_language()
            parent = parent.parent()
        return 'es'