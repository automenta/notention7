import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { InsertMenu } from '../../../components/editor/InsertMenu';
import '@testing-library/jest-dom';

describe('InsertMenu', () => {
  const mockItems = [
    { id: '1', type: 'tag', label: 'Tag Item', description: 'This is a tag' },
    {
      id: '2',
      type: 'template',
      label: 'Template Item',
      description: 'This is a template',
    },
    {
      id: '3',
      type: 'property',
      label: 'Property Item',
      description: 'This is a property',
    },
  ];

  it('renders without crashing', () => {
    render(<InsertMenu items={mockItems} onSelect={() => {}} />);
  });

  it('displays the items', () => {
    render(<InsertMenu items={mockItems} onSelect={() => {}} />);
    expect(screen.getByText('Tag Item')).toBeInTheDocument();
    expect(screen.getByText('Template Item')).toBeInTheDocument();
    expect(screen.getByText('Property Item')).toBeInTheDocument();
  });

  it('filters items based on search term', async () => {
    const user = userEvent.setup();
    render(<InsertMenu items={mockItems} onSelect={() => {}} />);
    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'Template');
    expect(screen.queryByText('Tag Item')).not.toBeInTheDocument();
    expect(screen.getByText('Template Item')).toBeInTheDocument();
  });

  describe('Keyboard Navigation', () => {
    it('highlights the first item by default', () => {
      render(<InsertMenu items={mockItems} onSelect={() => {}} />);
      expect(screen.getByTestId('insert-menu-item-1')).toHaveClass('bg-blue-600');
    });

    it('moves selection down on ArrowDown and wraps around', async () => {
      const user = userEvent.setup();
      render(<InsertMenu items={mockItems} onSelect={() => {}} />);

      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('insert-menu-item-2')).toHaveClass('bg-blue-600');

      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('insert-menu-item-3')).toHaveClass('bg-blue-600');

      // Wrap around
      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('insert-menu-item-1')).toHaveClass('bg-blue-600');
    });

    it('moves selection up on ArrowUp and wraps around', async () => {
      const user = userEvent.setup();
      render(<InsertMenu items={mockItems} onSelect={() => {}} />);

      // Wraps around to the last item
      await user.keyboard('{ArrowUp}');
      expect(screen.getByTestId('insert-menu-item-3')).toHaveClass('bg-blue-600');
    });

    it('calls onSelect with the correct item on Enter', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(<InsertMenu items={mockItems} onSelect={onSelect} />);

      await user.keyboard('{ArrowDown}'); // Select item 2
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledWith(mockItems[1]);
    });

    it('resets selection when search term changes', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<InsertMenu items={mockItems} onSelect={onSelect} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('insert-menu-item-2')).toHaveClass('bg-blue-600');

      await user.type(input, 'Prop');

      expect(screen.getByTestId('insert-menu-item-3')).toBeInTheDocument();
      expect(screen.queryByTestId('insert-menu-item-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('insert-menu-item-3')).toHaveClass('bg-blue-600');

      await user.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledWith(mockItems[2]);
    });
  });
});
