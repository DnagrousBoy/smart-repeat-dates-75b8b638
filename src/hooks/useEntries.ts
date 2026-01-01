import { useState, useEffect } from 'react';
import { Entry } from '@/types/entry';

const STORAGE_KEY = 'periodic-calendar-entries';

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load entries from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEntries(parsed);
      } catch (e) {
        console.error('Failed to parse stored entries:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const addEntry = (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEntry: Entry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  const updateEntry = (id: string, updates: Partial<Entry>) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const togglePause = (id: string) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, isPaused: !entry.isPaused, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  };

  const importEntries = (newEntries: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const now = new Date().toISOString();
    const entriesToAdd: Entry[] = newEntries.map(entry => ({
      ...entry,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }));
    setEntries(prev => [...prev, ...entriesToAdd]);
  };

  return {
    entries,
    isLoaded,
    addEntry,
    updateEntry,
    deleteEntry,
    togglePause,
    importEntries,
  };
}
