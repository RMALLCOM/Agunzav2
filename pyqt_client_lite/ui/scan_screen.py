"""
Scan screen - Camera streaming with image capture on button press
"""

from PyQt5.QtWidgets import (QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QFrame)
from PyQt5.QtCore import Qt, pyqtSignal, QTimer, QThread
from PyQt5.QtGui import QPixmap, QImage
import cv2
import numpy as np
import os
from datetime import datetime
from .base_screen import BaseScreen


class CameraThread(QThread):
    frame_ready = pyqtSignal(np.ndarray)
    
    def __init__(self):
        super().__init__()
        self.camera = None
        self.running = False
        self.current_frame = None
    
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
    
    def get_current_frame(self):
        """Get the current frame for saving"""
        return self.current_frame
    
    def run(self):
        """Camera capture loop"""
        while self.running:
            if self.camera and self.camera.isOpened():
                ret, frame = self.camera.read()
                if ret:
                    self.current_frame = frame.copy()
                    self.frame_ready.emit(frame)
            else:
                # Generate dummy frame for testing
                dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
                dummy_frame.fill(50)
                # Add some pattern
                cv2.putText(dummy_frame, "CAMERA SIMULATION", (180, 240), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                self.current_frame = dummy_frame.copy()
                self.frame_ready.emit(dummy_frame)
            
            self.msleep(33)  # ~30 FPS


class ScanScreen(BaseScreen):
    image_captured = pyqtSignal(str)  # Emits path to saved image
    back_clicked = pyqtSignal()
    
    def __init__(self, main_window):
        super().__init__(main_window)
        
        # Initialize camera thread
        self.camera_thread = CameraThread()
        self.camera_thread.frame_ready.connect(self.process_frame)
        
        # Setup UI
        self.setup_ui()
        self.update_texts()
        
        # Create images directory on desktop
        self.create_images_directory()
    
    def create_images_directory(self):
        """Create 'imagenes_para_ia' directory on desktop"""
        try:
            desktop = os.path.join(os.path.expanduser("~"), "Desktop")
            self.images_dir = os.path.join(desktop, "imagenes_para_ia")
            os.makedirs(self.images_dir, exist_ok=True)
            print(f"Images directory created at: {self.images_dir}")
        except Exception as e:
            # Fallback to current directory
            self.images_dir = os.path.join(os.getcwd(), "imagenes_para_ia")
            os.makedirs(self.images_dir, exist_ok=True)
            print(f"Images directory created at: {self.images_dir}")
    
    def setup_ui(self):
        """Set up the user interface"""
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        
        # Title
        self.title_label = QLabel()
        self.title_label.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #1E3F8A;
                margin-bottom: 20px;
            }
        """)
        
        # Camera display
        camera_frame = QFrame()
        camera_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 3px solid #1E3F8A;
                border-radius: 10px;
                padding: 10px;
            }
        """)
        
        camera_layout = QVBoxLayout(camera_frame)
        
        self.camera_label = QLabel()
        self.camera_label.setFixedSize(800, 600)
        self.camera_label.setStyleSheet("""
            QLabel {
                border: 2px solid #1E3F8A;
                border-radius: 5px;
                background-color: black;
            }
        """)
        self.camera_label.setScaledContents(True)
        self.camera_label.setAlignment(Qt.AlignCenter)
        
        camera_layout.addWidget(self.camera_label, alignment=Qt.AlignCenter)
        
        # Status label
        self.status_label = QLabel()
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setStyleSheet("""
            QLabel {
                color: #666;
                font-size: 14px;
                margin-top: 10px;
            }
        """)
        
        # Buttons
        button_layout = QHBoxLayout()
        
        self.back_button = QPushButton()
        self.back_button.setFixedSize(120, 50)
        self.back_button.clicked.connect(self.go_back)
        
        self.capture_button = QPushButton()
        self.capture_button.setFixedSize(200, 80)
        self.capture_button.setStyleSheet("""
            QPushButton {
                background-color: #E20C18;
                color: white;
                font-size: 20px;
                font-weight: bold;
                border: none;
                border-radius: 10px;
            }
            QPushButton:hover {
                background-color: #C70A15;
            }
        """)
        self.capture_button.clicked.connect(self.capture_image)
        
        button_layout.addWidget(self.back_button)
        button_layout.addStretch()
        button_layout.addWidget(self.capture_button)
        
        # Add to main layout
        layout.addWidget(self.title_label)
        layout.addWidget(camera_frame)
        layout.addWidget(self.status_label)
        layout.addLayout(button_layout)
        
        self.setLayout(layout)
    
    def on_enter(self):
        """Called when entering scan screen"""
        self.camera_thread.start_camera()
        self.status_label.setText("Cámara iniciada - Presiona ESCANEAR para capturar imagen")
        self.update_texts()
    
    def on_exit(self):
        """Called when leaving scan screen"""
        self.camera_thread.stop_camera()
    
    def process_frame(self, frame):
        """Process camera frame and display it"""
        try:
            # Convert frame to QPixmap and display
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            h, w, ch = rgb_frame.shape
            bytes_per_line = ch * w
            qt_image = QImage(rgb_frame.data, w, h, bytes_per_line, QImage.Format_RGB888)
            pixmap = QPixmap.fromImage(qt_image)
            self.camera_label.setPixmap(pixmap)
        except Exception as e:
            print(f"Error processing frame: {e}")
    
    def capture_image(self):
        """Capture current frame and save to images directory"""
        try:
            current_frame = self.camera_thread.get_current_frame()
            if current_frame is not None:
                # Generate filename with timestamp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"maleta_{timestamp}.jpg"
                filepath = os.path.join(self.images_dir, filename)
                
                # Save image
                success = cv2.imwrite(filepath, current_frame)
                
                if success:
                    self.status_label.setText(f"{self.get_text('image_saved')} {filepath}")
                    print(f"Image saved: {filepath}")
                    
                    # Stop camera and emit signal with image path
                    self.on_exit()
                    self.image_captured.emit(filepath)
                else:
                    self.status_label.setText("Error al guardar imagen")
            else:
                self.status_label.setText("No hay imagen disponible para capturar")
        except Exception as e:
            self.status_label.setText(f"Error: {e}")
            print(f"Error capturing image: {e}")
    
    def go_back(self):
        """Handle back button click"""
        self.on_exit()
        self.back_clicked.emit()
    
    def update_texts(self):
        """Update text content based on current language"""
        self.title_label.setText(self.get_text('scan_title'))
        self.capture_button.setText(self.get_text('capture'))
        self.back_button.setText(self.get_text('back'))
