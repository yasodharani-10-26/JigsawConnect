import { GoogleGenAI } from "@google/generative-ai";
import formidable from "formidable";
import fs from "fs";

// Vercel Default Body Parser ని డిసేబుల్ చేయడం (మల్టీపార్ట్ డేటా కోసం)
export const config = {
  api: {
    bodyParser: false,
  },
};

// @google/generative-ai ప్యాకేజీ ప్రకారం క్లయింట్ ఇనిషియలైజేషన్
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Form డేటాను పార్స్ చేయడానికి Formidable సెటప్
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "Error parsing upload data." });
    }

    try {
      const promptText = fields.text ? fields.text[0] : "";
      const aiContents = [];

      // 1. ఇమేజ్ ఫైల్ ఉంటే చేర్చడం
      if (files.image && files.image[0]) {
        const imageFile = files.image[0];
        const imageBuffer = fs.readFileSync(imageFile.filepath);
        aiContents.push({
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: imageFile.mimetype,
          },
        });
      }

      // 2. వాయిస్ రికార్డింగ్ ఫైల్ ఉంటే చేర్చడం
      if (files.voice && files.voice[0]) {
        const voiceFile = files.voice[0];
        const voiceBuffer = fs.readFileSync(voiceFile.filepath);
        aiContents.push({
          inlineData: {
            data: voiceBuffer.toString("base64"),
            mimeType: voiceFile.mimetype || "audio/mp3",
          },
        });
      }

      // 3. సిస్టమ్ ఇన్‌స్ట్రక్షన్ సిద్ధం చేయడం
      const systemInstruction = 
        "You are an expert tutor on StudyConnect. Analyze the given text query, image, or audio doubt. " +
        "Provide a clear, accurate, step-by-step educational solution. Use markdown for headings or bullet points if needed. " +
        "If the user asks in Telugu or English, respond in a clear, easy-to-understand language according to their tone.";

      // టెక్స్ట్ ప్రాంప్ట్‌ను సిద్ధం చేయడం
      const finalPrompt = promptText 
        ? `${promptText}\n\nPlease solve the doubt attached in the multimodal inputs above.` 
        : "Please analyze the attached image/audio doubt and provide a detailed solution.";
        
      aiContents.push(finalPrompt);

      // 4. @google/generative-ai కొత్త సింటాక్స్ ప్రకారం మోడల్ ని కాల్ చేయడం
      // Multimodal సపోర్ట్ కోసం gemini-1.5-flash ఇక్కడ వాడబడింది
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
      });

      const result = await model.generateContent({
        contents: [{ parts: aiContents }],
        generationConfig: {
          temperature: 0.4,
        }
      });

      const response = await result.response;
      const text = response.text();

      // 5. సక్సెస్ రెస్పాన్స్ పంపడం
      return res.status(200).json({ solution: text });

    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      return res.status(500).json({ error: `AI Engine Error: ${apiError.message}` });
    }
  });
}
