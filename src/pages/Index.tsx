import { useState, useMemo, useEffect } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

import { AppHeader } from '@/components/Layout/AppHeader';
import { CalendarHeader } from '@/components/Calendar/CalendarHeader';
import { CalendarGrid } from '@/components/Calendar/CalendarGrid';
import { EntryForm } from '@/components/EntryForm/EntryForm';
import { EntryCard } from '@/components/EntryList/EntryCard';
import { DateDetailSheet } from '@/components/DateDetail/DateDetailSheet';
import { SummaryView } from '@/components/Summary/SummaryView';
import { ImportDialog } from '@/components/Import/ImportDialog';
import { ExportDialog } from '@/components/Export/ExportDialog';
import { YearlyView } from '@/components/Yearly/YearlyView';

import { useAuth } from '@/hooks/useAuth';
import { useSupabaseEntries } from '@/hooks/useSupabaseEntries';
import { getMonthOccurrences, getDateOccurrences } from '@/lib/recurrence';
import { Entry } from '@/types/entry';

type ViewMode = 'calendar' | 'entries' | 'summary' | 'yearly';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Default to January 2026
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showDateDetail, setShowDateDetail] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const { entries, isLoaded, addEntry, updateEntry, deleteEntry, togglePause, importEntries } = useSupabaseEntries();
  const { toast } = useToast();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Generate occurrences for current month view
  const occurrenceMap = useMemo(() => {
    return getMonthOccurrences(entries, currentDate.getFullYear(), currentDate.getMonth());
  }, [entries, currentDate]);

  // Get occurrences for selected date
  const selectedDateOccurrences = useMemo(() => {
    if (!selectedDate) return [];
    return getDateOccurrences(entries, selectedDate);
  }, [entries, selectedDate]);

  const handlePreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDateDetail(true);
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowEntryForm(true);
    setShowDateDetail(false);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
  };

  const handleFormSubmit = async (data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, data);
      toast({
        title: 'Entry Updated',
        description: 'Your recurring entry has been updated.',
      });
    } else {
      await addEntry(data);
      toast({
        title: 'Entry Created',
        description: 'Your recurring entry will automatically appear on the calendar.',
      });
    }
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteEntry(id);
    toast({
      title: 'Entry Deleted',
      description: 'The entry and all its occurrences have been removed.',
      variant: 'destructive',
    });
  };

  const handleImport = async (newEntries: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    await importEntries(newEntries);
    toast({
      title: 'Import Successful',
      description: `${newEntries.length} entries have been imported.`,
    });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Show loading while checking auth
  if (authLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader 
        viewMode={viewMode} 
        onViewModeChange={handleViewModeChange}
        onImport={() => setShowImport(true)}
        onExport={() => setShowExport(true)}
      />

      <main className="container py-4">
        {viewMode === 'calendar' && (
          <div className="space-y-4 animate-fade-in">
            <CalendarHeader
              currentDate={currentDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              occurrenceMap={occurrenceMap}
              onDateSelect={handleDateSelect}
            />
          </div>
        )}

        {viewMode === 'entries' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold">All Entries</h2>
              <span className="text-sm text-muted-foreground">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No entries yet</p>
                <Button onClick={handleAddEntry}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    onTogglePause={togglePause}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'summary' && (
          <div className="animate-fade-in">
            <SummaryView entries={entries} currentDate={currentDate} />
          </div>
        )}

        {viewMode === 'yearly' && (
          <div className="animate-fade-in">
            <YearlyView entries={entries} />
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={handleAddEntry}
        className="floating-button"
        aria-label="Add new entry"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Entry Form Sheet */}
      <Sheet open={showEntryForm} onOpenChange={setShowEntryForm}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
          <EntryForm
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowEntryForm(false);
              setEditingEntry(null);
            }}
            initialDate={selectedDate || undefined}
            editEntry={editingEntry || undefined}
          />
        </SheetContent>
      </Sheet>

      {/* Date Detail Sheet */}
      <DateDetailSheet
        open={showDateDetail}
        onOpenChange={setShowDateDetail}
        date={selectedDate}
        occurrences={selectedDateOccurrences}
        onAddEntry={handleAddEntry}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onImport={handleImport}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        entries={entries}
        initialDate={currentDate}
      />
    </div>
  );
};

export default Index;
