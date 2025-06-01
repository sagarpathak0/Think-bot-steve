import os
import sys

# Suppress OpenCV warnings
stderr = sys.stderr
sys.stderr = open(os.devnull, 'w')
import cv2
sys.stderr = stderr

import threading
import signal
import queue
import time

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vision.webcam_stream import WebcamStream
from sensors.ultrasonic import start_ultrasonic_server, distance_data
from control.decision_engine import DecisionEngine
from audio.speak import SpeechEngine

# Suppress Flask startup messages
import logging
logging.getLogger('werkzeug').disabled = True

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print("\nSignal received. Shutting down...")
    sys.exit(0)

def main():
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Initialize components
    print("Initializing bot components...")
    speech = SpeechEngine()
    speech.speak("Bot initializing")
    
    # Start ultrasonic sensor server in its own thread
    ultrasonic_thread = threading.Thread(target=start_ultrasonic_server, daemon=True)
    ultrasonic_thread.start()
    
    # Start decision engine
    engine = DecisionEngine()
    decision_thread = threading.Thread(target=engine.run, daemon=True)
    decision_thread.start()
    
    # Start webcam stream
    webcam = WebcamStream()
    webcam_thread = None
    
    def webcam_loop():
        """Process webcam frames in a separate thread"""
        running = True
        while running:
            try:
                if not webcam.is_running:
                    break
                    
                ret, frame = webcam.read_frame()
                if not ret:
                    time.sleep(0.1)  # Add a small delay to prevent CPU spinning
                    continue
                    
                # Get current distance from ultrasonic sensor
                current_distance = distance_data.get("distance")
                
                # Add distance display to frame
                if current_distance is not None:
                    # Draw background for text
                    cv2.rectangle(frame, (10, 10), (250, 70), (0, 0, 0), -1)
                    
                    # Display distance value
                    cv2.putText(frame, f"Distance: {current_distance} cm", 
                                (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, 
                                (255, 255, 255), 2)
                    
                    # Add color indicator based on distance
                    color = (0, 255, 0)  # Green for safe distance
                    if current_distance < 30:
                        color = (0, 0, 255)  # Red for close objects
                    elif current_distance < 100:
                        color = (0, 255, 255)  # Yellow for medium distance
                        
                    # Draw bar showing distance visually
                    bar_length = int(min(current_distance * 2, 400))
                    cv2.rectangle(frame, (20, 50), (20 + bar_length, 60), color, -1)
                
                # Show the frame
                cv2.imshow("Bot Vision", frame)
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    running = False
                    
            except Exception as e:
                print(f"Webcam error: {e}")
                time.sleep(0.1)
    
    try:
        # Start webcam
        webcam.start()
        
        # Start webcam display thread
        webcam_thread = threading.Thread(target=webcam_loop, daemon=True)
        webcam_thread.start()
        
        # Announce ready
        speech.speak("Bot initialized and ready")
        
        # Print instructions
        print("\n=== Bot is ready for interaction ===")
        print("- Type your message and press Enter")
        print("- Type 'quit' to exit or press 'q' in video window\n")
        
        # Main interaction loop
        while True:
            user_input = input("> ")
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                break
                
            # Special commands
            if user_input.lower() == 'distance':
                current = distance_data.get("distance")
                print(f"Current distance: {current} cm")
                continue
                
            # Process through decision engine
            try:
                response = engine.process_user_input(user_input)
                print(f"Bot: {response}")
            except Exception as e:
                print(f"Error processing input: {e}")
            
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received")
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        print("\nShutting down bot...")
        
        # First stop the webcam (critical to avoid the assertion error)
        try:
            webcam.stop()
        except Exception as e:
            print(f"Error stopping webcam: {e}")
            
        # Close any OpenCV windows
        try:
            cv2.destroyAllWindows()
            # Give time for windows to close
            time.sleep(0.2)
        except:
            pass
        
        # Now handle other shutdowns
        try:
            engine.stop()
        except:
            pass
            
        try:
            speech.speak("Bot shutting down")
        except:
            pass
            
        print("Bot shutdown complete")

if __name__ == "__main__":
    main()
