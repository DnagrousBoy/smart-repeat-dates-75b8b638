import { format } from 'date-fns';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GeneratedOccurrence } from '@/types/entry';
import { FrequencyBadge } from '@/components/Calendar/FrequencyBadge';

interface DateDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  occurrences: GeneratedOccurrence[];
  onAddEntry: () => void;
}

export function DateDetailSheet({
  open,
  onOpenChange,
  date,
  occurrences,
  onAddEntry,
}: DateDetailSheetProps) {
  if (!date) return null;

  const totalAmount = occurrences.reduce((sum, occ) => sum + (occ.entry.amount || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {format(date, 'EEEE, MMMM d, yyyy')}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="py-4 overflow-y-auto max-h-[calc(70vh-120px)]">
          {occurrences.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No entries for this date</p>
              <Button onClick={onAddEntry}>
                Add Entry
              </Button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {occurrences.length} {occurrences.length === 1 ? 'entry' : 'entries'}
                  </span>
                  {totalAmount > 0 && (
                    <span className="font-semibold text-primary">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Entries list */}
              <div className="space-y-3">
                {occurrences.map((occ, idx) => (
                  <div
                    key={`${occ.entryId}-${idx}`}
                    className="glass-card rounded-lg p-3 animate-slide-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium">{occ.entry.title}</h4>
                      <FrequencyBadge frequency={occ.entry.frequency} />
                    </div>
                    {occ.entry.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {occ.entry.description}
                      </p>
                    )}
                    {occ.entry.amount !== undefined && (
                      <p className="text-sm font-medium">
                        ₹{occ.entry.amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button onClick={onAddEntry} className="w-full">
                  Add Another Entry
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
