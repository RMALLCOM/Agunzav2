# JetSMART Validador de Equipaje - Ejecución Local

Requisitos:
- Python 3.10+ (recomendado 3.10/3.11)
- Node.js 18+ y Yarn
- Cámara disponible

## Linux/macOS
1. Dar permisos y ejecutar
```
chmod +x run_local.sh
./run_local.sh
```
- Backend: http://localhost:8001 (ALWAYS_COMPLY=1 para que todo "cumple")
- Frontend: http://localhost:3000
- Imagen de fondo: coloque su archivo en `frontend/public/assets/jetsmart_bg.jpg`
- Fotos capturadas: Escritorio/imagenes_ia

## Windows (PowerShell)
Ejecutar:
```
./run_local.ps1
```
- Backend: http://localhost:8001 (ALWAYS_COMPLY=1 habilitado)
- Frontend: http://localhost:3000

## Notas
- El botón VOLVER en cámara regresa a la vista "Comenzar escaneo" dentro de la misma página.
- Orientación: en landscape resultados a la derecha; en portrait resultados abajo.
- Para volver a validación real: desactive el flag ambiental `ALWAYS_COMPLY` en el backend y reinicie.
