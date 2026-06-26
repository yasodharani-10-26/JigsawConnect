// api/generate.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, count } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
      return res.status(500).json({ error: 'Server Configuration Error: GEMINI_API_KEY is missing.' });
    }

    // 1. Let the official SDK handle auth headers/query params safely
    const ai = new GoogleGenerativeAI(apiKey);
    
    // 2. Use gemini-2.0-flash model instance
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const prompt = `Generate exactly ${count} educational multiple choice questions focusing strictly on "${topic}".
Return a JSON array matching this exact blueprint schema structure, with no markdown formatting, no backticks, and no wrapper objects:
[
  {
    "question": "Question text?",
    "a": "Option A",
    "b": "Option B",
    "c": "Option C",
    "d": "Option D",
    "answer": "a"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    if (!rawText) {
      return res.status(500).json({ error: 'Failed to retrieve a valid response structure from Gemini.' });
    }

    const quizQuestions = JSON.parse(rawText);
    return res.status(200).json(quizQuestions);

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}
