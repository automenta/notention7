import { useMemo } from 'react';

interface CollectionItem {
  id: string;
}

export const useCollection = <T extends CollectionItem>(items: T[]) => {
  const collection = useMemo(() => {
    const defaultItem = items.length > 0 ? items[0] : undefined;

    const getItem = (id: string): T | undefined => {
      return items.find((item) => item.id === id);
    };

    return {
      items,
      default: defaultItem,
      getItem,
    };
  }, [items]);

  return collection;
};
