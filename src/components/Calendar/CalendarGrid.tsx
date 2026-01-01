import { format, isSameDay, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns';
import { GeneratedOccurrence, Frequency } from '@/types/entry';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  occurrenceMap: Map<string, GeneratedOccurrence[]>;
  onDateSelect: (date: Date) => void;
}

const frequencyColors: Record<Frequency, string> = {
  daily: 'bg-frequency-daily',
  weekly: 'bg-frequency-weekly',
  fortnightly: 'bg-frequency-fortnightly',
  monthly: 'bg-frequency-monthly',
  quarterly: 'bg-frequency-quarterly',
  halfyearly: 'bg-frequency-halfyearly',
};

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

          // Get unique frequencies for dots
          const uniqueFrequencies = [...new Set(dayOccurrences.map(o => o.entry.frequency))];

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(day)}
              className={cn(
                'calendar-day bg-card',
                isToday(day) && 'today',
                isSelected && 'selected',
                hasEntries && 'has-entries',
                !isCurrentMonth && 'opacity-40'
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  isToday(day) && 'text-primary font-semibold',
                  !isCurrentMonth && 'text-muted-foreground'
                )}
              >
                {format(day, 'd')}
              </span>
              
              {/* Entry indicators */}
              {hasEntries && (
                <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                  {uniqueFrequencies.slice(0, 3).map((freq, idx) => (
                    <div
                      key={`${dateStr}-${freq}-${idx}`}
                      className={cn('entry-dot', frequencyColors[freq])}
                    />
                  ))}
                  {uniqueFrequencies.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">
                      +{uniqueFrequencies.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Entry count badge */}
              {dayOccurrences.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
                  {dayOccurrences.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
