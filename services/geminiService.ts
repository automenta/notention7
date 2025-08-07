import { GoogleGenAI } from '@google/genai';
import type { OntologyNode } from '../types';

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

export interface AISuggestions {
  tags: string[];
  properties: { key: string; value: string }[];
}

export const suggestTagsAndProperties = async (
  content: string,
  ontology: OntologyNode[]
): Promise<AISuggestions> => {
  if (!isApiKeyAvailable) {
    throw new Error('Gemini API key not configured. Cannot get suggestions.');
  }

  // Simplified ontology for the prompt
  const ontologyForPrompt = ontology.map((node) => ({
    label: node.label,
    description: node.description,
    properties: Object.keys(node.attributes || {}),
    children: node.children?.map((child) => child.label),
  }));

  try {
    const model = 'gemini-2.5-flash';

    const prompt = `Analyze the following note content. Based on the provided ontology, suggest relevant tags and properties.

Respond with a JSON object with two keys: "tags" (an array of strings) and "properties" (an array of objects, each with "key" and "value" strings).

Only suggest tags and properties that exist in the ontology. For properties, infer the most likely value from the text.

---
ONTOLOGY:
${JSON.stringify(ontologyForPrompt, null, 2)}
---
NOTE CONTENT:
${content}
---

JSON Response:
`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.1,
        topP: 0.9,
        topK: 20,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received an empty response from the API.');
    }

    return JSON.parse(responseText) as AISuggestions;
  } catch (error) {
    console.error('Error suggesting tags/properties with Gemini API:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate suggestions: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating suggestions.');
  }
};
