"""
Visual feedback for Steve (Think-Bot): overlays for OpenCV window
"""
import cv2

def draw_boxes(frame, faces=None, objects=None, ocr_text=None):
    # Draw face boxes
    if faces is not None:
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
    # Draw object labels (dummy, as YOLO returns only names here)
    if objects is not None:
        y0 = 30
        for obj in objects:
            cv2.putText(frame, obj, (10, y0), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)
            y0 += 30
    # Draw OCR text
    if ocr_text:
        cv2.putText(frame, ocr_text, (10, frame.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2)
    return frame
