
import type { NextApiRequest, NextApiResponse } from "next";

const BOT_API_URL = "http://localhost:5005";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Proxy to Flask /memory endpoint
    try {
      const response = await fetch(`${BOT_API_URL}/memory`);
      const data = await response.json();
      res.status(200).json(data);
    } catch {
      res.status(500).json({ error: "Could not connect to bot backend." });
    }
  } else if (req.method === "POST") {
    // Proxy user message to Flask /chat endpoint
    try {
      const { message } = req.body;
      const response = await fetch(`${BOT_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      res.status(200).json(data);
    } catch {
      res.status(500).json({ error: "Could not connect to bot backend." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
