"""
Computer vision helpers for Think-Bot
"""

import cv2
import pytesseract
import torch

# Set the path to the Tesseract executable (update if your path is different)
pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

def setup_vision():
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    yolo = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True).to(device)
    return face_cascade, yolo

def analyze_frame(frame, face_cascade, yolo, run_yolo_ocr=True):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    desc_parts = []
    if run_yolo_ocr:
        small_gray = cv2.resize(gray, (320, 320))
        ocr_text = pytesseract.image_to_string(small_gray).strip()
        if ocr_text:
            desc_parts.append(f"Text: {ocr_text}")
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    if len(faces) > 0:
        desc_parts.append(f"Detected {len(faces)} face(s)")
    if run_yolo_ocr:
        small_frame = cv2.resize(frame, (320, 320))
        results = yolo(small_frame)
        objects = results.pandas().xyxy[0]['name'].unique().tolist()
        if objects:
            desc_parts.append("Objects: " + ", ".join(objects))
    return ". ".join(desc_parts)
