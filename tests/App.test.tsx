import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import { NotesProvider } from '../components/contexts/NotesContext';
import { SettingsProvider } from '../components/contexts/SettingsContext';
import { ViewProvider } from '../components/contexts/ViewContext';

// Mock the context providers to avoid side effects
vi.mock('../components/contexts/NotesContext', async () => {
  const original = await vi.importActual('../components/contexts/NotesContext');
  return {
    ...original,
    useNotes: () => ({
      notes: [],
      addNote: vi.fn(),
      deleteNote: vi.fn(),
      notesLoading: false,
    }),
  };
});

vi.mock('../components/contexts/ViewContext', async () => {
  const original = await vi.importActual('../components/contexts/ViewContext');
  return {
    ...original,
    useView: () => ({
      activeView: 'notes',
      setActiveView: vi.fn(),
      selectedNoteId: null,
      setSelectedNoteId: vi.fn(),
    }),
  };
});

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
