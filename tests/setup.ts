// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'react'; // Ensure React is loaded for all tests
import React from 'react';
import {vi} from 'vitest';

// Make React globally available for tests, which can help with some environment issues.
(global as typeof globalThis & { React: typeof React }).React = React;

// Polyfill for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Polyfill for Element.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
