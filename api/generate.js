// api/generate.js
export default async function handler(req, res) {
  // Only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, count } = req.body;
    
    // Safely grab the hidden key from Vercel's secret environment
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }

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

    // The backend makes the call to Google, keeping your key hidden from the browser
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // కచ్చితంగా క్లీన్ JSON అరే మాత్రమే వచ్చేలా ఫోర్స్ సెట్టింగ్
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Gemini API Error: ${errorText}` });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({ error: 'Failed to retrieve a valid response structure from Gemini.' });
    }

    // Since responseMimeType is set to 'application/json', rawText will be a clean JSON string array.
    // We parse it back into an actual JavaScript array before sending it back.
    const quizQuestions = JSON.parse(rawText);

    // Return the questions to your frontend
    return res.status(200).json(quizQuestions);

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}
