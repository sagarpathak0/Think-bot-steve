"""
Gemini API setup and response logic for Think-Bot
"""
import google.generativeai as genai
from memory_module import conversation_history, recent_observations, MAX_OBSERVATIONS, save_memory, search_memory

GEMINI_API_KEY = "AIzaSyAUkA_iN8H7_f4EGVPQiLCA151d1olpdHc"  # Replace with your actual Gemini API key
genai.configure(api_key=GEMINI_API_KEY)
gemini = genai.GenerativeModel("gemini-1.5-flash")

def gemini_respond(prompt, role="user"):
    if prompt.strip().lower().startswith("recall "):
        search_term = prompt.strip()[7:]
        found = search_memory(search_term)
        if found:
            reply = "Here's what I remember about '" + search_term + "':\n" + "\n".join(found)
        else:
            reply = f"Sorry, I couldn't find anything about '{search_term}'."
        conversation_history.append({"role": "bot", "content": reply})
        save_memory()
        return reply
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
    save_memory()
    return response.text.strip()
