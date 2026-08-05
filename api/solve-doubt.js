const { GoogleGenerativeAI } = require("@google/generative-ai");
const { formidable } = require("formidable"); // <-- ఇక్కడ మార్పు జరిగింది
const fs = require("fs");

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "Server Configuration Error: GEMINI_API_KEY is missing in Vercel Environment Variables." 
    });
  }

  try {
    // Formidable initialization
    const form = formidable({ keepExtensions: true });

    // 1. Parse multipart form safely
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ fields, files });
      });
    });

    const ai = new GoogleGenerativeAI(apiKey);
    
    // Extract text safely
    const promptText = Array.isArray(fields.text) ? fields.text[0] : fields.text || "";
    const parts = [];

    // 2. Process Image File
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    if (imageFile && imageFile.size > 0) {
      const imagePath = imageFile.filepath || imageFile.path; 
      const imageBuffer = fs.readFileSync(imagePath);
      parts.push({
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: imageFile.mimetype || "image/jpeg",
        },
      });
    }

    // 3. Process Voice File
    const voiceFile = Array.isArray(files.voice) ? files.voice[0] : files.voice;
    if (voiceFile && voiceFile.size > 0) {
      const voicePath = voiceFile.filepath || voiceFile.path;
      const voiceBuffer = fs.readFileSync(voicePath);
      parts.push({
        inlineData: {
          data: voiceBuffer.toString("base64"),
          mimeType: voiceFile.mimetype || "audio/mp3",
        },
      });
    }

    // 4. Build Final Prompt
    const finalPrompt = promptText 
      ? `${promptText}\n\nPlease solve the doubt attached in the multimodal inputs above.` 
      : "Please analyze the attached image/audio doubt and provide a detailed solution.";
      
    parts.push({ text: finalPrompt });

    const systemInstruction = 
      "You are an expert tutor on StudyConnect. Analyze the given text query, image, or audio doubt. " +
      "Provide a clear, accurate, step-by-step educational solution. Use markdown for headings or bullet points if needed. " +
      "If the user asks in Telugu or English, respond in a clear, easy-to-understand language according to their tone.";

    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      systemInstruction: systemInstruction
    });

    // 5. Generate Output
    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
      generationConfig: { 
        temperature: 0.4,
        maxOutputTokens: 1000 
      }
    });

    const responseText = result.response.text();
    return res.status(200).json({ solution: responseText });

  } catch (apiError) {
    console.error("Backend API Exception:", apiError);
    return res.status(500).json({ error: `Server Processing Error: ${apiError.message || "Unknown error occurred"}` });
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
module.exports.maxDuration = 60;
