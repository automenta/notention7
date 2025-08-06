import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StringInput } from '@/components/editor/inputs/StringInput';

describe('StringInput', () => {
  it('should render with the initial value', () => {
    const handleChange = vi.fn();
    render(<StringInput value="initial" onChange={handleChange} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial');
  });

  it('should call onChange with the new value when text is entered', () => {
    const handleChange = vi.fn();
    render(<StringInput value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('new value');
  });

  it('should apply autoFocus when the prop is true', () => {
    const handleChange = vi.fn();
    render(<StringInput value="" onChange={handleChange} autoFocus />);

    const input = screen.getByRole('textbox');
    expect(document.activeElement).toBe(input);
  });

  it('should use the provided placeholder', () => {
    const handleChange = vi.fn();
    render(<StringInput value="" onChange={handleChange} placeholder="My Placeholder" />);

    const input = screen.getByPlaceholderText('My Placeholder');
    expect(input).toBeInTheDocument();
  });
});
