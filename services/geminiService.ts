
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY") {
    console.warn("Gemini API key is not set in process.env.API_KEY. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const summarizeText = async (textToSummarize: string): Promise<string> => {
    if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY") {
        throw new Error("Gemini API key not configured. Cannot summarize text.");
    }

    try {
        const model = 'gemini-2.5-flash';

        const prompt = `Your task is to summarize the following note content. The note may contain a mix of free-form text, hashtags, and structured key-value properties (e.g., "status is Done"). Your summary should focus on the main narrative and key points from the free-form text. Do not simply list the properties. Generate a single, concise paragraph. Output only the summary text itself, without any introductory phrases like "Here is a summary:".

        Note Content:
        ---
        ${textToSummarize}
        ---
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.2,
                topP: 0.9,
                topK: 20,
            }
        });

        const summary = response.text;
        if (!summary) {
            throw new Error("Received an empty summary from the API.");
        }
        
        return summary.trim();

    } catch (error) {
        console.error("Error summarizing text with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the summary.");
    }
};
