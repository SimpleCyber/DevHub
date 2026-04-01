require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

let API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
if (API_KEY && (API_KEY.startsWith('"') || API_KEY.startsWith("'"))) {
  API_KEY = API_KEY.substring(1, API_KEY.length - 1);
}

if (!API_KEY) {
  console.error("Error: REACT_APP_GEMINI_API_KEY is missing in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    // Note: The @google/generative-ai library doesn't have a direct listModels on the genAI object usually,
    // but we can try to find them by name or use a different approach.
    // Actually, let's just try the most common ones one by one.
      const modelsToTry = [
      "gemini-2.5-flash-lite"
    ];

    console.log("Testing model availability...");
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        if (result) {
          console.log(`✅ Model ${modelName} is available!`);
        }
      } catch (err) {
        console.log(`❌ Model ${modelName} failed: ${err.message.substring(0, 100)}...`);
      }
    }
  } catch (error) {
    console.error("List Models Error:", error.message);
  }
}

listModels();
