"""
Camera calibration service for pixel to centimeter conversion
"""

import numpy as np
from typing import Tuple, Optional


class CalibrationService:
    def __init__(self, px_per_cm: float = 10.0, homography_matrix: Optional[np.ndarray] = None):
        self.px_per_cm = px_per_cm
        self.homography_matrix = homography_matrix
        self.calibration_status = "OK"
    
    def bbox_px_to_cm(self, bbox: Tuple[int, int, int, int]) -> Tuple[float, float]:
        """
        Convert bounding box from pixels to centimeters
        Args:
            bbox: (x, y, w, h) in pixels
        Returns:
            (width_cm, length_cm)
        """
        x, y, w, h = bbox
        
        if self.homography_matrix is not None:
            return self._convert_with_homography(bbox)
        else:
            return self._convert_simple(w, h)
    
    def _convert_simple(self, w_px: int, h_px: int) -> Tuple[float, float]:
        """Simple pixel to cm conversion using px_per_cm ratio"""
        width_cm = w_px / self.px_per_cm
        length_cm = h_px / self.px_per_cm
        return round(width_cm, 1), round(length_cm, 1)
    
    def _convert_with_homography(self, bbox: Tuple[int, int, int, int]) -> Tuple[float, float]:
        """Convert using homography matrix (perspective correction)"""
        x, y, w, h = bbox
        
        # Define corners of bounding box
        corners = np.array([
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h]
        ], dtype=np.float32)
        
        # Apply homography transformation
        try:
            transformed = cv2.perspectiveTransform(
                corners.reshape(-1, 1, 2), self.homography_matrix
            ).reshape(-1, 2)
            
            # Calculate dimensions in transformed space
            width_px = np.linalg.norm(transformed[1] - transformed[0])
            height_px = np.linalg.norm(transformed[3] - transformed[0])
            
            # Convert to cm
            width_cm = width_px / self.px_per_cm
            length_cm = height_px / self.px_per_cm
            
            return round(width_cm, 1), round(length_cm, 1)
        except Exception as e:
            print(f"Error in homography conversion: {e}")
            return self._convert_simple(w, h)
    
    def set_px_per_cm(self, px_per_cm: float):
        """Update px_per_cm ratio"""
        self.px_per_cm = px_per_cm
        self.calibration_status = "OK"
    
    def set_homography_matrix(self, matrix: np.ndarray):
        """Set homography matrix"""
        self.homography_matrix = matrix
        self.calibration_status = "OK"
    
    def get_calibration_status(self) -> str:
        """Get current calibration status"""
        return self.calibration_status
    
    def needs_recalibration(self) -> bool:
        """Check if recalibration is needed"""
        return self.calibration_status != "OK"
    
    def trigger_recalibration(self):
        """Trigger recalibration process"""
        self.calibration_status = "Recalibrando..."
        # In a real implementation, this would start a calibration wizard
        # For now, we'll just simulate successful recalibration
        self.calibration_status = "OK"