"""
Multilingual support for Steve (Think-Bot)
"""
from googletrans import Translator
translator = Translator()

def detect_language(text):
    return translator.detect(text).lang

def translate_text(text, dest="en"):
    return translator.translate(text, dest=dest).text
