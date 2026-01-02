import { useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeneratedOccurrence } from '@/types/entry';
import { FrequencyBadge } from '@/components/Calendar/FrequencyBadge';
import { useEntryStatuses } from '@/hooks/useEntryStatuses';

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
  const { statuses, fetchStatuses, updateStatus } = useEntryStatuses();

  useEffect(() => {
    if (open && date) {
      fetchStatuses(date);
    }
  }, [open, date, fetchStatuses]);

  if (!date) return null;

  const totalAmount = occurrences.reduce((sum, occ) => sum + (occ.entry.amount || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {format(date, 'EEEE, MMMM d, yyyy')}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="py-4 overflow-y-auto max-h-[calc(60vh-120px)]">
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
              <div className="space-y-4">
                {occurrences.map((occ, idx) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const statusKey = `${occ.entry.id}-${dateStr}`;
                  const currentStatus = statuses[statusKey] || 'INCOMPLETE';

                  return (
                    <div
                      key={`${occ.entryId}-${idx}`}
                      className="glass-card rounded-lg p-4 animate-slide-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium">{occ.entry.title}</h4>
                        <FrequencyBadge frequency={occ.entry.frequency} />
                      </div>
                      
                      {occ.entry.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {occ.entry.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        {occ.entry.amount !== undefined ? (
                          <p className="text-sm font-medium">
                            ₹{occ.entry.amount.toLocaleString()}
                          </p>
                        ) : <span></span>}

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Status:</span>
                          <Select
                            value={currentStatus}
                            onValueChange={(val: 'COMPLETED' | 'INCOMPLETE') => 
                              updateStatus(occ.entry.id, dateStr, val)
                            }
                          >
                            <SelectTrigger className={`h-8 w-[140px] text-xs ${
                              currentStatus === 'COMPLETED' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INCOMPLETE">In-Completed</SelectItem>
                              <SelectItem value="COMPLETED">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 pb-4">
                <Button onClick={onAddEntry} className="w-full" variant="outline">
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
