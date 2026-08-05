import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS Headers (ఒకవేళ అవసరమైతే)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // JSON ఫార్మాట్‌లోనే ఎర్రర్ పంపాలి
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `You are a helpful AI tutor for students. Answer this clearly:\n${prompt}\nContext: ${context || ''}`
    );
    
    const response = await result.response;
    const solution = response.text();

    return res.status(200).json({ solution });

  } catch (error) {
    console.error("Doubt Solver Error:", error);
    // 💥 క్రాష్ అయినా కూడా HTML పంపకుండా JSON ఎర్రర్ పంపడం
    return res.status(500).json({ 
      error: `Server Error: ${error.message || 'Something went wrong on the server'}` 
    });
  }
}
