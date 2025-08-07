import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import { NotesProvider } from '../components/contexts/NotesContext';
import { SettingsProvider } from '../components/contexts/SettingsContext';
import { ViewProvider } from '../components/contexts/ViewContext';

// Mock the useNotes hook which is the dependency of the NotesProvider
vi.mock('../hooks/useNotes', () => ({
  useNotes: () => ({
    notes: [],
    addNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    notesLoading: false,
  }),
}));

describe('App component', () => {
  it('should render without crashing', () => {
    // We just want to make sure rendering doesn't throw an error.
    // We don't need to assert anything about the output for a simple smoke test.
    expect(() =>
      render(
        <SettingsProvider>
          <NotesProvider>
            <ViewProvider>
              <App />
            </ViewProvider>
          </NotesProvider>
        </SettingsProvider>
      )
    ).not.toThrow();
  });
});
