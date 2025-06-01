import cv2
import time
import threading

class WebcamStream:
    def __init__(self, url="http://192.168.1.107:8080/video"):
        self.url = url
        self.cap = None
        self.is_running = False
        self._lock = threading.Lock()
        
    def start(self):
        """Initialize and start the webcam stream"""
        with self._lock:
            self.cap = cv2.VideoCapture(self.url)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce buffer size
            
            if not self.cap.isOpened():
                raise RuntimeError(f"Failed to open video stream at {self.url}")
            
            self.is_running = True
            
    def read_frame(self):
        """Read a frame from the webcam stream"""
        if not self.is_running:
            return False, None
            
        with self._lock:
            if self.cap is None:
                return False, None
                
            try:
                ret, frame = self.cap.read()
                return ret, frame
            except Exception as e:
                print(f"Error reading frame: {e}")
                return False, None
        
    def stop(self):
        """Stop and release the webcam stream"""
        with self._lock:
            self.is_running = False
            if self.cap is not None:
                self.cap.release()
                self.cap = None

# Example usage
if __name__ == "__main__":
    stream = WebcamStream()
    stream.start()
    
    try:
        while True:
            ret, frame = stream.read_frame()
            if not ret:
                print("Failed to get frame")
                break
                
            cv2.imshow("Phone Camera Feed", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        stream.stop()
