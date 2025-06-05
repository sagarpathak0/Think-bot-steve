# PIR Sensor Class for Motion Detection
# This class interfaces with a PIR sensor to detect motion
# It can be used with Raspberry Pi GPIO or similar hardware

class PIRSensor:
    def __init__(self):
        self.motion_detected = False
        
    def read(self):
        """
        This is a placeholder. In a real implementation, 
        this would read from a GPIO pin connected to a PIR sensor.
        """
        # Placeholder - would read from hardware
        return self.motion_detected
    
    def simulate_motion(self, detected=True):
        """Simulate motion detection (for testing)"""
        self.motion_detected = detected
        return self.motion_detected
