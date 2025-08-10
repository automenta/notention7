import { useMemo } from 'react';
import { useAppContext } from '@/components/contexts/AppContext';
import { useNoteManagement } from './useNoteManagement';
import { useNotesContext } from '@/components/contexts/NotesContext';
import { Command } from '@/components/common/CommandPalette';
import { nostrService } from '@/services/NostrService';
import { useNotification } from '@/components/contexts/NotificationContext';

export const useCommands = (): Command[] => {
  const { setActiveView, settings } = useAppContext();
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
        action: () => handleDeleteAndSelectNext(),
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

    return allCommands;
  }, [selectedNote, addNote, setActiveView, handleDeleteAndSelectNext, settings, addNotification]);

  return commands;
};
