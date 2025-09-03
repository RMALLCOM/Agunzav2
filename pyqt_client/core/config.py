"""
Configuration management for the kiosk application
"""

import json
import os
from typing import Dict, Any, Optional


class ConfigManager:
    def __init__(self):
        self.config_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config')
        self.setup_file = os.path.join(self.config_dir, 'setup.json')
        self.app_file = os.path.join(self.config_dir, 'app.json')
        
        # Ensure config directory exists
        os.makedirs(self.config_dir, exist_ok=True)
        
        # Initialize default configs if they don't exist
        self._init_default_configs()
    
    def _init_default_configs(self):
        """Initialize default configuration files"""
        # Default app config
        default_app_config = {
            "language": "es",
            "model_path": None,
            "px_per_cm": 10.0,
            "homography_matrix": None,
            "scale_port": "COM3",
            "scale_baudrate": 9600,
            "backend_url": "http://localhost:8001/api",
            "offline_mode": True
        }
        
        # Default setup config
        default_setup_config = {
            "operator_name": "",
            "gate": "A1",
            "flight_number": "JAT36",
            "destination": "Antofagasta — ANF",
            "is_international": False
        }
        
        if not os.path.exists(self.app_file):
            self.save_app_config(default_app_config)
        
        if not os.path.exists(self.setup_file):
            self.save_setup_config(default_setup_config)
    
    def load_app_config(self) -> Dict[str, Any]:
        """Load application configuration"""
        try:
            with open(self.app_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def save_app_config(self, config: Dict[str, Any]):
        """Save application configuration"""
        with open(self.app_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    
    def load_setup_config(self) -> Dict[str, Any]:
        """Load setup configuration"""
        try:
            with open(self.setup_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def save_setup_config(self, config: Dict[str, Any]):
        """Save setup configuration"""
        with open(self.setup_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    
    def get_app_setting(self, key: str, default: Any = None) -> Any:
        """Get a specific app setting"""
        config = self.load_app_config()
        return config.get(key, default)
    
    def set_app_setting(self, key: str, value: Any):
        """Set a specific app setting"""
        config = self.load_app_config()
        config[key] = value
        self.save_app_config(config)
    
    def get_setup_setting(self, key: str, default: Any = None) -> Any:
        """Get a specific setup setting"""
        config = self.load_setup_config()
        return config.get(key, default)
    
    def set_setup_setting(self, key: str, value: Any):
        """Set a specific setup setting"""
        config = self.load_setup_config()
        config[key] = value
        self.save_setup_config(config)