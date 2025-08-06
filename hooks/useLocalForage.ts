import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';
import localforage from 'localforage';

export function useLocalForage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    localforage
      .getItem<T>(key)
      .then((value) => {
        if (isMounted) {
          if (value !== null) {
            // Check if it's a plain object for merging, to avoid breaking arrays or other types
            if (
              Object.prototype.toString.call(initialValue) ===
                '[object Object]' &&
              Object.prototype.toString.call(value) === '[object Object]'
            ) {
              setStoredValue({
                ...(initialValue as object),
                ...(value as object),
              } as T);
            } else {
              setStoredValue(value);
            }
          } else {
            // If nothing is stored, use the initial value
            setStoredValue(initialValue);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(`Error reading from localForage key "${key}":`, err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [key, initialValue]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localforage.setItem(key, valueToStore).catch((err) => {
          console.error(`Error writing to localForage key "${key}":`, err);
        });
      } catch (err) {
        console.error(err);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, loading];
}
