import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NoteListItem } from '@/components/sidebar/NoteListItem';
import type { Note } from '@/types';

const mockNote: Note = {
  id: '1',
  content: '<p>This is a test note.</p>',
  title: 'Test Note',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockPublishedNote: Note = {
  ...mockNote,
  id: '2',
  title: 'Published Note',
  nostrEventId: 'evt123',
  publishedAt: new Date().toISOString(),
};

describe('NoteListItem', () => {
  it('renders the note title and content preview', () => {
    render(<NoteListItem note={mockNote} isSelected={false} onSelect={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is a test note.')).toBeInTheDocument();
  });

  it('renders "Untitled Note" if the note has no title', () => {
    const noteWithoutTitle = { ...mockNote, title: '' };
    render(<NoteListItem note={noteWithoutTitle} isSelected={false} onSelect={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Untitled Note')).toBeInTheDocument();
  });

  it('renders "No content" if the note content is empty', () => {
    const noteWithoutContent = { ...mockNote, content: '' };
    render(<NoteListItem note={noteWithoutContent} isSelected={false} onSelect={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('No content')).toBeInTheDocument();
  });

  it('shows the world icon for a published note', () => {
    render(<NoteListItem note={mockPublishedNote} isSelected={false} onSelect={() => {}} onDelete={() => {}} />);
    const worldIcon = screen.getByTitle(/Published on Nostr at/);
    expect(worldIcon).toBeInTheDocument();
  });

  it('does not show the world icon for a local note', () => {
    render(<NoteListItem note={mockNote} isSelected={false} onSelect={() => {}} onDelete={() => {}} />);
    const worldIcon = screen.queryByTitle(/Published on Nostr at/);
    expect(worldIcon).not.toBeInTheDocument();
  });

  it('applies selected styles when isSelected is true', () => {
    const { container } = render(<NoteListItem note={mockNote} isSelected={true} onSelect={() => {}} onDelete={() => {}} />);
    expect(container.firstChild).toHaveClass('bg-blue-600/30');
  });

  it('applies hover styles when isSelected is false', () => {
    const { container } = render(<NoteListItem note={mockNote} isSelected={false} onSelect={() => {}} onDelete={() => {}} />);
    expect(container.firstChild).toHaveClass('hover:bg-gray-800');
    expect(container.firstChild).not.toHaveClass('bg-blue-600/30');
  });

  it('calls onSelect when the item is clicked', () => {
    const handleSelect = vi.fn();
    render(<NoteListItem note={mockNote} isSelected={false} onSelect={handleSelect} onDelete={() => {}} />);
    fireEvent.click(screen.getByText('Test Note'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(<NoteListItem note={mockNote} isSelected={false} onSelect={() => {}} onDelete={handleDelete} />);
    const deleteButton = screen.getByTitle('Delete Note');
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect when the delete button is clicked', () => {
    const handleSelect = vi.fn();
    const handleDelete = vi.fn();
    render(<NoteListItem note={mockNote} isSelected={false} onSelect={handleSelect} onDelete={handleDelete} />);
    const deleteButton = screen.getByTitle('Delete Note');
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
