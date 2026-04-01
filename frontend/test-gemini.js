require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load API key from .env (CRA uses REACT_APP_ prefix)
let API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Clean API key if it contains quotes
if (API_KEY && (API_KEY.startsWith('"') || API_KEY.startsWith("'"))) {
  API_KEY = API_KEY.substring(1, API_KEY.length - 1);
}

if (!API_KEY) {
  console.error("Error: REACT_APP_GEMINI_API_KEY is missing in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const withRetry = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("RESOURCE_EXHAUSTED");

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

async function testChat() {
  console.log("\n--- Testing Chat ---");
  try {
    const result = await withRetry(async () => {
      const chat = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 100 },
      });
      return await chat.sendMessage("Say hello!");
    });
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("Chat Error:", error.message);
  }
}

async function testRoadmap() {
  console.log("\n--- Testing Roadmap Generation ---");
  const prompt = "React Developer";
  const query = `
    You are an expert career counselor. 
    Design a step-by-step roadmap for: "${prompt}".
    Return ONLY a valid JSON object with {"nodes": [], "edges": []}.
  `;
  try {
    const result = await withRetry(async () => {
      return await model.generateContent(query);
    });
    const response = await result.response;
    const text = response.text().trim();
    console.log("Raw Response received!");
    try {
      const json = JSON.parse(text.replace(/```json|```/g, "").trim());
      console.log("Successfully parsed JSON Roadmap!");
    } catch (e) {
      console.error("JSON Parse Error:", e.message);
    }
  } catch (error) {
    console.error("Roadmap Error:", error.message);
  }
}

async function runTests() {
  console.log("Using API Key starting with:", API_KEY.substring(0, 10));
  await testChat();
  await testRoadmap();
}

runTests();
