from googletrans import Translator
import langdetect

class LanguageProcessor:
    def __init__(self):
        self.translator = Translator()
        
    def detect_language(self, text):
        """Detect the language of the given text"""
        try:
            return langdetect.detect(text)
        except:
            return "en"  # Default to English if detection fails
            
    def translate(self, text, dest="en", src=None):
        """Translate text to the specified language"""
        if not src:
            src = self.detect_language(text)
            
        if src == dest:
            return text
            
        try:
            translation = self.translator.translate(text, src=src, dest=dest)
            return translation.text
        except Exception as e:
            print(f"Translation error: {e}")
            return text  # Return original if translation fails