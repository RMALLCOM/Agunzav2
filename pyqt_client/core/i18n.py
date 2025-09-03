"""
Internationalization (i18n) support for the kiosk application
"""

import json
import os
from typing import Dict, Any


class I18nManager:
    def __init__(self):
        self.assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'lang')
        self.current_language = 'es'
        self.translations = {}
        
        # Ensure assets directory exists
        os.makedirs(self.assets_dir, exist_ok=True)
        
        # Load translations
        self.load_translations()
    
    def load_translations(self):
        """Load all translation files"""
        for lang in ['es', 'en']:
            lang_file = os.path.join(self.assets_dir, f'{lang}.json')
            try:
                with open(lang_file, 'r', encoding='utf-8') as f:
                    self.translations[lang] = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                # Create default translation file if it doesn't exist
                self.translations[lang] = self._get_default_translations(lang)
                self._save_translation_file(lang)
    
    def _get_default_translations(self, lang: str) -> Dict[str, Any]:
        """Get default translations for a language"""
        if lang == 'es':
            return {
                "welcome": {
                    "title": "Bienvenido",
                    "start": "INICIAR"
                },
                "setup": {
                    "title": "Configurador de vuelos",
                    "operator": "Operador",
                    "gate": "Puerta de embarque",
                    "flight": "N° de vuelo",
                    "destination": "Destino",
                    "international": "Internacional",
                    "save": "GUARDAR",
                    "back": "VOLVER"
                },
                "start": {
                    "title": "JetSMART",
                    "go_scan": "COMENZAR ESCANEO"
                },
                "scan": {
                    "title": "Escaneo",
                    "continue": "CONTINUAR",
                    "back": "VOLVER",
                    "bagdata": "Datos de la maleta",
                    "width": "Ancho (cm)",
                    "length": "Largo (cm)",
                    "weight": "Peso (kg)",
                    "calibration": "Calibración",
                    "calibration_ok": "OK"
                },
                "validate": {
                    "ok": "AUTORIZADO",
                    "ok_message": "Autorizado para embarque. ¡Buen viaje!",
                    "fail": "NO CUMPLE",
                    "continue_ok": "CONTINUAR",
                    "continue_to_payment": "CONTINUAR AL PAGO"
                },
                "tariffs": {
                    "title": "Tarifas y Pago",
                    "oversize": "Exceso de medidas",
                    "overweight": "Exceso de peso",
                    "total": "Total a pagar",
                    "pay": "PAGAR",
                    "back": "VOLVER"
                },
                "payment": {
                    "title": "Pago",
                    "approved": "Pago aprobado",
                    "declined": "Pago rechazado",
                    "print_receipt": "IMPRIMIR RECIBO",
                    "finish": "FINALIZAR"
                },
                "goodbye": {
                    "title": "Gracias por usar el validador. Buen viaje"
                }
            }
        else:  # English
            return {
                "welcome": {
                    "title": "Welcome",
                    "start": "START"
                },
                "setup": {
                    "title": "Flight configurator",
                    "operator": "Operator",
                    "gate": "Gate",
                    "flight": "Flight #",
                    "destination": "Destination",
                    "international": "International",
                    "save": "SAVE",
                    "back": "BACK"
                },
                "start": {
                    "title": "JetSMART",
                    "go_scan": "START SCAN"
                },
                "scan": {
                    "title": "Scan",
                    "continue": "CONTINUE",
                    "back": "BACK",
                    "bagdata": "Bag data",
                    "width": "Width (cm)",
                    "length": "Length (cm)",
                    "weight": "Weight (kg)",
                    "calibration": "Calibration",
                    "calibration_ok": "OK"
                },
                "validate": {
                    "ok": "AUTHORIZED",
                    "ok_message": "Authorized for boarding. Have a nice trip!",
                    "fail": "NOT ALLOWED",
                    "continue_ok": "CONTINUE",
                    "continue_to_payment": "PROCEED TO PAYMENT"
                },
                "tariffs": {
                    "title": "Pricing & Payment",
                    "oversize": "Oversize fee",
                    "overweight": "Overweight fee",
                    "total": "Total amount",
                    "pay": "PAY",
                    "back": "BACK"
                },
                "payment": {
                    "title": "Payment",
                    "approved": "Payment approved",
                    "declined": "Payment declined",
                    "print_receipt": "PRINT RECEIPT",
                    "finish": "FINISH"
                },
                "goodbye": {
                    "title": "Thank you for using the validator. Have a nice trip"
                }
            }
    
    def _save_translation_file(self, lang: str):
        """Save translation file"""
        lang_file = os.path.join(self.assets_dir, f'{lang}.json')
        with open(lang_file, 'w', encoding='utf-8') as f:
            json.dump(self.translations[lang], f, indent=2, ensure_ascii=False)
    
    def set_language(self, language: str):
        """Set current language"""
        if language in self.translations:
            self.current_language = language
    
    def get_language(self) -> str:
        """Get current language"""
        return self.current_language
    
    def t(self, key: str, default: str = "") -> str:
        """Get translation for a key (dot notation supported)"""
        keys = key.split('.')
        current = self.translations.get(self.current_language, {})
        
        for k in keys:
            if isinstance(current, dict) and k in current:
                current = current[k]
            else:
                return default
        
        return str(current) if current is not None else default
    
    def get_available_languages(self) -> list:
        """Get list of available languages"""
        return list(self.translations.keys())