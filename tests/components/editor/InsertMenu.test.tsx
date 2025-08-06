import React from 'react';
import { render, screen } from '@testing-library/react';
import { InsertMenu } from '../../../components/editor/InsertMenu';
import '@testing-library/jest-dom';

describe('InsertMenu', () => {
  const mockItems = [
    { id: '1', type: 'tag', label: 'Tag 1', description: 'This is a tag' },
    { id: '2', type: 'template', label: 'Template 1', description: 'This is a template' },
    { id: '3', type: 'property', label: 'Property 1', description: 'This is a property' },
  ];

  it('renders without crashing', () => {
    render(<InsertMenu items={mockItems} onSelect={() => {}} />);
  });

  it('displays the items', () => {
    render(<InsertMenu items={mockItems} onSelect={() => {}} />);
    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Template 1')).toBeInTheDocument();
    expect(screen.getByText('Property 1')).toBeInTheDocument();
  });
});
