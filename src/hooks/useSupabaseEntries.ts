import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Entry, frequencyToDbEnum, dbEnumToFrequency, Frequency } from '@/types/entry';
import { useAuth } from './useAuth';

export function useSupabaseEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch entries from Supabase
  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setIsLoaded(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('calendar_entries')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching entries:', error);
        setError(error.message);
        return;
      }

      // Transform database entries to frontend format
      const transformedEntries: Entry[] = (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        amount: row.amount ? parseFloat(String(row.amount)) : undefined,
        startDate: row.date,
        frequency: dbEnumToFrequency[row.frequency] || 'monthly',
        endDate: row.end_date || undefined,
        isPaused: row.is_paused || false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setEntries(transformedEntries);
      setError(null);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch entries');
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('calendar_entries')
        .insert({
          user_id: user.id,
          date: entry.startDate,
          title: entry.title,
          frequency: frequencyToDbEnum[entry.frequency] as any,
          description: entry.description || null,
          amount: entry.amount || null,
          is_paused: entry.isPaused,
          end_date: entry.endDate || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        setError(error.message);
        return null;
      }

      const newEntry: Entry = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        amount: data.amount ? parseFloat(String(data.amount)) : undefined,
        startDate: data.date,
        frequency: dbEnumToFrequency[data.frequency] || 'monthly',
        endDate: data.end_date || undefined,
        isPaused: data.is_paused || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to add entry');
      return null;
    }
  };

  const updateEntry = async (id: string, updates: Partial<Entry>) => {
    if (!user) return;

    try {
      const dbUpdates: Record<string, any> = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description || null;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount || null;
      if (updates.startDate !== undefined) dbUpdates.date = updates.startDate;
      if (updates.frequency !== undefined) dbUpdates.frequency = frequencyToDbEnum[updates.frequency];
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate || null;
      if (updates.isPaused !== undefined) dbUpdates.is_paused = updates.isPaused;

      const { error } = await supabase
        .from('calendar_entries')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating entry:', error);
        setError(error.message);
        return;
      }

      setEntries(prev =>
        prev.map(entry =>
          entry.id === id
            ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
            : entry
        )
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to update entry');
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calendar_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting entry:', error);
        setError(error.message);
        return;
      }

      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to delete entry');
    }
  };

  const togglePause = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    
    await updateEntry(id, { isPaused: !entry.isPaused });
  };

  const importEntries = async (newEntries: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (!user) return;

    try {
      const dbEntries = newEntries.map(entry => ({
        user_id: user.id,
        date: entry.startDate,
        title: entry.title,
        frequency: frequencyToDbEnum[entry.frequency] as any,
        description: entry.description || null,
        amount: entry.amount || null,
        is_paused: entry.isPaused,
        end_date: entry.endDate || null,
      }));

      const { error } = await supabase
        .from('calendar_entries')
        .insert(dbEntries);

      if (error) {
        console.error('Error importing entries:', error);
        setError(error.message);
        return;
      }

      // Refresh entries after import
      await fetchEntries();
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to import entries');
    }
  };

  return {
    entries,
    isLoaded,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    togglePause,
    importEntries,
    refetch: fetchEntries,
  };
}
