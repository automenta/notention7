import type { Property } from '../types';

export const getNoteSemantics = (htmlContent: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const foundTags = Array.from(
    tempDiv.querySelectorAll<HTMLElement>('.widget.tag')
  )
    .map((el) => el.dataset.tag || '')
    .filter(Boolean);
  const tags = Array.from(new Set(foundTags)); // Ensure uniqueness

  const foundProperties: Property[] = Array.from(
    tempDiv.querySelectorAll<HTMLElement>('.widget.property')
  )
    .map((el) => {
      let values: string[] = [];
      try {
        // Safely parse the values array from the data attribute
        values = JSON.parse(el.dataset.values || '[]');
        if (!Array.isArray(values)) values = [];
      } catch {
        values = []; // Default to empty array on parsing error
      }

      return {
        key: el.dataset.key || '',
        operator: el.dataset.operator || 'is',
        values: values,
      };
    })
    .filter((p) => p.key);
  const properties = foundProperties;

  // An imaginary property is one whose operator is not 'is'.
  const isImaginary = foundProperties.some((p) => p.operator !== 'is');

  return { tags, properties, isImaginary };
};

const matchProperty = (real: Property, imaginary: Property): boolean => {
  if (real.key !== imaginary.key) {
    return false;
  }

  // For now, we assume single values for simplicity.
  const realValue = real.values[0];
  const imaginaryValue = imaginary.values[0];

  switch (imaginary.operator) {
    case 'is':
      return realValue === imaginaryValue;
    case 'is not':
      return realValue !== imaginaryValue;
    case 'contains':
      return realValue.includes(imaginaryValue);
    case 'does not contain':
      return !realValue.includes(imaginaryValue);
    case 'is greater than':
      return Number(realValue) > Number(imaginaryValue);
    case 'is less than':
      return Number(realValue) < Number(imaginaryValue);
    // TODO: Add date/datetime operators
    default:
      return false;
  }
};

/**
 * Checks if a source note (with real data) satisfies a query note (with imaginary data).
 */
export const matchNotes = (
  sourceProperties: Property[],
  queryProperties: Property[]
): boolean => {
  // Every property in the query must be satisfied by at least one property in the source.
  return queryProperties.every((imaginaryProp) => {
    return sourceProperties.some((realProp) =>
      matchProperty(realProp, imaginaryProp)
    );
  });
};
