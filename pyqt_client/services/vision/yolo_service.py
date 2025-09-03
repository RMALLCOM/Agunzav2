"""
YOLOv8 object detection service for luggage detection
"""

import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import os


class YOLOService:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model = None
        self.class_names = ['maleta', 'mochila', 'bolso', 'otro']
        
        # Initialize model if path is provided
        if model_path and os.path.exists(model_path):
            self._load_model()
    
    def _load_model(self):
        """Load YOLOv8 model"""
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_path)
        except ImportError:
            print("Warning: ultralytics not available, using simulation mode")
            self.model = None
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            self.model = None
    
    def detect(self, frame_bgr: np.ndarray) -> List[Dict]:
        """
        Detect objects in frame
        Returns list of detections with format:
        {
            'class': str,
            'score': float,
            'bbox': (x, y, w, h)
        }
        """
        if self.model is not None:
            return self._detect_with_model(frame_bgr)
        else:
            return self._simulate_detection(frame_bgr)
    
    def _detect_with_model(self, frame_bgr: np.ndarray) -> List[Dict]:
        """Detect using actual YOLO model"""
        try:
            results = self.model(frame_bgr)
            detections = []
            
            for result in results:
                if result.boxes is not None:
                    boxes = result.boxes.cpu().numpy()
                    for box in boxes:
                        x1, y1, x2, y2 = box.xyxy[0]
                        conf = box.conf[0]
                        cls = int(box.cls[0])
                        
                        # Convert to x, y, w, h format
                        x, y, w, h = x1, y1, x2 - x1, y2 - y1
                        
                        detection = {
                            'class': self.class_names[cls] if cls < len(self.class_names) else 'otro',
                            'score': float(conf),
                            'bbox': (int(x), int(y), int(w), int(h))
                        }
                        detections.append(detection)
            
            return detections
        except Exception as e:
            print(f"Error in YOLO detection: {e}")
            return self._simulate_detection(frame_bgr)
    
    def _simulate_detection(self, frame_bgr: np.ndarray) -> List[Dict]:
        """Simulate detection for testing/demo purposes"""
        h, w = frame_bgr.shape[:2]
        
        # Create simulated detection in center of frame
        center_x = w // 2
        center_y = h // 2
        bbox_w = w // 3
        bbox_h = h // 3
        
        detection = {
            'class': 'maleta',
            'score': 0.85,
            'bbox': (center_x - bbox_w//2, center_y - bbox_h//2, bbox_w, bbox_h)
        }
        
        return [detection]
    
    def draw_detections(self, frame: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """Draw detection bounding boxes on frame"""
        frame_copy = frame.copy()
        
        for detection in detections:
            x, y, w, h = detection['bbox']
            class_name = detection['class']
            score = detection['score']
            
            # Draw bounding box
            cv2.rectangle(frame_copy, (x, y), (x + w, y + h), (0, 255, 0), 3)
            
            # Draw label
            label = f"{class_name}: {score:.2f}"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
            cv2.rectangle(frame_copy, (x, y - label_size[1] - 10), 
                         (x + label_size[0], y), (0, 255, 0), -1)
            cv2.putText(frame_copy, label, (x, y - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
        return frame_copy