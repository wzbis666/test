import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item) as T;
      // Basic structural validation
      if (key === 'dayplan-events' && !Array.isArray(parsed)) {
        console.warn('Corrupted events data, resetting');
        return initialValue;
      }
      return parsed;
    } catch {
      console.warn('Failed to parse localStorage data, using defaults');
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          const serialized = JSON.stringify(valueToStore);
          window.localStorage.setItem(key, serialized);
        } catch (e) {
          if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded. Consider exporting data.');
            // Still update state — data persists in memory for the session
          } else {
            console.error('Failed to save to localStorage:', e);
          }
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
