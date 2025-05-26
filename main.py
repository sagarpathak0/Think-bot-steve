'''
Main entry point for Think-Bot
'''
import cv2
import time
from tts_module import speak_fast
from memory_module import conversation_history, recent_observations, MAX_OBSERVATIONS, save_memory
from vision_module import setup_vision, analyze_frame
from speech_module import listen_for_wake_word, listen_active_command
from gemini_module import gemini_respond

# Setup vision models
face_cascade, yolo = setup_vision()

# Try multiple camera indices and create a named window
cv2.namedWindow('Think-Bot View', cv2.WINDOW_NORMAL)
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

print("Starting Think-Bot perception loop. Press 'q' to quit.")
frame_count = 0
N = 10  # Run YOLOv5 and OCR every N frames


# --- Session state: passive (waiting for wake word) or active (chatting) ---
session_active = False

while True:
    start_time = time.time()
    ret, frame = cap.read()
    if not ret:
        break

    run_yolo_ocr = (frame_count % N == 0)
    desc = analyze_frame(frame, face_cascade, yolo, run_yolo_ocr=run_yolo_ocr)
    if desc:
        print(desc)
        recent_observations.append(desc)
        if len(recent_observations) > MAX_OBSERVATIONS:
            recent_observations.pop(0)
        save_memory()

    # --- Passive mode: wait for wake word ---
    if not session_active and frame_count % N == 0:
        if listen_for_wake_word():
            print("[Steve is now listening to you! Say 'Steve stop' to end the session.]")
            session_active = True

    # --- Active mode: listen and chat until 'steve stop' ---
    while session_active:
        user_command = listen_active_command()
        if not user_command:
            continue
        if "steve stop" in user_command:
            print("[Steve is now waiting for the wake word again.]")
            session_active = False
            break
        gemini_reply = gemini_respond(user_command, role="user")
        print("Gemini (to you):", gemini_reply)
        speak_fast(gemini_reply)

    # Show the camera feed
    cv2.imshow('Think-Bot View', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    frame_count += 1
    print(f"FPS: {1/(time.time()-start_time):.2f}")

cap.release()
cv2.destroyAllWindows()
