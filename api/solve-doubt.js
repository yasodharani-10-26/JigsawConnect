import { GoogleGenerativeAI } from "@google/generative-ai";
import formidable from "formidable";
import fs from "fs";

// Disable Vercel's default body parser to handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1. Grab the API key inside the handler function execution context
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "Server Configuration Error: GEMINI_API_KEY environment variable is not defined or accessible." 
    });
  }

  // 2. Initialize the client safely here
  const ai = new GoogleGenerativeAI(apiKey);

  // Wrap the formidable parsing logic in a Promise so Vercel waits for it to execute completely
  return new Promise((resolve) => {
    const form = formidable({ extremes: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        res.status(500).json({ error: "Error parsing upload data." });
        return resolve();
      }

      try {
        const promptText = fields.text ? fields.text[0] : "";
        const parts = [];

        // Add image if it exists
        if (files.image && files.image[0]) {
          const imageFile = files.image[0];
          const imageBuffer = fs.readFileSync(imageFile.filepath);
          parts.push({
            inlineData: {
              data: imageBuffer.toString("base64"),
              mimeType: imageFile.mimetype,
            },
          });
        }

        // Add voice recording if it exists
        if (files.voice && files.voice[0]) {
          const voiceFile = files.voice[0];
          const voiceBuffer = fs.readFileSync(voiceFile.filepath);
          parts.push({
            inlineData: {
              data: voiceBuffer.toString("base64"),
              mimeType: voiceFile.mimetype || "audio/mp3",
            },
          });
        }

        // Add text prompt structure carefully as an object part
        const finalPrompt = promptText 
          ? `${promptText}\n\nPlease solve the doubt attached in the multimodal inputs above.` 
          : "Please analyze the attached image/audio doubt and provide a detailed solution.";
          
        parts.push({ text: finalPrompt });

        // Setup system instruction
        const systemInstruction = 
          "You are an expert tutor on StudyConnect. Analyze the given text query, image, or audio doubt. " +
          "Provide a clear, accurate, step-by-step educational solution. Use markdown for headings or bullet points if needed. " +
          "If the user asks in Telugu or English, respond in a clear, easy-to-understand language according to their tone.";

        // Initialize model
        const model = ai.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: systemInstruction
        });

        // Execute request to Gemini API
        const result = await model.generateContent({
          contents: [{ parts: parts }],
          generationConfig: {
            temperature: 0.4,
          }
        });

        const response = await result.response;
        const text = response.text();

        // Send back successful JSON response
        res.status(200).json({ solution: text });
        return resolve();

      } catch (apiError) {
        console.error("Gemini API Error:", apiError);
        res.status(500).json({ error: `AI Engine Error: ${apiError.message}` });
        return resolve();
      }
    });
  });
}
