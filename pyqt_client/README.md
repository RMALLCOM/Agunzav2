# Airport Luggage Validation Kiosk - PyQt5 Native Client

This is a PyQt5 native desktop application for the airport luggage validation kiosk system. It provides a fullscreen touch interface for luggage scanning, validation, and payment processing.

## Features

- **Fullscreen Kiosk Interface**: Optimized for 15-inch touch screens
- **Multi-language Support**: Spanish and English with dynamic switching
- **YOLOv8 Integration**: Real-time luggage detection and classification
- **Camera Integration**: Live camera view with object detection overlay
- **Scale Integration**: Weight measurement via serial connection
- **Offline Operation**: Works 100% offline with optional backend integration
- **Touch-Friendly UI**: Large buttons and clear visual feedback
- **Complete Validation Flow**: From scanning to payment processing

## Architecture

```
pyqt_client/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── core/                  # Core application modules
│   ├── config.py          # Configuration management
│   └── i18n.py           # Internationalization
├── ui/                    # User interface screens
│   ├── base_screen.py     # Base screen class
│   ├── welcome_screen.py  # Welcome/start screen
│   ├── setup_screen.py    # Flight configuration
│   ├── start_screen.py    # Scan entry screen
│   ├── scan_screen.py     # Camera and detection screen
│   ├── validate_screen.py # Validation results
│   ├── tariffs_screen.py  # Pricing breakdown
│   ├── payment_screen.py  # Payment processing
│   └── goodbye_screen.py  # Thank you and auto-redirect
├── services/              # Business logic services
│   ├── vision/           # Computer vision services
│   │   ├── yolo_service.py    # YOLO object detection
│   │   └── calibration.py     # Pixel to CM conversion
│   └── devices/          # Hardware integration
│       └── scale_service.py   # Scale communication
├── assets/               # Static assets
│   └── lang/            # Translation files
│       ├── es.json      # Spanish translations
│       └── en.json      # English translations
└── config/              # Configuration files
    ├── app.json         # Application settings
    └── setup.json       # Flight setup data
```

## Installation

1. **Install Python 3.10+**

2. **Install dependencies:**
   ```bash
   cd pyqt_client
   pip install -r requirements.txt
   ```

3. **Configure application settings** in `config/app.json`:
   - Set `model_path` for YOLOv8 model (or leave null for simulation)
   - Configure `scale_port` and `scale_baudrate` for weight scale
   - Adjust `px_per_cm` for camera calibration

## Running the Application

```bash
cd pyqt_client
python main.py
```

The application will start in fullscreen mode. Press `Alt+F4` or use the application's navigation to exit.

## Screen Flow

1. **Welcome Screen**: Language selection and start button
2. **Setup Screen**: Configure flight details (operator, gate, flight, destination)
3. **Start Screen**: Entry point to scanning process
4. **Scan Screen**: Camera view with live YOLO detection and measurements
5. **Validate Screen**: Show compliance results (OK/FAIL)
6. **Tariffs Screen**: Pricing breakdown for non-compliant luggage
7. **Payment Screen**: Payment processing simulation
8. **Goodbye Screen**: Thank you message with auto-redirect to start

## Key Features

### YOLO Integration
- Real-time object detection for luggage classification
- Support for maleta, mochila, bolso, and other categories
- Bounding box visualization with confidence scores
- Fallback to simulation mode if model is not available

### Camera Calibration
- Simple pixel-to-centimeter conversion using `px_per_cm` ratio
- Optional homography matrix support for perspective correction
- Automatic measurement calculation from bounding boxes

### Scale Integration
- Serial communication with weight scales
- Configurable port and baud rate settings
- Automatic fallback to simulation mode
- Support for tare functionality

### Multi-language Support
- Dynamic language switching without restart
- Comprehensive translations for all UI elements
- Language preference persistence

### Touch Interface
- Large, touch-friendly buttons
- Clear visual feedback for interactions
- Hidden setup access via triple-tap
- Responsive layout for different screen sizes

## Configuration

### Application Settings (`config/app.json`)
```json
{
  "language": "es",                    // Default language (es/en)
  "model_path": "path/to/yolo.pt",    // YOLOv8 model path (null for simulation)
  "px_per_cm": 10.0,                  // Pixel to centimeter conversion ratio
  "homography_matrix": null,          // Optional perspective correction matrix
  "scale_port": "COM3",               // Serial port for scale
  "scale_baudrate": 9600,             // Baud rate for scale communication
  "backend_url": "http://localhost:8001/api",  // Optional backend API
  "offline_mode": true                // Enable offline operation
}
```

### Flight Setup (`config/setup.json`)
```json
{
  "operator_name": "Operator Name",
  "gate": "A1",
  "flight_number": "JAT36",
  "destination": "Antofagasta — ANF",
  "is_international": false
}
```

## Hardware Requirements

- **Camera**: USB camera or built-in webcam
- **Scale**: Serial-connected weight scale (optional, simulation available)
- **Display**: 15-inch touch screen (1920x1080 or 1366x768)
- **OS**: Windows 10+, Linux, or macOS

## Development

### Adding New Screens
1. Create screen class inheriting from `BaseScreen`
2. Implement `setup_ui()` and `update_texts()` methods
3. Add screen to `KioskMainWindow.init_screens()`
4. Set up navigation signals in `setup_navigation()`

### Adding Translations
1. Add keys to `assets/lang/es.json` and `assets/lang/en.json`
2. Use `self.i18n.t('key.subkey')` in screen classes
3. Call `update_texts()` on language change

### Integrating Hardware
1. Create service class in appropriate `services/` subdirectory
2. Handle connection errors gracefully
3. Provide simulation mode for development/testing
4. Initialize service in relevant screen class

## Testing

### Manual Testing Scenarios

**OK Flow:**
1. Welcome → Setup (save) → Start → Scan → Validate(OK) → Continue → Goodbye → Start

**FAIL Flow:**
1. Welcome → Setup → Start → Scan → Validate(FAIL) → Continue to Payment → Tariffs → Pay → Payment(Finish) → Goodbye → Start

**Language Switching:**
1. Change language in Welcome screen
2. Navigate to Scan screen
3. Verify all texts are translated (no language toggle visible in Scan)

**Hidden Setup Access:**
1. Go to Scan screen
2. Triple-tap top-left corner (60x60px area)
3. Should navigate to Setup screen

### Fullscreen Testing
- Test on 1920×1080 resolution
- Test on 1366×768 resolution
- Verify buttons don't overlap
- Ensure touch targets are adequate size

## Integration with Backend

The application can optionally integrate with the FastAPI backend:
- Validation rules from `/api/rules` endpoint
- Session management via `/api/sessions`
- Payment processing via `/api/payments`

Set `offline_mode: false` in `app.json` to enable backend integration.

## Troubleshooting

### Common Issues

**Camera not working:**
- Check camera permissions
- Verify camera is not used by another application
- Application will fall back to simulation mode

**Scale not responding:**
- Check serial port configuration
- Verify scale is powered and connected
- Check baud rate settings
- Application will use simulation mode if connection fails

**YOLO model not loading:**
- Verify model path in `app.json`
- Check if ultralytics is properly installed
- Application will use simulation mode if model loading fails

**Display issues:**
- Check screen resolution settings
- Verify PyQt5 is properly installed with display support
- Test with different screen resolutions