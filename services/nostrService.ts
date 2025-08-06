import { SimplePool } from 'nostr-tools';

/**
 * A shared Nostr SimplePool instance to be used across the entire application.
 * This prevents creating multiple WebSocket connections to the same relays and ensures
 * connection state is managed centrally.
 */
export const pool = new SimplePool();
