export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing in Vercel Environment Variables."
      });
    }

    const body = req.body || {};

    const prompt = body.prompt;
    const context = body.context || "";

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter a doubt."
      });
    }

    const finalPrompt = `
You are JigsawConnect AI Doubt Solver.

You are an educational AI tutor.

Answer the student's doubt clearly and accurately.

Rules:
- Explain in simple student-friendly language.
- Give a step-by-step explanation.
- If it is programming related, provide a simple example.
- If it is a mathematical problem, show the calculation steps.
- If the question is theoretical, explain with an example.
- Do not unnecessarily make the answer too complicated.
- If the question is unclear, ask the student to clarify it.

Student Question:
${prompt}

Additional Context:
${context}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: finalPrompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed."
      });
    }

    const solution =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    if (!solution) {
      return res.status(500).json({
        error: "Gemini returned an empty response."
      });
    }

    return res.status(200).json({
      solution
    });

  } catch (error) {
    console.error("Doubt Solver Error:", error);

    return res.status(500).json({
      error: error.message || "Something went wrong."
    });
  }
}
