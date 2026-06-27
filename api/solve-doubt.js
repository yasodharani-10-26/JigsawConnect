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

  // 1. Grab the API key safely
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "Server Configuration Error: GEMINI_API_KEY environment variable is not defined or accessible." 
    });
  }

  // 2. Initialize the client
  const ai = new GoogleGenerativeAI(apiKey);

  // Wrap formidable in a Promise to ensure Vercel waits for parsing
  return new Promise((resolve) => {
    // Formidable 3.x+ setup
    const form = formidable({});

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        res.status(500).json({ error: "Error parsing upload data." });
        return resolve();
      }

      try {
        // formidable arrays ని రిటర్న్ చేస్తుంది, కాబట్టి [0] ఇండెక్స్ వాడాలి
        const promptText = fields.text ? (Array.isArray(fields.text) ? fields.text[0] : fields.text) : "";
        const parts = [];

        // Add image if it exists
        if (files.image) {
          const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
          if (imageFile && imageFile.filepath) {
            const imageBuffer = fs.readFileSync(imageFile.filepath);
            parts.push({
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: imageFile.mimetype,
              },
            });
          }
        }

        // Add voice recording if it exists
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

        // Add text prompt structure carefully
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
          contents: [{ role: "user", parts: parts }], // 'role' parameter కచ్చితంగా ఉండాలి
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
