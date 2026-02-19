
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client following coding guidelines: use named parameter and direct process.env access.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chatbot functionality using gemini-3-flash-preview for fast and efficient assistance.
export const sendChatMessage = async (
  message: string, 
  history: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: {
        systemInstruction: "You are a helpful assistant for the Co-op Academies Trust CPD Portal. Help staff with questions about professional development, status classifications, and technical issues. Keep answers concise and professional."
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I am having trouble connecting to the Co-op intelligence network.";
  }
};

// Facilitator AI: Analyze CPD content to suggest Status using thinking capabilities for complex reasoning.
export const analyzeCPDStatus = async (
  title: string, 
  description: string, 
  audience: string
): Promise<string> => {
  try {
    const prompt = `
      Analyze this CPD event for Co-op Academies Trust.
      Title: ${title}
      Description: ${description}
      Audience: ${audience}

      Based on the description, suggest if this should be:
      - STATUTORY (Legal requirement like Safeguarding)
      - MANDATORY (Trust policy requirement)
      - TRUST PRIORITY (Strategic goal)
      - OPTIONAL (General interest)

      Provide a 1 sentence rationale.
    `;

    // Using gemini-3-pro-preview with thinkingBudget for nuanced policy adherence analysis.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
      }
    });

    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Could not analyze CPD status.";
  }
};

// Maps Grounding to find venue info. MANDATORY: MUST extract URLs from groundingChunks.
export const askAboutVenue = async (venueName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Where is ${venueName}? Provide the address and a brief review summary if available.`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });
    
    let textOutput = response.text || "Could not find venue information.";
    
    // As per guidelines, grounding URLs must be extracted and listed.
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const links = chunks
        .map((chunk: any) => chunk.maps?.uri)
        .filter(Boolean);
      
      if (links.length > 0) {
        textOutput += "\n\n**Venue Resources:**\n" + links.map((url: string) => `- [View on Maps](${url})`).join('\n');
      }
    }

    return textOutput;
  } catch (error) {
    console.error("Maps Error:", error);
    return "Unable to retrieve map data at this time.";
  }
}
