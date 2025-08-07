import type { Property, OntologyAttribute } from '../types';

export const getNoteSemantics = (htmlContent: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const foundTags = Array.from(
    tempDiv.querySelectorAll<HTMLElement>('.widget.tag'),
  )
    .map((el) => el.dataset.tag || '')
    .filter(Boolean);
  const tags = Array.from(new Set(foundTags)); // Ensure uniqueness

  const foundProperties: Property[] = Array.from(
    tempDiv.querySelectorAll<HTMLElement>('.widget.property'),
  )
    .map((el) => {
      let values: string[] = [];
      try {
        values = JSON.parse(el.dataset.values || '[]');
        if (!Array.isArray(values)) values = [];
      } catch {
        values = [];
      }
      return {
        key: el.dataset.key || '',
        operator: el.dataset.operator || 'is',
        values: values,
      };
    })
    .filter((p) => p.key);
  const properties = foundProperties;

  const isImaginary = foundProperties.some((p) => p.operator !== 'is');

  return { tags, properties, isImaginary };
};

const matchProperty = (
  real: Property,
  imaginary: Property,
  attributeType: OntologyAttribute,
): boolean => {
  if (real.key !== imaginary.key) {
    return false;
  }

  const realValue = real.values[0];
  if (realValue === undefined) {
    return false;
  }

  const imaginaryValue1 = imaginary.values[0];
  const imaginaryValue2 = imaginary.values[1];

  if (imaginaryValue1 === undefined) {
    return false;
  }
  if (
    (imaginary.operator === 'between' ||
      imaginary.operator === 'is not between') &&
    imaginaryValue2 === undefined
  ) {
    return false;
  }

  switch (attributeType.type) {
    case 'number': {
      const realNum = parseFloat(realValue);
      const imaginaryNum1 = parseFloat(imaginaryValue1);
      if (isNaN(realNum) || isNaN(imaginaryNum1)) {
        return false;
      }
      switch (imaginary.operator) {
        case 'is':
          return realNum === imaginaryNum1;
        case 'is not':
          return realNum !== imaginaryNum1;
        case 'greater than':
          return realNum > imaginaryNum1;
        case 'less than':
          return realNum < imaginaryNum1;
        case 'between': {
          const imaginaryNum2 = parseFloat(imaginaryValue2 as string);
          if (isNaN(imaginaryNum2)) return false;
          const min = Math.min(imaginaryNum1, imaginaryNum2);
          const max = Math.max(imaginaryNum1, imaginaryNum2);
          return realNum >= min && realNum <= max;
        }
        default:
          return false;
      }
    }

    case 'date':
    case 'datetime': {
      const realDate = new Date(realValue);
      const imaginaryDate1 = new Date(imaginaryValue1);
      if (isNaN(realDate.getTime()) || isNaN(imaginaryDate1.getTime())) {
        return false;
      }

      const isSameDay =
        realDate.getUTCFullYear() === imaginaryDate1.getUTCFullYear() &&
        realDate.getUTCMonth() === imaginaryDate1.getUTCMonth() &&
        realDate.getUTCDate() === imaginaryDate1.getUTCDate();

      switch (imaginary.operator) {
        case 'is':
        case 'is on':
          return isSameDay;
        case 'is not on':
          return !isSameDay;
        case 'is after':
          return realDate.getTime() > imaginaryDate1.getTime();
        case 'is before':
          return realDate.getTime() < imaginaryDate1.getTime();
        case 'between': {
          const imaginaryDate2 = new Date(imaginaryValue2 as string);
          if (isNaN(imaginaryDate2.getTime())) return false;
          const minTime = Math.min(
            imaginaryDate1.getTime(),
            imaginaryDate2.getTime(),
          );
          const maxTime = Math.max(
            imaginaryDate1.getTime(),
            imaginaryDate2.getTime(),
          );
          return realDate.getTime() >= minTime && realDate.getTime() <= maxTime;
        }
        case 'is not between': {
          const imaginaryDate2 = new Date(imaginaryValue2 as string);
          if (isNaN(imaginaryDate2.getTime())) return false;
          const minTime = Math.min(
            imaginaryDate1.getTime(),
            imaginaryDate2.getTime(),
          );
          const maxTime = Math.max(
            imaginaryDate1.getTime(),
            imaginaryDate2.getTime(),
          );
          return realDate.getTime() < minTime || realDate.getTime() > maxTime;
        }
        default:
          return false;
      }
    }

    case 'string':
    case 'enum':
    default: {
      switch (imaginary.operator) {
        case 'is':
          return realValue === imaginaryValue1;
        case 'is not':
          return realValue !== imaginaryValue1;
        case 'contains':
          return realValue.includes(imaginaryValue1);
        case 'does not contain':
          return !realValue.includes(imaginaryValue1);
        default:
          return false;
      }
    }
  }
};

export const matchNotes = (
  sourceProperties: Property[],
  queryProperties: Property[],
  ontologyIndex: Map<string, OntologyAttribute>,
): boolean => {
  return queryProperties.every((imaginaryProp) => {
    const attributeType = ontologyIndex.get(imaginaryProp.key);
    if (!attributeType) {
      return false;
    }

    return sourceProperties.some((realProp) =>
      matchProperty(realProp, imaginaryProp, attributeType),
    );
  });
};
