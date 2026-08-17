import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, count } = req.body;

    if (!topic || !count) {
      return res.status(400).json({ error: 'Missing required parameters: topic or count' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server Configuration Error: GEMINI_API_KEY is missing.' });
    }

    const ai = new GoogleGenerativeAI(apiKey);

    // Enforce strict JSON output with responseSchema
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        responseSchema: {
          type: SchemaType.ARRAY,
          description: "List of quiz questions",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: {
                type: SchemaType.STRING,
                description: "The question text"
              },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: "List of 4 choices"
              },
              correctAnswer: {
                type: SchemaType.STRING,
                description: "Exact text of the correct choice matching one of the items in options"
              }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      },
      systemInstruction: "You are an educational quiz generator. Generate clear, distinct multiple-choice questions."
    });

    const prompt = `Generate exactly ${count} multiple choice questions focusing on "${topic}".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text().trim();

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
