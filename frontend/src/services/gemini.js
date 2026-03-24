import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY ;

if (!API_KEY || API_KEY.startsWith('YOUR_')) {
  console.warn("Gemini API Key is missing or invalid. Please check your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Normal conversational chat with Gemini.
 * @param {Array} history - Array of previous messages in format: { role: 'user' | 'model', parts: [{text: string}] }
 * @param {string} message - The current user message
 */
export const chatWithGemini = async (history, message) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // Format history for Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts[0].text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error chatting with Gemini:", error);
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
    
    // Explicitly ask for a JSON format containing nodes and edges
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

    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text().trim();
    
    // Attempt to parse JSON. Sometimes the model wraps it in markdown blocks anyway.
    let jsonStr = text;
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (jsonStr.startsWith('\`\`\`')) {
      jsonStr = jsonStr.replace(/\`\`\`/g, '').trim();
    }

    const data = JSON.parse(jsonStr);
    return data;
  } catch (error) {
    console.error("Gemini Roadmap Generation Error Details:", {
      message: error.message,
      stack: error.stack,
      prompt
    });
    throw new Error("Failed to generate the career roadmap. This could be due to API limits or invalid input. Detailed error: " + error.message);
  }
};
