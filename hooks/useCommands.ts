import { useMemo } from 'react';
import { useSettingsContext } from '@/components/contexts/SettingsContext';
import { useViewContext } from '@/components/contexts/ViewContext';
import { useNoteManagement } from './useNoteManagement';
import { useNotesContext } from '@/components/contexts/NotesContext';
import { Command } from '@/components/common/CommandPalette';
import { nostrService } from '@/services/NostrService';
import { useNotification } from '@/components/contexts/NotificationContext';

export const useCommands = (): Command[] => {
  const { settings, setSettings } = useSettingsContext();
  const { setActiveView } = useViewContext();
  const { selectedNote, handleDeleteAndSelectNext } = useNoteManagement();
  const { addNote } = useNotesContext();
  const { addNotification } = useNotification();

  const commands = useMemo(() => {
    const allCommands: Command[] = [];

    // --- Note Commands ---
    allCommands.push({
      id: 'new-note',
      name: 'New Note',
      action: () => {
        const newNote = addNote();
        setActiveView('notes');
      },
      section: 'Notes',
    });

    if (selectedNote) {
      allCommands.push({
        id: 'delete-note',
        name: 'Delete Current Note',
        action: () => handleDeleteAndSelectNext(selectedNote.id),
        section: 'Notes',
      });

      allCommands.push({
        id: 'copy-note-id',
        name: 'Copy Note ID',
        action: () => {
            navigator.clipboard.writeText(selectedNote.id);
            addNotification('Note ID copied to clipboard.');
        },
        section: 'Notes',
      });

      allCommands.push({
        id: 'publish-note',
        name: 'Publish Note to Nostr',
        action: async () => {
          if (!settings.nostr.privkey) {
            addNotification('Nostr private key not set in settings.');
            return;
          }
          try {
            await nostrService.publishNote(selectedNote, settings.nostr.privkey);
            addNotification('Note published to Nostr.');
          } catch (error) {
            addNotification('Failed to publish note.');
            console.error(error);
          }
        },
        section: 'Notes',
      });
    }

    // --- View Commands ---
    allCommands.push({
      id: 'view-notes',
      name: 'Switch View: Notes',
      action: () => setActiveView('notes'),
      section: 'Navigation',
    });
    allCommands.push({
      id: 'view-ontology',
      name: 'Switch View: Ontology',
      action: () => setActiveView('ontology'),
      section: 'Navigation',
    });
    allCommands.push({
      id: 'view-map',
      name: 'Switch View: Map',
      action: () => setActiveView('map'),
      section: 'Navigation',
    });
    allCommands.push({
        id: 'view-graph',
        name: 'Switch View: Graph',
        action: () => setActiveView('network'),
        section: 'Navigation',
    });
    allCommands.push({
        id: 'view-discovery',
        name: 'Switch View: Discovery',
        action: () => setActiveView('discovery'),
        section: 'Navigation',
    });
    allCommands.push({
      id: 'view-settings',
      name: 'Switch View: Settings',
      action: () => setActiveView('settings'),
      section: 'Navigation',
    });

    // --- Global Commands ---
    allCommands.push({
        id: 'toggle-theme',
        name: `Toggle Theme (current: ${settings.theme})`,
        action: () => {
            setSettings(s => ({...s, theme: s.theme === 'dark' ? 'light' : 'dark'}));
        },
        section: 'Global',
    });

    return allCommands;
  }, [selectedNote, addNote, setActiveView, handleDeleteAndSelectNext, settings, addNotification, setSettings]);

  return commands;
};
