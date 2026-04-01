import { GoogleGenerativeAI } from "@google/generative-ai";

let API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Clean API key if it contains quotes from .env
if (API_KEY && (API_KEY.startsWith('"') || API_KEY.startsWith("'"))) {
  API_KEY = API_KEY.substring(1, API_KEY.length - 1);
}

if (
  !API_KEY ||
  API_KEY === "undefined" ||
  API_KEY === "null" ||
  API_KEY.startsWith("YOUR_")
) {
  console.error(
    "Gemini API Key is missing, undefined, or invalid. Found:",
    API_KEY,
  );
  console.warn(
    "Please check your .env file and RESTART the dev server (npm start).",
  );
} else {
  console.log(
    "Gemini API Key loaded successfully. Starts with:",
    `${API_KEY.substring(0, 10)}...`,
  );
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

/**
 * Retries a function with exponential backoff on rate limit errors.
 */
const withRetry = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.message?.includes("retryDelay");

      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
        console.warn(
          `Rate limited. Retrying in ${Math.round(delay / 1000)}s... (attempt ${attempt + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

/**
 * Normal conversational chat with Gemini.
 * @param {Array} history - Array of previous messages in format: { role: 'user' | 'model', parts: [{text: string}] }
 * @param {string} message - The current user message
 */
export const chatWithGemini = async (history, message) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Filter out any empty or malformed history entries
    const formattedHistory = (history || [])
      .filter((msg) => msg && msg.parts && msg.parts[0] && msg.parts[0].text)
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.parts[0].text }],
      }));

    const result = await withRetry(async () => {
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });
      return await chat.sendMessage(message);
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error chatting with Gemini:", error);

    if (
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      throw new Error(
        "The AI is currently busy. Please wait a moment and try again.",
      );
    }
    throw new Error("Failed to get a response from the AI. Please try again.");
  }
};

/**
 * Generates a career roadmap mapped to React Flow nodes and edges.
 * @param {string} prompt - The user's goal, e.g., "Node.js" or "Web Development"
 */
export const generateCareerRoadmap = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const query = `
      You are an expert career counselor and curriculum designer. 
      The user wants to learn: "${prompt}".
      Design a step-by-step roadmap to master this topic and get a job.
      Format your response EXACTLY as a valid JSON object with two arrays: "nodes" and "edges", suitable for React Flow.
      
      Nodes must look like: { "id": "1", "position": { "x": 0, "y": 0 }, "data": { "label": "Topic Name", "description": "Short explanation" }, "type": "default" }
      Edges must look like: { "id": "e1-2", "source": "1", "target": "2", "animated": true }
      
      Space the nodes out vertically (y increasing by 150 each step) and horizontally if there are parallel topics.
      Keep it practical: include basics, advanced topics, projects, and interview prep.
      
      Return ONLY valid JSON. Do NOT wrap it in \`\`\`json blocks.
    `;

    const result = await withRetry(async () => {
      return await model.generateContent(query);
    });

    const response = await result.response;
    const text = response.text().trim();

    // Attempt to parse JSON. Sometimes the model wraps it in markdown blocks anyway.
    let jsonStr = text;
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```/g, "").trim();
    }

    const data = JSON.parse(jsonStr);

    if (!data.nodes || !data.edges) {
      throw new Error("AI response is missing nodes or edges.");
    }

    return data;
  } catch (error) {
    console.error("Gemini Roadmap Generation Error Details:", {
      message: error.message,
      stack: error.stack,
      prompt,
    });

    if (
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      throw new Error(
        "The AI is currently busy due to high usage. Please wait a minute and try again.",
      );
    }
    throw new Error("Failed to generate the career roadmap. " + error.message);
  }
};
