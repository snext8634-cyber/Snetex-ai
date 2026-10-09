const express = require("express");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash"; // chahe to badal sakte hain

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const SYSTEM_PROMPT =
  "Tum Nova ho, ek friendly personal AI assistant. " +
  "Har jawab Hinglish (Roman Hindi + halki English) me do. " +
  "Chhota, saaf aur helpful jawab do. Warm aur natural tone rakho. " +
  "Jawab ko bolna aasan ho, isliye simple words aur chhote sentences use karo.";

app.post("/api/chat", async (req, res) => {
  try {
    const userMsg = (req.body.message || "").trim();
    if (!userMsg) return res.status(400).json({ error: "Message khali hai" });

const history = (req.body.history || [])
      .slice(-10)
      .map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }));

const chat = model.startChat({
      history: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Samajh gaya! Main Hinglish me jawab dunga." }] },
                ...history],
    });

const result = await chat.sendMessage(userMsg);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kuch galat ho gaya. Dobara try karein." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Nova chal raha hai port " + PORT + " par"));
