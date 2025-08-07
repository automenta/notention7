import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import type { OntologyNode } from '../types';

// New type for AI Actions
export type AIAction =
  | 'summarize'
  | 'key-points'
  | 'questions'
  | 'action-items';

// --- PROMPTS ---
const PROMPTS: Record<AIAction, string> = {
  summarize: `Summarize the following note content into a single, concise paragraph.
    Focus on the main narrative and key points.
    Ignore structured data like hashtags or key-value properties.
    Do not include any introductory phrases like "This note is about..." in your response.`,

  'key-points': `Analyze the following note content and extract the key points and most important takeaways.
    Present them as a bulleted list (using '- ' for each point).
    Focus on conciseness and clarity.`,

  questions: `Analyze the following note content and generate a list of questions that the content could answer.
    This is for studying or self-testing purposes.
    Present them as a numbered list.`,

  'action-items': `Analyze the following note content and identify any potential action items, tasks, or to-dos.
    If you find any, present them as a bulleted list (using '- ' for each point).
    If no action items are found, respond with "No action items found."`,
};

// Define the Zod schema for structured output (for suggestTagsAndProperties)
const SuggestionsSchema = z.object({
  tags: z.array(z.string()).describe('List of suggested tag strings'),
  properties: z
    .array(
      z.object({
        key: z.string().describe('The key of the property'),
        value: z.string().describe('The inferred value of the property'),
      })
    )
    .describe('List of suggested property objects, each with a key and value'),
});

export interface AISuggestions {
  tags: string[];
  properties: { key: string; value: string }[];
}

const getModel = (apiKey: string) => {
  if (!apiKey) {
    throw new Error('Gemini API key not provided.');
  }
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: 'gemini-1.5-flash',
    temperature: 0.2,
  });
};

/**
 * Generates content for a given text using a specified AI action, streaming the results.
 */
export async function* generateContentStream(
  apiKey: string,
  action: AIAction,
  textToProcess: string
): AsyncGenerator<string, void, undefined> {
  const model = getModel(apiKey);
  const systemPrompt = PROMPTS[action];

  if (!systemPrompt) {
    throw new Error(`Invalid AI action: ${action}`);
  }

  const prompt = [new SystemMessage(systemPrompt), new HumanMessage(textToProcess)];

  try {
    const stream = await model.stream(prompt);
    for await (const chunk of stream) {
      yield chunk.content.toString();
    }
  } catch (error) {
    console.error(`Error during ${action} generation with Langchain:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating content.');
  }
}


// This function remains for other potential uses.
export const suggestTagsAndProperties = async (
  apiKey: string,
  content: string,
  ontology: OntologyNode[]
): Promise<AISuggestions> => {
  // Use the model with structured output
  const model = getModel(apiKey).withStructuredOutput(SuggestionsSchema);

  // Simplified ontology for the prompt to save tokens and improve focus
  const ontologyForPrompt = ontology.map((node) => ({
    label: node.label,
    description: node.description,
    properties: Object.keys(node.attributes || {}),
    children: node.children?.map((child) => child.label),
  }));

  const prompt = [
    new SystemMessage(
      `You are a helpful assistant that analyzes note content and suggests semantic tags and properties based on a provided ontology.
      Your goal is to accurately map concepts from the note to the ontology.

      - Analyze the following note content.
      - Based on the provided ontology, suggest relevant tags (from node labels) and properties (from node attributes).
      - Only suggest tags and property keys that exist in the ontology.
      - For properties, infer the most likely value from the text.
      - If no relevant tags or properties can be found, return empty arrays.
      `
    ),
    new HumanMessage(
      `ONTOLOGY:
      ${JSON.stringify(ontologyForPrompt, null, 2)}
      ---
      NOTE CONTENT:
      ${content}
      `
    ),
  ];

  try {
    const response = await model.invoke(prompt);
    return response;
  } catch (error) {
    console.error('Error suggesting tags/properties with Langchain:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate suggestions: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating suggestions.');
  }
};
