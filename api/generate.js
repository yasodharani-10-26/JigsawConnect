import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, count } = req.body;

    // Input Validation
    if (!topic || !count) {
      return res.status(400).json({ error: 'Missing required parameters: topic or count' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server Configuration Error: GEMINI_API_KEY is missing.' });
    }

    const ai = new GoogleGenerativeAI(apiKey);

    // 🚀 సరిచేసిన స్థిరమైన మోడల్: gemini-1.5-flash
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3
      },
      systemInstruction: "You are a quiz generator. You must only output a valid JSON array matching the requested schema. Do not wrap the response in markdown blocks like ```json or include any text outside the array."
    });

    const prompt = `Generate exactly ${count} educational multiple choice questions focusing strictly on "${topic}".
Return a JSON array matching this exact structure:
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
    let rawText = response.text().trim();

    if (!rawText) {
      return res.status(500).json({ error: 'Failed to retrieve a valid response structure from Gemini.' });
    }

    // సేఫ్టీ చెక్: Regex ఉపయోగించి Backticks, Markdown ట్యాగ్స్ మరియు అదనపు ఖాళీలను క్లీన్ చేయడం
    rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    const quizQuestions = JSON.parse(rawText);
    return res.status(200).json(quizQuestions);

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}
