import { useState } from 'react';
import { nostrService } from '../services/NostrService';
import type { Note } from '@/types';

export const useNostrPublish = () => {
  const [isPublishing, setIsPublishing] = useState(false);

  const publishNote = async (note: Note, privkey: string) => {
    if (!privkey) {
      alert('Nostr private key not set in settings.');
      return;
    }
    setIsPublishing(true);
    try {
      await nostrService.publishNote(note, privkey);
      alert('Note published successfully!');
    } catch (error) {
      console.error('Failed to publish note:', error);
      alert(`Failed to publish note. See console for details.`);
    } finally {
      setIsPublishing(false);
    }
  };

  return { isPublishing, publishNote };
};
