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

export const chatWithGemini = async (contextData, message) => {
  try {
    // Switching to the same reliable model used for roadmap generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const query = `
      You are an expert AI Career Guide assisting a software professional or learner.
      
      USER CONTEXT:
      - Education: ${contextData.education || "Unknown"}
      - Interests: ${contextData.interests?.join(", ") || "Unknown"}
      - Current Career Goal / Roadmap: ${contextData.roadmapName || "Currently exploring options"}
      
      Answer the user's question clearly, concisely, and supportively based on this context. 
      CRITICAL RULE: Keep your response short and precise (maximum 2-3 sentences).
      CRITICAL RULE: DO NOT use any markdown formatting like **bolding** or *italics*. Use plain text only so it renders nicely.
      
      User's message:
      "${message}"
    `;

    const result = await withRetry(async () => {
      return await model.generateContent(query);
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
      
      Nodes must look like: { "id": "1", "data": { "label": "Topic Name", "description": "Short explanation" }, "type": "custom" }
      Edges must look like: { "id": "e1-2", "source": "1", "target": "2" }
      
      CRITICAL STRUCTURE RULES:
      1. Create a logical, branching learning tree.
      2. STRICT LIMIT: A parent node MUST NOT have more than 3 child nodes. NEVER exceed 3 children for any single node.
      3. Format the label exactly like a structured syllabus (e.g., "1. Version Control", "1(a) Git and related tools", "2. DevOps").
      4. Organize content logically (Main Topic -> Subtopics). 
      5. To avoid excessive clutter, DO NOT generate more than 5 or 6 nodes in the same width/parallel scope.
      6. Keep it practical: include basics, advanced topics, projects, and interview prep.
      
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

/**
 * Generates top 3 career suggestions based on education and interests.
 */
export const getCareerSuggestions = async (education, interests) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const query = `
      You are an expert career counselor. 
      The user has education: "${education}" and interests: "${interests.join(', ')}".
      Based on this, suggest the top 3 best matching career roles.
      Return the output strictly as a JSON array of objects with keys: "role" (e.g. Software Developer), "match" (e.g. 92), "description" (a short 1-sentence description).
      Do NOT wrap in markdown \`\`\`json blocks. Return ONLY valid JSON array.
    `;

    const result = await withRetry(async () => {
      return await model.generateContent(query);
    });

    const response = await result.response;
    let text = response.text().trim();
    if (text.startsWith("```json")) text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    else if (text.startsWith("```")) text = text.replace(/```/g, "").trim();

    const data = JSON.parse(text);
    return data; // Should be array of 3 objects
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to get suggestions. Please try again.");
  }
};

/**
 * Generates a simpler 5-step horizontal/vertical roadmap.
 */
export const generateTimelineRoadmap = async (careerRole) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const query = `
      You are an expert career counselor.
      The user wants to become a "${careerRole}".
      Provide exactly 5 key steps to reach this career.
      For each step, include 1 to 5 subtasks that break down the step into actionable items.
      Return the output strictly as a JSON array of objects with exactly these keys:
      "title" (e.g., "Learn Programming Basics"),
      "description" (short 1 sentence description),
      "subtasks" (an array of objects with keys: "title" (e.g., "Basic Syntax"), "completed" always set to false).
      Do NOT wrap in markdown \`\`\`json blocks. Return ONLY valid JSON array.
    `;

    const result = await withRetry(async () => {
      return await model.generateContent(query);
    });

    const response = await result.response;
    let text = response.text().trim();
    if (text.startsWith("```json")) text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    else if (text.startsWith("```")) text = text.replace(/```/g, "").trim();

    const data = JSON.parse(text);
    return data; // Should be array of 5 objects
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate roadmap. Please try again.");
  }
};

