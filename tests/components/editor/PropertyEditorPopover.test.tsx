import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PropertyEditorPopover } from '@/components/editor/PropertyEditorPopover.tsx';
import type { OntologyAttribute } from '@/types.ts';

// Mock the MapPickerModal as it's not the focus of this test
vi.mock('../../../components/map/MapPickerModal', () => ({
  MapPickerModal: vi.fn(({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="map-picker-modal" onClick={onClose}>
        Map Picker
      </div>
    ) : null
  ),
}));

const mockOnSave = vi.fn();
const mockOnDelete = vi.fn();
const mockOnClose = vi.fn();

const defaultOntology: Map<string, OntologyAttribute> = new Map([
  [
    'status',
    {
      type: 'enum',
      options: ['active', 'inactive'],
      operators: { real: ['is'], imaginary: ['is-not'] },
    },
  ],
  [
    'price',
    {
      type: 'number',
      operators: { real: ['is'], imaginary: ['<', '>', 'between'] },
    },
  ],
  [
    'meeting',
    { type: 'date', operators: { real: ['is'], imaginary: ['>', '<'] } },
  ],
  [
    'deadline',
    { type: 'datetime', operators: { real: ['is'], imaginary: [] } },
  ],
  ['location', { type: 'geo', operators: { real: ['is'], imaginary: [] } }],
  [
    'description',
    { type: 'string', operators: { real: ['is'], imaginary: ['contains'] } },
  ],
]);

const renderPopover = (
  widgetData: Record<string, string>,
  propertyTypes = defaultOntology
) => {
  const widgetEl = document.createElement('div');
  widgetEl.id = 'widget-1';
  Object.entries(widgetData).forEach(([key, value]) => {
    widgetEl.dataset[key] = value;
  });
  // Mock getBoundingClientRect
  widgetEl.getBoundingClientRect = () => ({
    top: 100,
    bottom: 120,
    left: 100,
    right: 200,
    width: 100,
    height: 20,
    x: 100,
    y: 100,
    toJSON: () => ({}),
  });

  document.body.appendChild(widgetEl);

  render(
    <PropertyEditorPopover
      widgetEl={widgetEl}
      propertyTypes={propertyTypes}
      onSave={mockOnSave}
      onDelete={mockOnDelete}
      onClose={mockOnClose}
    />
  );

  return { widgetEl };
};

describe('PropertyEditorPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a string input by default', () => {
    renderPopover({ key: 'description', values: '["hello"]' });
    const input = screen.getByPlaceholderText('Value');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('hello');
  });

  it('renders a number input for number type', () => {
    renderPopover({ key: 'price', values: '["123"]' });
    const input = screen.getByPlaceholderText('Value');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveValue(123);
  });

  it('renders two number inputs for "between" operator', () => {
    renderPopover({
      key: 'price',
      operator: 'between',
      values: '["100", "200"]',
    });
    const input1 = screen.getByPlaceholderText('Value 1');
    const input2 = screen.getByPlaceholderText('Value 2');
    expect(input1).toBeInTheDocument();
    expect(input2).toBeInTheDocument();
    expect(input1).toHaveValue(100);
    expect(input2).toHaveValue(200);
  });

  it('renders a date input for date type', () => {
    renderPopover({ key: 'meeting', values: '["2024-08-06"]' });
    const input = screen.getByDisplayValue('2024-08-06');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'date');
  });

  it('renders a datetime-local input for datetime type', () => {
    renderPopover({ key: 'deadline', values: '["2024-08-06T10:00"]' });
    const input = screen.getByDisplayValue('2024-08-06T10:00');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'datetime-local');
  });

  it('renders a select dropdown for enum type', () => {
    renderPopover({ key: 'status', values: '["active"]' });
    const select = screen.getByDisplayValue('active');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('renders a text input with a map button for geo type', () => {
    renderPopover({ key: 'location', values: '["40.7,-74.0"]' });
    expect(screen.getByPlaceholderText('lat,lng')).toBeInTheDocument();
    expect(screen.getByTitle('Select on Map')).toBeInTheDocument();
  });

  it('opens MapPickerModal when map button is clicked', () => {
    renderPopover({ key: 'location', values: '[""]' });
    const mapButton = screen.getByTitle('Select on Map');
    fireEvent.click(mapButton);
    expect(screen.getByTestId('map-picker-modal')).toBeInTheDocument();
  });

  it('calls onSave with updated values when form is submitted', () => {
    renderPopover({ key: 'description', values: '["initial"]' });
    const input = screen.getByPlaceholderText('Value');
    fireEvent.change(input, { target: { value: 'updated' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('widget-1', 'description', 'is', [
      'updated',
    ]);
  });

  it('calls onDelete when delete button is clicked', () => {
    renderPopover({ key: 'description', values: '[""]' });
    const deleteButton = screen.getByTitle('Delete Property');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('widget-1');
  });

  it('calls onClose when cancel button is clicked', () => {
    renderPopover({ key: 'description', values: '[""]' });
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking outside the popover', () => {
    renderPopover({ key: 'description', values: '[""]' });
    fireEvent.mouseDown(document.body);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('initializes with empty string for values if data-values is malformed JSON', () => {
    renderPopover({ key: 'description', values: 'not-json' });
    const input = screen.getByPlaceholderText('Value');
    expect(input).toHaveValue('');
  });
});
