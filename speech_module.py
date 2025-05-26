"""
Speech recognition and wake-word logic for Think-Bot
"""
import speech_recognition as sr
recognizer = sr.Recognizer()
mic = sr.Microphone()


def listen_for_wake_word(wake_word="steve"):
    with mic as source:
        print(f"Say '{wake_word}' to wake me up...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
    try:
        command = recognizer.recognize_google(audio)
        print(f"You said: {command}")
        if wake_word in command.lower():
            return True
        else:
            print("Wake word not detected. Ignoring input.")
            return False
    except sr.UnknownValueError:
        print("Sorry, I could not understand your speech.")
        return False
    except sr.RequestError as e:
        print(f"Could not request results; {e}")
        return False

def listen_active_command():
    with mic as source:
        print("Listening (active mode, say 'Steve stop' to end)...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
    try:
        command = recognizer.recognize_google(audio)
        print(f"You said: {command}")
        return command.lower().strip()
    except sr.UnknownValueError:
        print("Sorry, I could not understand your speech.")
        return ""
    except sr.RequestError as e:
        print(f"Could not request results; {e}")
        return ""
