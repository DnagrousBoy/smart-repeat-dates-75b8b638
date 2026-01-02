import { Calendar, BarChart3, List, Upload, Download, CalendarDays, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'calendar' | 'entries' | 'summary' | 'yearly';

interface AppHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onImport: () => void;
  onExport: () => void;
}

export function AppHeader({ viewMode, onViewModeChange, onImport, onExport }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed Out',
        description: 'You have been logged out successfully.',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-primary">
            📅 Smart Calendar
          </h1>
          <div className="flex gap-1 items-center">
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
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('calendar')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all',
              viewMode === 'calendar' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
          <button
            onClick={() => onViewModeChange('entries')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all',
              viewMode === 'entries' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Entries</span>
          </button>
          <button
            onClick={() => onViewModeChange('summary')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all',
              viewMode === 'summary' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Summary</span>
          </button>
          <button
            onClick={() => onViewModeChange('yearly')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all',
              viewMode === 'yearly' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Yearly</span>
          </button>
        </div>
      </div>
    </header>
  );
}
