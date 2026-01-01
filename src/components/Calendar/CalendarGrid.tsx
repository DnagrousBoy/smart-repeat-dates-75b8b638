import { format, isSameDay, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns';
import { GeneratedOccurrence } from '@/types/entry';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  occurrenceMap: Map<string, GeneratedOccurrence[]>;
  onDateSelect: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({
  currentDate,
  selectedDate,
  occurrenceMap,
  onDateSelect,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/50">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-px bg-border/30">
        {calendarDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayOccurrences = occurrenceMap.get(dateStr) || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasEntries = dayOccurrences.length > 0;

          // Get entry titles for display (max 2)
          const displayedEntries = dayOccurrences.slice(0, 2);
          const remainingCount = dayOccurrences.length - 2;

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(day)}
              className={cn(
                'calendar-day bg-card min-h-[80px] flex flex-col items-start p-1',
                isToday(day) && 'today',
                isSelected && 'selected',
                hasEntries && 'has-entries',
                !isCurrentMonth && 'opacity-40'
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium mb-1',
                  isToday(day) && 'text-primary font-semibold',
                  !isCurrentMonth && 'text-muted-foreground'
                )}
              >
                {format(day, 'd')}
              </span>
              
              {/* Entry titles */}
              {hasEntries && (
                <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                  {displayedEntries.map((occurrence, idx) => (
                    <div
                      key={`${dateStr}-${occurrence.entry.id}-${idx}`}
                      className="text-[9px] leading-tight px-1 py-0.5 bg-primary/10 text-primary rounded truncate w-full text-left"
                      title={occurrence.entry.title}
                    >
                      {occurrence.entry.title}
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <span className="text-[9px] text-muted-foreground font-medium px-1">
                      +{remainingCount} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}