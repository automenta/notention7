import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {NumberInput} from '@/components/editor/inputs/NumberInput';

describe('NumberInput', () => {
    it('renders with initial value and placeholder', () => {
        render(<NumberInput value="10" onChange={() => {
        }} placeholder="Enter a number"/>);
        const input = screen.getByPlaceholderText('Enter a number') as HTMLInputElement;
        expect(input.value).toBe('10');
    });

    it('calls onChange when the input value changes', () => {
        const handleChange = vi.fn();
        render(<NumberInput value="10" onChange={handleChange}/>);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, {target: {value: '20'}});
        expect(handleChange).toHaveBeenCalledWith('20');
    });

    it('increments the value when the + button is clicked', () => {
        const handleChange = vi.fn();
        render(<NumberInput value="10" onChange={handleChange}/>);
        const incrementButton = screen.getByLabelText('Increment');
        fireEvent.click(incrementButton);
        expect(handleChange).toHaveBeenCalledWith('11');
    });

    it('decrements the value when the - button is clicked', () => {
        const handleChange = vi.fn();
        render(<NumberInput value="10" onChange={handleChange}/>);
        const decrementButton = screen.getByLabelText('Decrement');
        fireEvent.click(decrementButton);
        expect(handleChange).toHaveBeenCalledWith('9');
    });

    it('handles incrementing from an empty string value', () => {
        const handleChange = vi.fn();
        render(<NumberInput value="" onChange={handleChange}/>);
        const incrementButton = screen.getByLabelText('Increment');
        fireEvent.click(incrementButton);
        expect(handleChange).toHaveBeenCalledWith('1');
    });

    it('handles decrementing from an empty string value', () => {
        const handleChange = vi.fn();
        render(<NumberInput value="" onChange={handleChange}/>);
        const decrementButton = screen.getByLabelText('Decrement');
        fireEvent.click(decrementButton);
        expect(handleChange).toHaveBeenCalledWith('-1');
    });

    it('handles incrementing from a non-numeric string value', () => {
        const handleChange = vi.fn();
        render(<NumberInput value="abc" onChange={handleChange}/>);
        const incrementButton = screen.getByLabelText('Increment');
        fireEvent.click(incrementButton);
        expect(handleChange).toHaveBeenCalledWith('1');
    });

    it('handles decrementing from a non-numeric string value', () => {
        const handleChange = vi.fn();
        render(<NumberInput value="abc" onChange={handleChange}/>);
        const decrementButton = screen.getByLabelText('Decrement');
        fireEvent.click(decrementButton);
        expect(handleChange).toHaveBeenCalledWith('-1');
    });

    it('handles floating point numbers correctly for increment', () => {
        const handleChange = vi.fn();
        render(<NumberInput value="1.5" onChange={handleChange}/>);
        const incrementButton = screen.getByLabelText('Increment');
        fireEvent.click(incrementButton);
        expect(handleChange).toHaveBeenCalledWith('2.5');
    });

    it('handles floating point numbers correctly for decrement', () => {
        const handleChange = vi.fn();
        render(<NumberInput value="1.5" onChange={handleChange}/>);
        const decrementButton = screen.getByLabelText('Decrement');
        fireEvent.click(decrementButton);
        expect(handleChange).toHaveBeenCalledWith('0.5');
    });

    it('sets autoFocus on the input when the autoFocus prop is true', () => {
        render(<NumberInput value="" onChange={() => {
        }} autoFocus/>);
        const input = screen.getByRole('spinbutton');
        expect(document.activeElement).toBe(input);
    });
});
