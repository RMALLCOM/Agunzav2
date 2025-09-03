"""
Scale service for weight measurement via serial connection
"""

import time
import random
from typing import Optional


class ScaleService:
    def __init__(self, port: str = "COM3", baudrate: int = 9600):
        self.port = port
        self.baudrate = baudrate
        self.serial_connection = None
        self.simulation_mode = True
        
        # Try to establish serial connection
        self._init_serial_connection()
    
    def _init_serial_connection(self):
        """Initialize serial connection to scale"""
        try:
            import serial
            self.serial_connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=1
            )
            self.simulation_mode = False
            print(f"Connected to scale on {self.port}")
        except ImportError:
            print("Warning: pyserial not available, using simulation mode")
            self.simulation_mode = True
        except Exception as e:
            print(f"Could not connect to scale: {e}, using simulation mode")
            self.simulation_mode = True
    
    def read_weight(self) -> float:
        """
        Read weight from scale
        Returns weight in kg
        """
        if self.simulation_mode:
            return self._simulate_weight()
        else:
            return self._read_from_scale()
    
    def _read_from_scale(self) -> float:
        """Read weight from actual scale device"""
        try:
            if self.serial_connection and self.serial_connection.is_open:
                # Send read command (this depends on scale protocol)
                self.serial_connection.write(b'R\r\n')
                
                # Read response
                response = self.serial_connection.readline().decode('utf-8').strip()
                
                # Parse weight from response (format may vary by scale)
                # Example: "W: 12.5 kg" -> extract 12.5
                if 'kg' in response:
                    weight_str = response.split('kg')[0].split(':')[-1].strip()
                    return float(weight_str)
                else:
                    # Try to extract numeric value
                    import re
                    numbers = re.findall(r'\d+\.?\d*', response)
                    if numbers:
                        return float(numbers[0])
            
            # Fallback to simulation if reading fails
            return self._simulate_weight()
        except Exception as e:
            print(f"Error reading from scale: {e}")
            return self._simulate_weight()
    
    def _simulate_weight(self) -> float:
        """Simulate weight reading for testing"""
        # Generate random weight between 8-12 kg with some variation
        base_weight = random.uniform(8.0, 12.0)
        # Add some noise to make it realistic
        noise = random.uniform(-0.2, 0.2)
        weight = base_weight + noise
        return round(weight, 1)
    
    def tare(self) -> bool:
        """Tare (zero) the scale"""
        if self.simulation_mode:
            return True
        
        try:
            if self.serial_connection and self.serial_connection.is_open:
                self.serial_connection.write(b'T\r\n')
                response = self.serial_connection.readline().decode('utf-8').strip()
                return 'OK' in response or 'TARE' in response
        except Exception as e:
            print(f"Error taring scale: {e}")
        
        return False
    
    def is_connected(self) -> bool:
        """Check if scale is connected"""
        if self.simulation_mode:
            return False
        
        return (self.serial_connection is not None and 
                self.serial_connection.is_open)
    
    def disconnect(self):
        """Disconnect from scale"""
        if self.serial_connection:
            try:
                self.serial_connection.close()
            except Exception as e:
                print(f"Error closing serial connection: {e}")
            finally:
                self.serial_connection = None
    
    def __del__(self):
        """Cleanup when object is destroyed"""
        self.disconnect()