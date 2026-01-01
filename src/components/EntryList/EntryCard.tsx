import { format } from 'date-fns';
import { Pause, Play, Pencil, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Entry } from '@/types/entry';
import { FrequencyBadge } from '@/components/Calendar/FrequencyBadge';

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onTogglePause: (id: string) => void;
}

export function EntryCard({ entry, onEdit, onDelete, onTogglePause }: EntryCardProps) {
  return (
    <div className={`glass-card rounded-xl p-4 animate-slide-up ${entry.isPaused ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-semibold text-foreground truncate">{entry.title}</h4>
            <FrequencyBadge frequency={entry.frequency} />
            {entry.isPaused && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Paused
              </span>
            )}
          </div>
          
          {entry.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {entry.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              From {format(new Date(entry.startDate), 'MMM d, yyyy')}
            </span>
            {entry.endDate && (
              <span>To {format(new Date(entry.endDate), 'MMM d, yyyy')}</span>
            )}
            {entry.amount !== undefined && (
              <span className="font-medium text-foreground">
                ₹{entry.amount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onTogglePause(entry.id)}
            title={entry.isPaused ? 'Resume' : 'Pause'}
          >
            {entry.isPaused ? (
              <Play className="h-4 w-4 text-primary" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(entry)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
