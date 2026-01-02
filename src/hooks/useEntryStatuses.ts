import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export type EntryStatusValue = 'COMPLETED' | 'INCOMPLETE';

export function useEntryStatuses() {
  const [statuses, setStatuses] = useState<Record<string, EntryStatusValue>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStatuses = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('entry_statuses')
        .select('entry_id, date, status')
        .gte('date', start)
        .lte('date', end);

      if (error) {
        console.error('Error fetching statuses:', error);
        toast({
          title: "Error",
          description: "Failed to load task statuses.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        const newStatuses: Record<string, EntryStatusValue> = {};
        data.forEach(s => {
          newStatuses[`${s.entry_id}-${s.date}`] = s.status as EntryStatusValue;
        });
        setStatuses(newStatuses);
      }
    } catch (err) {
      console.error("Unexpected error fetching statuses:", err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateStatus = async (entryId: string, date: string, status: EntryStatusValue) => {
    // Optimistic update
    const key = `${entryId}-${date}`;
    setStatuses(prev => ({ ...prev, [key]: status }));

    try {
      const { error } = await supabase
        .from('entry_statuses')
        .upsert({
          entry_id: entryId,
          date: date,
          status: status,
          updated_at: new Date().toISOString()
        }, { onConflict: 'entry_id,date' });
        
      if (error) {
        console.error("Failed to update status", error);
        toast({
          title: "Save Failed",
          description: "Could not save status to database.",
          variant: "destructive"
        });
        // Revert on error
        setStatuses(prev => {
          const newState = { ...prev };
          // We don't easily know the previous value, so we might need to refetch or accept the UI glitch
          // For now, we keep the optimistic value but warn the user
          return newState;
        });
      }
    } catch (err) {
      console.error("Unexpected error updating status:", err);
    }
  };

  return { statuses, fetchStatuses, updateStatus, loading };
}
