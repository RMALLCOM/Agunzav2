"""
Demo mode management for the kiosk application
"""

from PyQt5.QtCore import QSettings
from typing import Optional


class DemoManager:
    def __init__(self):
        self.settings = QSettings("JetSMART", "KioskValidator")
        self._demo_mode = None
    
    def get_demo_mode(self) -> bool:
        """Get current demo mode status"""
        if self._demo_mode is None:
            self._demo_mode = self.settings.value("demoMode", False, type=bool)
        return self._demo_mode
    
    def set_demo_mode(self, enabled: bool):
        """Set demo mode status"""
        self._demo_mode = enabled
        self.settings.setValue("demoMode", enabled)
        self.settings.sync()
    
    def toggle_demo_mode(self) -> bool:
        """Toggle demo mode and return new status"""
        new_status = not self.get_demo_mode()
        self.set_demo_mode(new_status)
        return new_status


# Global instance
demo_manager = DemoManager()