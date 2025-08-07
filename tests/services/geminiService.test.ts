import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { OntologyNode } from '../../types';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  const mockGoogleGenAI = vi.fn(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  }));
  return { GoogleGenAI: mockGoogleGenAI };
});

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('when API key is NOT configured', () => {
    it('should throw an error when API_KEY is undefined', async () => {
      vi.stubEnv('API_KEY', undefined);
      const { summarizeText } = await import('../../services/geminiService');
      await expect(summarizeText('test')).rejects.toThrow(
        'Gemini API key not configured. Cannot summarize text.'
      );
    });

    it('should throw an error when API_KEY is the placeholder value', async () => {
      vi.stubEnv('API_KEY', 'YOUR_GEMINI_API_KEY');
      const { summarizeText } = await import('../../services/geminiService');
      await expect(summarizeText('test')).rejects.toThrow(
        'Gemini API key not configured. Cannot summarize text.'
      );
    });
  });

  describe('when API key IS configured', () => {
    beforeEach(() => {
      vi.stubEnv('API_KEY', 'test-api-key');
    });

    it('should return a summary on successful API call', async () => {
      const mockSummary = 'This is a summary.';
      mockGenerateContent.mockResolvedValue({ text: mockSummary });
      const { summarizeText } = await import('../../services/geminiService');
      const result = await summarizeText('Some long text to summarize.');
      expect(result).toBe(mockSummary);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the API call fails', async () => {
      const errorMessage = 'API Error';
      mockGenerateContent.mockRejectedValue(new Error(errorMessage));
      const { summarizeText } = await import('../../services/geminiService');
      await expect(summarizeText('test')).rejects.toThrow(
        `Failed to generate summary: ${errorMessage}`
      );
    });

    it('should throw an error if the API returns an empty summary', async () => {
      mockGenerateContent.mockResolvedValue({ text: '' });
      const { summarizeText } = await import('../../services/geminiService');
      await expect(summarizeText('test')).rejects.toThrow(
        'Received an empty summary from the API.'
      );
    });

    it('should throw a generic error for unknown failures', async () => {
      mockGenerateContent.mockRejectedValue('a string error');
      const { summarizeText } = await import('../../services/geminiService');
      await expect(summarizeText('test')).rejects.toThrow(
        'An unknown error occurred while generating the summary.'
      );
    });
  });

  describe('suggestTagsAndProperties', () => {
    const mockOntology: OntologyNode[] = [{ id: 'test', label: 'Test' }];
    const mockContent = 'This is a test note.';

    describe('when API key is NOT configured', () => {
      it('should throw an error', async () => {
        vi.stubEnv('API_KEY', undefined);
        const { suggestTagsAndProperties } = await import(
          '../../services/geminiService'
        );
        await expect(
          suggestTagsAndProperties(mockContent, mockOntology)
        ).rejects.toThrow(
          'Gemini API key not configured. Cannot get suggestions.'
        );
      });
    });

    describe('when API key IS configured', () => {
      beforeEach(() => {
        vi.stubEnv('API_KEY', 'test-api-key');
      });

      it('should return suggestions on successful API call', async () => {
        const mockSuggestions = { tags: ['Test'], properties: [] };
        mockGenerateContent.mockResolvedValue({
          text: JSON.stringify(mockSuggestions),
        });
        const { suggestTagsAndProperties } = await import(
          '../../services/geminiService'
        );
        const result = await suggestTagsAndProperties(
          mockContent,
          mockOntology
        );
        expect(result).toEqual(mockSuggestions);
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        expect(mockGenerateContent).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({
              responseMimeType: 'application/json',
            }),
          })
        );
      });

      it('should throw an error if the API call fails', async () => {
        mockGenerateContent.mockRejectedValue(new Error('API Error'));
        const { suggestTagsAndProperties } = await import(
          '../../services/geminiService'
        );
        await expect(
          suggestTagsAndProperties(mockContent, mockOntology)
        ).rejects.toThrow('Failed to generate suggestions: API Error');
      });
    });
  });
});
