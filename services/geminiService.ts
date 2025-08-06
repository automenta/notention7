import { GoogleGenAI } from '@google/genai';

export const isApiKeyAvailable = !!(
  process.env.API_KEY && process.env.API_KEY !== 'YOUR_GEMINI_API_KEY'
);

if (!isApiKeyAvailable) {
  console.warn(
    'Gemini API key is not set in process.env.API_KEY. AI features will be disabled.'
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const summarizeText = async (
  textToSummarize: string
): Promise<string> => {
  if (!isApiKeyAvailable) {
    throw new Error('Gemini API key not configured. Cannot summarize text.');
  }

  try {
    const model = 'gemini-2.5-flash';

    const prompt = `Summarize the following note content into a single, concise paragraph. Focus on the main narrative and key points. Ignore structured data like hashtags or key-value properties. Do not include any introductory phrases in your response.

Note Content:
${textToSummarize}
        `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.2,
        topP: 0.9,
        topK: 20,
      },
    });

    const summary = response.text;
    if (!summary) {
      throw new Error('Received an empty summary from the API.');
    }

    return summary.trim();
  } catch (error) {
    console.error('Error summarizing text with Gemini API:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the summary.');
  }
};
