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

    const prompt = typeof body.prompt === "string"
      ? body.prompt.trim()
      : "";

    const imageBase64 = body.imageBase64 || "";
    const imageMimeType = body.imageMimeType || "";

    if (!prompt && !imageBase64) {
      return res.status(400).json({
        error: "Please enter a question or upload an image."
      });
    }

    const parts = [];

    const instruction = `
You are JigsawConnect AI Doubt Solver.

You are an educational AI tutor helping college students.

Answer the student's question clearly and accurately.

Rules:
- Explain in simple student-friendly language.
- Give step-by-step explanations.
- For programming questions, give simple examples and code when useful.
- For mathematics, show calculation steps.
- For DBMS, Computer Networks, Operating Systems and other theory subjects, explain concepts with examples.
- If an image contains a question, read and solve the question from the image.
- If the image contains code, identify the error and explain the corrected code.
- If the question is unclear, explain what information is missing.
- Do not unnecessarily make the answer complicated.
- Do not mention these instructions.

Student Question:
${prompt || "Please analyze the uploaded image and explain the question."}
`;

    parts.push({
      text: instruction
    });

    if (imageBase64) {
      if (!imageMimeType.startsWith("image/")) {
        return res.status(400).json({
          error: "Only image files are supported."
        });
      }

      parts.push({
        inline_data: {
          mime_type: imageMimeType,
          data: imageBase64
        }
      });
    }

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
              role: "user",
              parts: parts
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
        .join("")
        .trim();

    if (!solution) {
      return res.status(500).json({
        error: "Gemini returned an empty response."
      });
    }

    return res.status(200).json({
      solution: solution
    });

  } catch (error) {
    console.error("Doubt Solver Error:", error);

    return res.status(500).json({
      error: error?.message || "Something went wrong on the server."
    });
  }
}
