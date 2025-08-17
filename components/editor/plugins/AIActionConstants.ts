import { AIAction } from '@/services/languageModelService';

export const AI_ACTIONS: { id: AIAction; label: string }[] = [
  { id: 'summarize', label: 'Summarize' },
  { id: 'key-points', label: 'Extract Key Points' },
  { id: 'questions', label: 'Generate Questions' },
  { id: 'action-items', label: 'Find Action Items' },
];

export const COPY_BUTTON_TEXT = 'Copy';
export const COPIED_BUTTON_TEXT = 'Copied!';
