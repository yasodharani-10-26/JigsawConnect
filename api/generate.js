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

    const prompt = `Generate exactly ${count} educational multiple choice questions focusing strictly on "${topic}".
Return ONLY a valid JSON array matching this exact blueprint schema structure without conversational wrappers:
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
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Send the raw AI response text straight back to your frontend app.js
    return res.status(200).json({ result: rawText });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
