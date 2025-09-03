"""
Scan screen - Camera view with YOLO detection and measurements
"""

from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame, QGridLayout)
from PyQt5.QtCore import Qt, pyqtSignal, QTimer, QThread, pyqtSlot
from PyQt5.QtGui import QPixmap, QImage, QPainter, QPen, QColor
import cv2
import numpy as np
from .base_screen import BaseScreen
from ..services.vision.yolo_service import YOLOService
from ..services.vision.calibration import CalibrationService
from ..services.devices.scale_service import ScaleService


class CameraThread(QThread):
    frame_ready = pyqtSignal(np.ndarray)
    
    def __init__(self):
        super().__init__()
        self.camera = None
        self.running = False
    
    def start_camera(self):
        """Start camera capture"""
        try:
            self.camera = cv2.VideoCapture(0)
            if not self.camera.isOpened():
                # Use a dummy frame if no camera available
                self.camera = None
            self.running = True
            self.start()
        except Exception as e:
            print(f"Error starting camera: {e}")
            self.camera = None
            self.running = True
            self.start()
    
    def stop_camera(self):
        """Stop camera capture"""
        self.running = False
        if self.camera:
            self.camera.release()
            self.camera = None
        self.quit()
        self.wait()
    
    def run(self):
        """Camera capture loop"""
        while self.running:
            if self.camera and self.camera.isOpened():
                ret, frame = self.camera.read()
                if ret:
                    self.frame_ready.emit(frame)
            else:
                # Generate dummy frame for testing
                dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
                dummy_frame.fill(50)
                # Add some pattern
                cv2.putText(dummy_frame, "CAMERA SIMULATION", (180, 240), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                self.frame_ready.emit(dummy_frame)
            
            self.msleep(33)  # ~30 FPS


class ScanScreen(BaseScreen):
    continue_clicked = pyqtSignal(dict)
    back_clicked = pyqtSignal()
    setup_clicked = pyqtSignal()
    free_weigh_clicked = pyqtSignal()
    
    def __init__(self, main_window):
        super().__init__(main_window)
        
        # Initialize services
        model_path = self.config.get_app_setting('model_path')
        self.yolo_service = YOLOService(model_path)
        
        px_per_cm = self.config.get_app_setting('px_per_cm', 10.0)
        self.calibration_service = CalibrationService(px_per_cm)
        
        scale_port = self.config.get_app_setting('scale_port', 'COM3')
        scale_baudrate = self.config.get_app_setting('scale_baudrate', 9600)
        self.scale_service = ScaleService(scale_port, scale_baudrate)
        
        # Initialize camera thread
        self.camera_thread = CameraThread()
        self.camera_thread.frame_ready.connect(self.process_frame)
        
        # Current measurements
        self.current_measurements = {
            'width_cm': 0.0,
            'length_cm': 0.0,
            'weight_kg': 0.0,
            'detections': []
        }
        
        # Demo mode last weight
        self.last_demo_weight = None
        
        # Setup UI
        self.setup_ui()
        self.update_texts()
        
        # Setup weight reading timer
        self.weight_timer = QTimer()
        self.weight_timer.timeout.connect(self.update_weight)
        
        # Triple-tap detection for hidden setup access
        self.tap_count = 0
        self.tap_timer = QTimer()
        self.tap_timer.timeout.connect(self.reset_tap_count)
    
    def setup_ui(self):
        """Set up the user interface"""
        layout = QHBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        
        # Left side - Camera view
        camera_layout = QVBoxLayout()
        
        # Camera display
        self.camera_label = QLabel()
        self.camera_label.setObjectName("cam_view")
        self.camera_label.setFixedSize(800, 600)
        self.camera_label.setStyleSheet("""
            QLabel {
                border: 2px solid #1E3F8A;
                border-radius: 10px;
                background-color: black;
            }
        """)
        self.camera_label.setScaledContents(True)
        
        # Hidden setup hotspot (top-left corner)
        self.hidden_setup = QLabel()
        self.hidden_setup.setObjectName("hidden_area_setup")
        self.hidden_setup.setFixedSize(60, 60)
        self.hidden_setup.setStyleSheet("background-color: transparent;")
        self.hidden_setup.mousePressEvent = self.hidden_setup_clicked
        
        # Buttons
        button_layout = QHBoxLayout()
        
        self.back_button = QPushButton()
        self.back_button.setObjectName("btn_back_scan")
        self.back_button.clicked.connect(self.back_clicked.emit)
        
        self.free_weigh_button = QPushButton()
        self.free_weigh_button.setObjectName("btn_free_weigh")
        self.free_weigh_button.setStyleSheet("""
            QPushButton {
                background-color: #17a2b8;
                color: white;
                font-size: 16px;
                padding: 12px 24px;
            }
            QPushButton:hover {
                background-color: #138496;
            }
        """)
        self.free_weigh_button.clicked.connect(self.go_free_weigh)
        
        # Demo weight button (only visible in demo mode)
        self.demo_weight_button = QPushButton()
        self.demo_weight_button.setObjectName("btn_demo_weight")
        self.demo_weight_button.setStyleSheet("""
            QPushButton {
                background-color: #ffc107;
                color: black;
                font-size: 16px;
                padding: 12px 24px;
                margin-left: 8px;
            }
            QPushButton:hover {
                background-color: #e0a800;
            }
        """)
        self.demo_weight_button.clicked.connect(self.show_demo_weight_dialog)
        self.demo_weight_button.hide()  # Hidden by default
        
        self.continue_button = QPushButton()
        self.continue_button.setObjectName("btn_continue_scan")
        self.continue_button.setStyleSheet("""
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
        self.continue_button.clicked.connect(self.process_scan)
        
        button_layout.addWidget(self.back_button)
        button_layout.addWidget(self.free_weigh_button)
        button_layout.addWidget(self.demo_weight_button)
        button_layout.addStretch()
        button_layout.addWidget(self.continue_button)
        
        camera_layout.addWidget(self.hidden_setup, alignment=Qt.AlignLeft | Qt.AlignTop)
        camera_layout.addWidget(self.camera_label)
        camera_layout.addLayout(button_layout)
        
        # Right side - Bag data
        data_frame = QFrame()
        data_frame.setFixedWidth(300)
        data_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
            }
        """)
        
        data_layout = QVBoxLayout(data_frame)
        
        # Title
        self.bagdata_title = QLabel()
        self.bagdata_title.setObjectName("lbl_bagdata_title")
        self.bagdata_title.setStyleSheet("""
            QLabel {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
        """)
        
        # Measurements grid
        measurements_grid = QGridLayout()
        
        # Width
        self.width_label = QLabel()
        self.width_label.setObjectName("lbl_width")
        self.width_value = QLabel("0.0")
        self.width_value.setObjectName("out_width_cm")
        self.width_value.setStyleSheet("font-weight: bold; font-size: 16px;")
        
        # Length
        self.length_label = QLabel()
        self.length_label.setObjectName("lbl_length")
        self.length_value = QLabel("0.0")
        self.length_value.setObjectName("out_length_cm")
        self.length_value.setStyleSheet("font-weight: bold; font-size: 16px;")
        
        # Weight
        self.weight_label = QLabel()
        self.weight_label.setObjectName("lbl_weight")
        self.weight_value = QLabel("0.0")
        self.weight_value.setObjectName("out_weight_kg")
        self.weight_value.setStyleSheet("font-weight: bold; font-size: 16px;")
        
        # Calibration status
        self.calibration_label = QLabel()
        self.calibration_status = QLabel()
        self.calibration_status.setStyleSheet("color: green; font-weight: bold;")
        
        # Add to grid
        measurements_grid.addWidget(self.width_label, 0, 0)
        measurements_grid.addWidget(self.width_value, 0, 1)
        measurements_grid.addWidget(self.length_label, 1, 0)
        measurements_grid.addWidget(self.length_value, 1, 1)
        measurements_grid.addWidget(self.weight_label, 2, 0)
        measurements_grid.addWidget(self.weight_value, 2, 1)
        measurements_grid.addWidget(self.calibration_label, 3, 0)
        measurements_grid.addWidget(self.calibration_status, 3, 1)
        
        # Last demo weight display (only visible when demo weight has been set)
        self.last_weight_label = QLabel()
        self.last_weight_label.setStyleSheet("color: #ffc107; font-weight: bold; margin-top: 15px;")
        self.last_weight_label.hide()
        
        data_layout.addWidget(self.bagdata_title)
        data_layout.addLayout(measurements_grid)
        data_layout.addWidget(self.last_weight_label)
        data_layout.addStretch()
        
        # Add to main layout
        layout.addLayout(camera_layout)
        layout.addWidget(data_frame)
        
        self.setLayout(layout)
    
    def on_enter(self):
        """Called when entering scan screen"""
        self.camera_thread.start_camera()
        self.weight_timer.start(1000)  # Update weight every second
        self.update_texts()
        self.update_demo_mode_ui()
    
    def update_demo_mode_ui(self):
        """Update UI elements based on demo mode status"""
        from ..core.demo_manager import demo_manager
        
        is_demo_mode = demo_manager.get_demo_mode()
        self.demo_weight_button.setVisible(is_demo_mode)
    
    def on_exit(self):
        """Called when leaving scan screen"""
        self.camera_thread.stop_camera()
        self.weight_timer.stop()
    
    @pyqtSlot(np.ndarray)
    def process_frame(self, frame):
        """Process camera frame with YOLO detection"""
        # Detect objects
        detections = self.yolo_service.detect(frame)
        self.current_measurements['detections'] = detections
        
        # Draw detections on frame
        display_frame = self.yolo_service.draw_detections(frame, detections)
        
        # Get measurements from largest detection
        if detections:
            largest_detection = max(detections, key=lambda d: d['bbox'][2] * d['bbox'][3])
            width_cm, length_cm = self.calibration_service.bbox_px_to_cm(largest_detection['bbox'])
            
            self.current_measurements['width_cm'] = width_cm
            self.current_measurements['length_cm'] = length_cm
            
            # Update display
            self.width_value.setText(f"{width_cm}")
            self.length_value.setText(f"{length_cm}")
        
        # Convert frame to QPixmap and display
        rgb_frame = cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_frame.shape
        bytes_per_line = ch * w
        qt_image = QImage(rgb_frame.data, w, h, bytes_per_line, QImage.Format_RGB888)
        pixmap = QPixmap.fromImage(qt_image)
        self.camera_label.setPixmap(pixmap)
    
    def update_weight(self):
        """Update weight reading from scale"""
        weight = self.scale_service.read_weight()
        self.current_measurements['weight_kg'] = weight
        self.weight_value.setText(f"{weight}")
    
    def go_free_weigh(self):
        """Handle free weigh button click"""
        self.on_exit()
        self.free_weigh_clicked.emit()
    
    def process_scan(self):
        """Process scan and emit result"""
        # Create scan result
        result = {
            'width_cm': self.current_measurements['width_cm'],
            'length_cm': self.current_measurements['length_cm'],
            'weight_kg': self.current_measurements['weight_kg'],
            'detections': self.current_measurements['detections']
        }
        
        self.on_exit()
        self.continue_clicked.emit(result)
    
    def hidden_setup_clicked(self, event):
        """Handle triple-tap on hidden setup area"""
        self.tap_count += 1
        
        if self.tap_count == 1:
            self.tap_timer.start(1000)  # Reset after 1 second
        elif self.tap_count >= 3:
            self.tap_timer.stop()
            self.tap_count = 0
            self.on_exit()
            self.setup_clicked.emit()
    
    def reset_tap_count(self):
        """Reset tap count"""
        self.tap_count = 0
        self.tap_timer.stop()
    
    def update_texts(self):
        """Update text content based on current language"""
        self.bagdata_title.setText(self.i18n.t('scan.bagdata'))
        self.width_label.setText(self.i18n.t('scan.width'))
        self.length_label.setText(self.i18n.t('scan.length'))
        self.weight_label.setText(self.i18n.t('scan.weight'))
        self.calibration_label.setText(self.i18n.t('scan.calibration'))
        self.calibration_status.setText(self.i18n.t('scan.calibration_ok'))
        self.continue_button.setText(self.i18n.t('scan.continue'))
        self.back_button.setText(self.i18n.t('scan.back'))
        self.free_weigh_button.setText(self.i18n.t('scan.free_weigh'))