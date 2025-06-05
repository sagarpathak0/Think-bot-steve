import cv2
import threading
from ultralytics import YOLO

class WebcamStream:
    def __init__(self, url="http://192.168.1.103:8080/video"):
        self.url = url
        self.cap = None
        self.is_running = False
        self._lock = threading.Lock()
        # Load YOLOv8n model (nano, fastest)
        self.model = YOLO('yolov8n.pt')  # Downloads automatically if not present

    def start(self):
        """Initialize and start the webcam stream"""
        with self._lock:
            self.cap = cv2.VideoCapture(self.url)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce buffer size
            
            if not self.cap.isOpened():
                raise RuntimeError(f"Failed to open video stream at {self.url}")
            
            self.is_running = True
            
    def read_frame(self):
        """Read a frame from the webcam stream and return detected object labels"""
        if not self.is_running:
            return False, None, []
        with self._lock:
            if self.cap is None:
                return False, None, []
            try:
                ret, frame = self.cap.read()
                if not ret:
                    return False, None, []
                # Run YOLOv8n detection
                results = self.model(frame, verbose=False)
                annotated_frame = results[0].plot()  # Draw boxes and labels
                # Extract detected object labels
                detected_labels = []
                for r in results:
                    for box in r.boxes:
                        cls_id = int(box.cls[0])
                        label = self.model.model.names[cls_id] if hasattr(self.model.model, 'names') else str(cls_id)
                        detected_labels.append(label)
                return True, annotated_frame, detected_labels
            except Exception as e:
                print(f"Error reading frame: {e}")
                return False, None, []
        
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
                
            cv2.imshow("Fast YOLOv8n Detection", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        stream.stop()
        cv2.destroyAllWindows()
