# PyQt5 Kiosk (JetSMART)

## Requisitos
- Python 3.9–3.11
- Windows o Linux con cámara USB (opcional)

## Instalación
```bash
cd pyqt_kiosk
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python main.py
```

## Configuración
Archivos en `config/`:
- `theme.json` — colores y lenguaje
- `devices.json` — cámara/balanza y `simulate`
- `rules/current.json` — perfiles y tolerancia

Los placeholders de imágenes están en `assets/ui/` y puedes reemplazarlos por los definitivos.