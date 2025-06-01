from pathlib import Path
import torch
from PIL import Image
import cv2
import numpy as np

class VisionSystem:
    def __init__(self):
        # Load YOLOv5 model
        self.model = torch.hub.load('ultralytics/yolov5', 'yolov5s')
        
    def detect_objects(self, frame):
        """Detect objects in the frame using YOLOv5"""
        # Convert frame to RGB (YOLOv5 expects RGB)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Run inference
        results = self.model(frame_rgb)
        
        # Get detections
        detections = []
        for *box, conf, cls in results.xyxy[0]:  # xyxy, confidence, class
            if conf > 0.5:  # confidence threshold
                label = results.names[int(cls)]
                detections.append({
                    'label': label,
                    'confidence': float(conf),
                    'box': [float(x) for x in box]
                })
        
        return detections
    
    def draw_detections(self, frame, detections):
        """Draw bounding boxes and labels on the frame"""
        for det in detections:
            box = det['box']
            label = det['label']
            conf = det['confidence']
            
            # Draw box
            cv2.rectangle(frame, 
                        (int(box[0]), int(box[1])), 
                        (int(box[2]), int(box[3])), 
                        (0, 255, 0), 2)
            
            # Draw label
            text = f"{label} {conf:.2f}"
            cv2.putText(frame, text, 
                       (int(box[0]), int(box[1]-10)), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, 
                       (0, 255, 0), 2)
        
        return frame

    def process_frame(self, frame):
        """Process a frame through all vision pipelines"""
        if frame is None:
            return None, []
            
        # Detect objects
        detections = self.detect_objects(frame)
        
        # Draw detections on frame
        annotated_frame = self.draw_detections(frame.copy(), detections)
        
        return annotated_frame, detections

# Example usage
if __name__ == "__main__":
    from webcam_stream import WebcamStream
    
    vision = VisionSystem()
    stream = WebcamStream()
    stream.start()
    
    try:
        while True:
            frame = stream.read_frame()
            if frame is None:
                continue
                
            # Process frame
            processed_frame, detections = vision.process_frame(frame)
            
            # Show results
            if processed_frame is not None:
                stream.show_frame(processed_frame, "Object Detection")
                
            # Print detections
            if detections:
                print("\nDetections:", detections)
                
            if stream.check_quit():
                break
    finally:
        stream.stop()
