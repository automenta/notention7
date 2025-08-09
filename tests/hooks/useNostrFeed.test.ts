import {renderHook, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {useNostrFeed} from '../../hooks/useNostrFeed';
import {nostrService} from '../../services/NostrService';
import * as nostrProfileHook from '../../hooks/useNostrProfile';

// Mock dependencies
vi.mock('../../services/NostrService', () => ({
    nostrService: {
        subscribeToPublicFeed: vi.fn(),
    },
}));
vi.mock('../../hooks/useNostrProfile');

const mockSubscribeToPublicFeed = nostrService.subscribeToPublicFeed as jest.Mock;
const mockUseNostrProfile = nostrProfileHook.useNostrProfile as jest.Mock;

describe('hooks/useNostrFeed', () => {
    beforeEach(() => {
        mockUseNostrProfile.mockReturnValue({});
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should not fetch feed if pubkey is null', () => {
        const {result} = renderHook(() => useNostrFeed(null));
        expect(result.current.isLoading).toBe(false);
        expect(result.current.sortedEvents).toEqual([]);
        expect(mockSubscribeToPublicFeed).not.toHaveBeenCalled();
    });

    it('should set isLoading to true initially and then to false after timeout', async () => {
        mockSubscribeToPublicFeed.mockReturnValue({close: vi.fn()});
        const {result} = renderHook(() => useNostrFeed('test-pubkey'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, {timeout: 3500}); // Wait for the 3s timeout in the hook
    });

    it('should subscribe to the feed and process events', async () => {
        const mockSub = {
            close: vi.fn(),
        };
        mockSubscribeToPublicFeed.mockReturnValue(mockSub);

        const event1 = {id: '1', content: 'Event 1', created_at: 100, pubkey: 'p1'};
        const event2 = {id: '2', content: 'Event 2', created_at: 200, pubkey: 'p2'};

        const {result} = renderHook(() => useNostrFeed('test-pubkey'));

        // Simulate receiving events
        const oneventCallback = mockSubscribeToPublicFeed.mock.calls[0][0];
        oneventCallback(event2);
        oneventCallback(event1);
        oneventCallback(event2); // Duplicate event to test seen logic

        await waitFor(() => {
            expect(result.current.sortedEvents).toHaveLength(2);
            // Should be sorted by created_at descending
            expect(result.current.sortedEvents.map((e) => e.id)).toEqual(['2', '1']);
        });

        expect(mockSub.close).not.toHaveBeenCalled();
    });

    it('should clean up subscription on unmount', () => {
        const mockSub = {
            close: vi.fn(),
        };
        mockSubscribeToPublicFeed.mockReturnValue(mockSub);

        const {unmount} = renderHook(() => useNostrFeed('test-pubkey'));

        unmount();

        expect(mockSub.close).toHaveBeenCalledTimes(1);
    });

    it('should call useNostrProfile with the correct pubkeys', async () => {
        const mockSub = {close: vi.fn()};
        mockSubscribeToPublicFeed.mockReturnValue(mockSub);

        const event1 = {id: '1', content: 'Event 1', created_at: 100, pubkey: 'p1'};
        const event2 = {id: '2', content: 'Event 2', created_at: 200, pubkey: 'p2'};

        renderHook(() => useNostrFeed('test-pubkey'));

        const oneventCallback = mockSubscribeToPublicFeed.mock.calls[0][0];
        oneventCallback(event1);
        oneventCallback(event2);

        await waitFor(() => {
            const lastCall = mockUseNostrProfile.mock.calls.pop();
            // Using Set for order-independent comparison
            expect(new Set(lastCall[0])).toEqual(new Set(['p1', 'p2', 'test-pubkey']));
        });
    });
});
