'''
Think-Bot Perception Prototype (No Camera Feedback)

Features:
 - OCR via Tesseract
 - Face Detection via OpenCV Haarcascade
 - Object Detection via YOLOv5 (PyTorch)
 - Text-to-Speech via pyttsx3
 - Speech Recognition via SpeechRecognition
 - Gemini AI Responses via Google Generative AI

This version does NOT show the camera feed window.
'''

import cv2
import pytesseract
import torch
import pyttsx3
import time
import speech_recognition as sr
import google.generativeai as genai

# Simple in-memory conversation history
conversation_history = []
# Store recent observations for context
recent_observations = []
MAX_OBSERVATIONS = 5  # Number of recent observations to keep

# 1. Configure Tesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

# 2. Load face cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# 3. Load YOLOv5 model (use GPU if available)
device = 'cuda' if torch.cuda.is_available() else 'cpu'
yolo = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True).to(device)

# 4. Initialize TTS engine
tts = pyttsx3.init()

# --- Gemini API Setup ---
GEMINI_API_KEY = "AIzaSyCES_W78pL1FeS0hMT4PDtwYoNbQkFHqCI"  # Replace with your actual Gemini API key
genai.configure(api_key=GEMINI_API_KEY)
gemini = genai.GenerativeModel("gemini-1.5-flash")

# --- Speech Recognition Setup ---
recognizer = sr.Recognizer()
mic = sr.Microphone()

def speak(text):
    tts.say(text)
    tts.runAndWait()

def analyze_frame(frame, run_yolo_ocr=True):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    desc_parts = []
    # OCR (on resized frame)
    if run_yolo_ocr:
        small_gray = cv2.resize(gray, (320, 320))
        ocr_text = pytesseract.image_to_string(small_gray).strip()
        if ocr_text:
            desc_parts.append(f"Text: {ocr_text}")
    # Face detection (on full frame)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    if len(faces) > 0:
        desc_parts.append(f"Detected {len(faces)} face(s)")
    # Object detection (on resized frame)
    if run_yolo_ocr:
        small_frame = cv2.resize(frame, (320, 320))
        results = yolo(small_frame)
        objects = results.pandas().xyxy[0]['name'].unique().tolist()
        if objects:
            desc_parts.append("Objects: " + ", ".join(objects))
    return ". ".join(desc_parts)

def listen_command():
    with mic as source:
        print("Listening for your command...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
    try:
        command = recognizer.recognize_google(audio)
        print(f"You said: {command}")
        return command
    except sr.UnknownValueError:
        print("Sorry, I could not understand your speech.")
        return ""
    except sr.RequestError as e:
        print(f"Could not request results; {e}")
        return ""

def gemini_respond(prompt, role="user"):
    if role == "user":
        conversation_history.append({"role": "user", "content": prompt})
    context = ""
    for turn in [t for t in conversation_history if t['role'] in ("user", "bot")][-5:]:
        context += f"{turn['role'].capitalize()}: {turn['content']}\n"
    obs_text = ""
    if recent_observations:
        obs_text = "Recent observations from my sensors:\n"
        for obs in recent_observations[-MAX_OBSERVATIONS:]:
            obs_text += f"- {obs}\n"
    curious_prompt = (
        "You are a curious, friendly robot. "
        "When you answer, always sound excited to learn and discover new things. "
        f"{obs_text}"
        "Here is the recent conversation:\n"
        f"{context}"
        "Respond in a way that shows curiosity and invites further interaction."
    )
    response = gemini.generate_content(curious_prompt)
    if role != "observation":
        conversation_history.append({"role": "bot", "content": response.text.strip()})
    return response.text.strip()

# Main loop (NO camera feedback window)
cap = None
for cam_idx in range(3):
    test_cap = cv2.VideoCapture(cam_idx)
    if test_cap.isOpened():
        print(f"Camera index {cam_idx} is available. Using this camera.")
        cap = test_cap
        break
    else:
        print(f"Camera index {cam_idx} is NOT available.")
if cap is None or not cap.isOpened():
    raise RuntimeError("Could not open any camera (tried indices 0, 1, 2).")

print("Starting Think-Bot perception loop (no camera window). Press Ctrl+C to quit.")
frame_count = 0
N = 10  # Run YOLOv5 and OCR every N frames

try:
    while True:
        start_time = time.time()
        ret, frame = cap.read()
        if not ret:
            break
        run_yolo_ocr = (frame_count % N == 0)
        desc = analyze_frame(frame, run_yolo_ocr=run_yolo_ocr)
        if desc:
            print(desc)
            recent_observations.append(desc)
            if len(recent_observations) > MAX_OBSERVATIONS:
                recent_observations.pop(0)
        if frame_count % N == 0:
            user_command = listen_command()
            if user_command:
                gemini_reply = gemini_respond(user_command, role="user")
                print("Gemini (to you):", gemini_reply)
                speak(gemini_reply)
        frame_count += 1
        print(f"FPS: {1/(time.time()-start_time):.2f}")
except KeyboardInterrupt:
    print("Exiting...")
finally:
    cap.release()
