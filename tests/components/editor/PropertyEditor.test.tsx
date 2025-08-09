import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {vi} from 'vitest';
import {PropertyEditor} from '@/components/editor/PropertyEditor.tsx';
import type {OntologyAttribute, Property} from '@/types';

import type {StringInputProps} from '@/components/editor/inputs/StringInput.tsx';

// Mock child input components
vi.mock('../../../components/editor/inputs/StringInput', () => ({
    StringInput: ({value, onChange, ...props}: StringInputProps) => (
        <input
            data-testid="string-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...props}
        />
    ),
}));
vi.mock('../../../components/editor/inputs/NumberInput', () => ({
    NumberInput: ({value, onChange, ...props}: StringInputProps) => (
        <input
            data-testid="number-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...props}
        />
    ),
}));
vi.mock('../../../components/editor/inputs/DateInput', () => ({
    DateInput: ({value, onChange, ...props}: StringInputProps) => (
        <input
            data-testid="date-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...props}
        />
    ),
}));
vi.mock('../../../components/editor/KeySelector', () => ({
    KeySelector: ({value, onChange}: { value: string; onChange: (v: string) => void }) => (
        <input
            data-testid="key-selector"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
}));

const mockPropertyTypes = new Map<string, OntologyAttribute>([
    [
        'name',
        {
            type: 'string',
            operators: {real: ['is', 'isnot'], imaginary: ['contains']},
        },
    ],
    [
        'age',
        {
            type: 'number',
            operators: {real: ['is'], imaginary: ['>', '<', 'between']},
        },
    ],
    [
        'birthdate',
        {
            type: 'date',
            operators: {real: ['is'], imaginary: []},
        },
    ],
]);

describe('PropertyEditor', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly for a new string property', () => {
        render(
            <PropertyEditor
                propertyTypes={mockPropertyTypes}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        expect(screen.getByTestId('key-selector')).toBeInTheDocument();
        // Initially, no specific input is shown until a key is selected
    });

    it('initializes with and displays data from an existing property', () => {
        const existingProperty: Property = {
            key: 'name',
            operator: 'is',
            values: ['John Doe'],
        };
        render(
            <PropertyEditor
                property={existingProperty}
                propertyTypes={mockPropertyTypes}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        expect(screen.getByTestId('key-selector')).toHaveValue('name');
        expect(screen.getByDisplayValue('is')).toBeInTheDocument();
        expect(screen.getByTestId('string-input')).toHaveValue('John Doe');
    });

    it('preserves value and operator when key changes to a compatible type', () => {
        const property: Property = {
            key: 'name',
            operator: 'is',
            values: ['test'],
        };
        const {rerender} = render(
            <PropertyEditor
                property={property}
                propertyTypes={mockPropertyTypes}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        // Simulate user changing the key in the parent component's state
        const newProperty = {...property, key: 'birthdate'};
        rerender(
            <PropertyEditor
                property={newProperty}
                propertyTypes={mockPropertyTypes}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        expect(screen.getByDisplayValue('is')).toBeInTheDocument(); // 'is' is valid for date
        expect(screen.getByTestId('date-input')).toHaveValue('test'); // Value is preserved
    });

    it('preserves value but resets operator when key changes to incompatible type', () => {
        const property: Property = {
            key: 'name',
            operator: 'contains',
            values: ['acme'],
        };
        const {rerender} = render(
            <PropertyEditor
                property={property}
                propertyTypes={mockPropertyTypes}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        // Change key to 'age'. 'age' does not support the 'contains' operator.
        const newProperty = {...property, key: 'age'};
        rerender(
            <PropertyEditor
                property={newProperty}
                propertyTypes={mockPropertyTypes}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        // The operator should be reset to the first valid one for 'number' ('is')
        expect(screen.getByDisplayValue('is')).toBeInTheDocument();
        // The value should be preserved
        expect(screen.getByTestId('number-input')).toHaveValue('acme');
    });

    it('calls onSave with the updated data when form is submitted', () => {
        const existingProperty: Property = {
            key: 'name',
            operator: 'is',
            values: [''],
        };
        render(
            <PropertyEditor
                property={existingProperty}
                propertyTypes={mockPropertyTypes}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        fireEvent.change(screen.getByTestId('string-input'), {
            target: {value: 'New Value'},
        });
        fireEvent.click(screen.getByText('Save'));

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith({
            key: 'name',
            operator: 'is',
            values: ['New Value'],
        });
    });

    it('renders two value inputs when operator is "between"', () => {
        const property: Property = {
            key: 'age',
            operator: 'is', // Start with 'is'
            values: ['25'],
        };
        render(
            <PropertyEditor
                property={property}
                propertyTypes={mockPropertyTypes}
                onSave={onSave}
                onCancel={onCancel}
            />,
        );

        // Initially, there should be one input
        expect(screen.getAllByTestId('number-input')).toHaveLength(1);

        // Change the operator to 'between'
        fireEvent.change(screen.getByDisplayValue('is'), {
            target: {value: 'between'},
        });

        // Now there should be two inputs
        expect(screen.getAllByTestId('number-input')).toHaveLength(2);
    });

    it('saves two values when operator is "between"', () => {
        const property: Property = {
            key: 'age',
            operator: 'between',
            values: ['20', '30'],
        };
        render(
            <PropertyEditor
                property={property}
                propertyTypes={mockPropertyTypes}
                onSave={onSave}
                onCancel={onCancel}
            />,
        );

        const inputs = screen.getAllByTestId('number-input');
        fireEvent.change(inputs[0], {target: {value: '25'}});
        fireEvent.change(inputs[1], {target: {value: '35'}});

        fireEvent.click(screen.getByText('Save'));

        expect(onSave).toHaveBeenCalledWith({
            key: 'age',
            operator: 'between',
            values: ['25', '35'],
        });
    });
});
