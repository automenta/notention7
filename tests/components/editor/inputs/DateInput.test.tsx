import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {DateInput} from '@/components/editor/inputs/DateInput';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

describe('DateInput', () => {
    it('renders with the initial value', () => {
        render(<DateInput value="2024-01-01" onChange={() => {
        }}/>);
        const input = screen.getByTestId('date-input') as HTMLInputElement;
        expect(input.value).toBe('2024-01-01');
    });

    it('calls onChange when a new date is entered', () => {
        const handleChange = vi.fn();
        render(<DateInput value="" onChange={handleChange}/>);
        const input = screen.getByTestId('date-input');
        fireEvent.change(input, {target: {value: '2024-02-15'}});
        expect(handleChange).toHaveBeenCalledWith('2024-02-15');
    });

    it('calls onChange with today\'s date when the "Today" button is clicked', () => {
        const handleChange = vi.fn();
        render(<DateInput value="" onChange={handleChange}/>);
        const todayButton = screen.getByRole('button', {name: "Set to today's date"});
        fireEvent.click(todayButton);
        expect(handleChange).toHaveBeenCalledWith(getTodayString());
    });

    it('overwrites an existing date when "Today" button is clicked', () => {
        const handleChange = vi.fn();
        render(<DateInput value="2000-01-01" onChange={handleChange}/>);
        const todayButton = screen.getByRole('button', {name: "Set to today's date"});
        fireEvent.click(todayButton);
        expect(handleChange).toHaveBeenCalledWith(getTodayString());
    });

    it('applies autoFocus when the prop is true', () => {
        render(<DateInput value="" onChange={() => {
        }} autoFocus/>);
        const input = screen.getByTestId('date-input');
        expect(document.activeElement).toBe(input);
    });
});
