import { GoogleGenerativeAI } from "@google/generative-ai";

// Vercel Default Body Parser ని డిసేబుల్ చేయాలి
export const config = {
  api: {
    bodyParser: false,
  },
};

// Node.js Request Stream ని సింపుల్‌గా Buffer లోకి మార్చే హెల్పర్ ఫంక్షన్
function parseRequestStream(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "Server Configuration Error: GEMINI_API_KEY is missing." 
    });
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    
    // 1. రిక్వెస్ట్ బాడీ స్ట్రీమ్‌ను బఫర్‌గా మార్చడం
    const bodyBuffer = await parseRequestStream(req);
    
    // 2. Standard Web Request కి మార్చడం (ఇది పక్కాగా వర్క్ అవుతుంది)
    const contentType = req.headers["content-type"] || "";
    const webReq = new Request(`https://${req.headers.host}${req.url}`, {
      method: "POST",
      headers: {
        "content-type": contentType,
      },
      body: bodyBuffer,
    });

    const formData = await webReq.formData();
    
    // ఫ్రంటెండ్ నుండి పంపిన 'text' ఫీల్డ్ ని రీడ్ చేయడం
    const promptText = formData.get("text") || "";
    const parts = [];

    // 1. Image Check & Handle
    const imageFile = formData.get("image");
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      parts.push({
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: imageFile.type || "image/jpeg",
        },
      });
    }

    // 2. Voice Check & Handle
    const voiceFile = formData.get("voice");
    if (voiceFile && voiceFile instanceof File && voiceFile.size > 0) {
      const voiceBuffer = Buffer.from(await voiceFile.arrayBuffer());
      parts.push({
        inlineData: {
          data: voiceBuffer.toString("base64"),
          mimeType: voiceFile.type || "audio/mp3",
        },
      });
    }

    // 3. Final Prompt Structure
    const finalPrompt = promptText 
      ? `${promptText}\n\nPlease solve the doubt attached in the multimodal inputs above.` 
      : "Please analyze the attached image/audio doubt and provide a detailed solution.";
      
    parts.push({ text: finalPrompt });

    const systemInstruction = 
      "You are an expert tutor on StudyConnect. Analyze the given text query, image, or audio doubt. " +
      "Provide a clear, accurate, step-by-step educational solution. Use markdown for headings or bullet points if needed. " +
      "If the user asks in Telugu or English, respond in a clear, easy-to-understand language according to their tone.";

    // 🚀 gemini-2.5-flash మోడల్ యాక్టివేషన్
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: systemInstruction
    });

    // Gemini API Request
    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
      generationConfig: { temperature: 0.4 }
    });

    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ solution: text });

  } catch (apiError) {
    console.error("Gemini Server Exception:", apiError);
    return res.status(500).json({ error: `AI Engine Crash: ${apiError.message}` });
  }
}
