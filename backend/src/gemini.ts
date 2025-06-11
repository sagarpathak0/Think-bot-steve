import fetch from 'node-fetch';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function askGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 256 }
    })
  });
  const data: any = await res.json();
  // Defensive: check structure before accessing
  if (data && Array.isArray(data.candidates) && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  return 'No response.';
}
