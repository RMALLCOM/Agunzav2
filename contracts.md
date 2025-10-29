# JetSMART Validador de Equipaje – API Contracts (v1)

Estado: listo para implementación local 100% offline. Sin BD remota. Guardado de imágenes en Escritorio/imagenes_ia.

## 1) Endpoints (prefijo /api)

- GET /api/health
  - 200 { status: "ok" }

- GET /api/rules
  - 200 { L: 55, W: 35, H: 25, KG: 10 }

- GET /api/config
  - 200 { operator, gate, flight, destination, international }
  - 404 si no existe

- POST /api/config
  - body: { operator, gate, flight, destination, international }
  - 200 { ok: true }
  - Persiste en archivo local: ~/.jetsmart_kiosk/config.json (sin SQLite)

- POST /api/scan/start
  - body JSON: { file_name: string, mime: string ("image/jpeg"), total_size: number }
  - 200 { upload_id: string, chunk_size: number }
  - Crea archivo temporal para acumulación de chunks

- POST /api/scan/chunk
  - multipart/form-data: { upload_id, chunk_index, total_chunks, chunk (file) }
  - 200 { received: number }

- POST /api/scan/finish
  - body JSON: { upload_id }
  - 200 { saved_path: string, file_name: string, results: ScanResult }

### ScanResult
```
{
  L: number,
  W: number,
  H: number,
  KG: number,
  calibrationOk: boolean,
  complies: boolean,
  reasons: Array<{ code: "L"|"W"|"H"|"S"|"KG", label: string }>,
  overages: { overL, overW, overH, overKG, overLinear }
}
```

## 2) Qué datos están mockeados
- Medición (L/W/H/KG) y validación se simulan en backend (random cercano a reglas). No hay visión por computadora real.
- Tarifas se calculan en frontend (mock) con reglas simples.

## 3) Implementación backend
- Guardado de imágenes: Desktop/imagenes_ia/equipaje_{fecha-hora}.jpg (crea carpeta si no existe). Soporta Windows y Linux; intenta Desktop, Escritorio o XDG.
- Subida en chunks: start → chunk (append) → finish (mover a carpeta final).
- Config en archivo local ~/.jetsmart_kiosk/config.json
- CORS abierto.

## 4) Integración frontend
- Reemplazar captura mock por:
  1) Capturar frame de video a canvas → Blob JPEG
  2) api.scanUpload(blob) → usa /scan/start + /scan/chunk + /scan/finish
  3) Mostrar progreso y resultados devueltos por backend
- Mantener streaming en vivo con getUserMedia.
- Rutas: / → /config (INICIAR). Al guardar config → /scan. Botón oculto (triple click) en esquina sup. izq. de /scan (vista previa) para volver a /config.

## 5) Errores comunes
- Permisos de cámara bloqueados: mostrar mensaje claro.
- Escritorio no encontrado: fallback a ~/imagenes_ia.
- Cortes durante upload: reintentar chunks (v2 opcional).

