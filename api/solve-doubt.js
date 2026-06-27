import { GoogleGenerativeAI } from "@google/generative-ai";
import * as formidable from "formidable"; // ఇంపోర్ట్ స్టైల్ మార్చాము (Safe for all versions)
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Multipart form-data కోసం తప్పనిసరి
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "Server Configuration Error: GEMINI_API_KEY is missing in Environment Variables." 
    });
  }

  const ai = new GoogleGenerativeAI(apiKey);

  // Vercel Serverless Function కి ప్రామిస్ రిటర్న్ చేస్తున్నాము
  return new Promise((resolve, reject) => {
    // Formidable ఇనిషియలైజేషన్ (Safe approach)
    const incomingForm = typeof formidable.default === "function" 
      ? new formidable.default() 
      : (typeof formidable === "function" ? new formidable() : formidable.formidable ? formidable.formidable() : null);

    if (!incomingForm) {
      res.status(500).json({ error: "Failed to initialize form parser library." });
      return resolve();
    }

    incomingForm.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        res.status(500).json({ error: "Error parsing upload data." });
        return resolve();
      }

      try {
        // Safe string parsing (Formidable v2 and v3 compatibility)
        const promptText = fields.text ? (Array.isArray(fields.text) ? fields.text[0] : fields.text) : "";
        const parts = [];

        // 1. Image handling
        if (files.image) {
          const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
          if (imageFile && imageFile.filepath) {
            const imageBuffer = fs.readFileSync(imageFile.filepath);
            parts.push({
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: imageFile.mimetype || "image/jpeg",
              },
            });
          }
        }

        // 2. Voice/Audio handling
        if (files.voice) {
          const voiceFile = Array.isArray(files.voice) ? files.voice[0] : files.voice;
          if (voiceFile && voiceFile.filepath) {
            const voiceBuffer = fs.readFileSync(voiceFile.filepath);
            parts.push({
              inlineData: {
                data: voiceBuffer.toString("base64"),
                mimeType: voiceFile.mimetype || "audio/mp3",
              },
            });
          }
        }

        // 3. Final text prompt
        const finalPrompt = promptText 
          ? `${promptText}\n\nPlease solve the doubt attached in the multimodal inputs above.` 
          : "Please analyze the attached image/audio doubt and provide a detailed solution.";
          
        parts.push({ text: finalPrompt });

        const systemInstruction = 
          "You are an expert tutor on StudyConnect. Analyze the given text query, image, or audio doubt. " +
          "Provide a clear, accurate, step-by-step educational solution. Use markdown for headings or bullet points if needed. " +
          "If the user asks in Telugu or English, respond in a clear, easy-to-understand language according to their tone.";

        // Gemini Model Initialization
        const model = ai.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: systemInstruction
        });

        // Gemini API Call
        const result = await model.generateContent({
          contents: [{ role: "user", parts: parts }],
          generationConfig: {
            temperature: 0.4,
          }
        });

        const response = await result.response;
        const text = response.text();

        // సక్సెస్ రెస్పాన్స్ పంపి ప్రామిస్ ముగించడం
        res.status(200).json({ solution: text });
        return resolve();

      } catch (apiError) {
        console.error("Gemini API Runtime Error:", apiError);
        res.status(500).json({ error: `AI Engine Error: ${apiError.message}` });
        return resolve();
      }
    });
  });
}
