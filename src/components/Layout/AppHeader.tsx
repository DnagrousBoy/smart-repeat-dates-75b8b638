import { Calendar, BarChart3, List, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ViewMode = 'calendar' | 'entries' | 'summary';

interface AppHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onImport: () => void;
  onExport: () => void;
}

export function AppHeader({ viewMode, onViewModeChange, onImport, onExport }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-primary">
            📅 Smart Calendar
          </h1>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onImport}
              className="text-xs"
            >
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="text-xs"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('calendar')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
              viewMode === 'calendar' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => onViewModeChange('entries')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
              viewMode === 'entries' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-4 w-4" />
            Entries
          </button>
          <button
            onClick={() => onViewModeChange('summary')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all',
              viewMode === 'summary' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Summary
          </button>
        </div>
      </div>
    </header>
  );
}
