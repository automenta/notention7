import { useEffect, useState } from 'react';
import { getNoteSemantics } from '../utils/noteSemantics';

export const useNoteSemantics = (htmlContent: string) => {
  const [tags, setTags] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isImaginary, setIsImaginary] = useState(false);

  useEffect(() => {
    const { tags, properties, isImaginary } = getNoteSemantics(htmlContent);
    setTags(tags);
    setProperties(properties);
    setIsImaginary(isImaginary);
  }, [htmlContent]);

  return { tags, properties, isImaginary };
};
