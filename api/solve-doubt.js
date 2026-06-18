import { GoogleGenAI } from "@google/genai";
import formidable from "formidable";
import fs from "fs";

// Vercel Default Body Parser ని డిసేబుల్ చేయాలి (ఎందుకంటే మనం ఫైల్స్/మల్టీపార్ట్ డేటా తీసుకుంటున్నాం)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Gemini API క్లయింట్ ఇన్షియలైజేషన్
// మీ Vercel Dashboard లో GEMINI_API_KEY ని Environment Variable గా యాడ్ చేయండి
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

      // 1. ఇమేజ్ ఫైల్ ఉంటే దాన్ని Gemini ఫార్మాట్ లోకి మార్చడం
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

      // 2. వాయిస్ రికార్డింగ్ ఫైల్ ఉంటే దాన్ని చేర్చడం
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

      // 3. సిస్టమ్ ఇన్‌స్ట్రక్షన్ మరియు ప్రాంప్ట్ సిద్ధం చేయడం
      const systemInstruction = 
        "You are an expert tutor on StudyConnect. Analyze the given text query, image, or audio doubt. " +
        "Provide a clear, accurate, step-by-step educational solution. Use markdown for headings or bullet points if needed. " +
        "If the user asks in Telugu or English, respond in a clear, easy-to-understand language according to their tone.";

      // టెక్స్ట్ ప్రాంప్ట్‌ను కంటెంట్‌లో యాడ్ చేయాలి
      const finalPrompt = promptText 
        ? `${promptText}\n\nPlease solve the doubt attached in the multimodal inputs above.` 
        : "Please analyze the attached image/audio doubt and provide a detailed solution.";
        
      aiContents.push(finalPrompt);

      // 4. Gemini Model ని కాల్ చేయడం (Multimodal కి gemini-2.5-flash బెస్ట్)
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: aiContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.4,
        }
      });

      // 5. సక్సెస్ రెస్పాన్స్ పంపడం
      return res.status(200).json({ solution: response.text });

    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      return res.status(500).json({ error: `AI Engine Error: ${apiError.message}` });
    }
  });
}
