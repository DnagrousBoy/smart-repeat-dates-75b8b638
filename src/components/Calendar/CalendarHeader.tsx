import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousMonth}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="h-9 w-9"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <h2 className="text-lg sm:text-xl font-semibold ml-2">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        className="text-sm"
      >
        Today
      </Button>
    </div>
  );
}
