import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Entry, Frequency, frequencyLabels } from '@/types/entry';
import { format } from 'date-fns';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (entries: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

interface ParsedRow {
  title: string;
  description?: string;
  amount?: number;
  startDate: string;
}

export function ImportDialog({ open, onOpenChange, onImport }: ImportDialogProps) {
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('File must contain header row and at least one data row');
          return;
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('name'));
        const descIdx = headers.findIndex(h => h.includes('desc'));
        const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('value'));
        const dateIdx = headers.findIndex(h => h.includes('date'));

        if (titleIdx === -1) {
          setError('CSV must have a "title" or "name" column');
          return;
        }

        const rows: ParsedRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          const title = values[titleIdx];
          if (!title) continue;

          rows.push({
            title,
            description: descIdx !== -1 ? values[descIdx] : undefined,
            amount: amountIdx !== -1 ? parseFloat(values[amountIdx]) || undefined : undefined,
            startDate: dateIdx !== -1 && values[dateIdx] 
              ? values[dateIdx] 
              : format(new Date(), 'yyyy-MM-dd'),
          });
        }

        if (rows.length === 0) {
          setError('No valid data rows found');
          return;
        }

        setParsedData(rows);
      } catch (err) {
        setError('Failed to parse file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const entries = parsedData.map(row => ({
      title: row.title,
      description: row.description,
      amount: row.amount,
      startDate: row.startDate,
      frequency,
      isPaused: false,
    }));

    onImport(entries);
    setParsedData([]);
    setError(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    setParsedData([]);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import Data
          </DialogTitle>
          <DialogDescription>
            Import entries from CSV/Excel file. Required column: title/name
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload CSV file
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData.length > 0 && (
            <>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">
                  {parsedData.length} entries found
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {parsedData.slice(0, 5).map((row, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground truncate">
                      {row.title} {row.amount ? `(₹${row.amount})` : ''}
                    </p>
                  ))}
                  {parsedData.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      ...and {parsedData.length - 5} more
                    </p>
                  )}
                </div>
              </div>

              {/* Frequency Selection */}
              <div className="space-y-2">
                <Label>Apply frequency to all imports</Label>
                <Select value={frequency} onValueChange={(val) => setFrequency(val as Frequency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleImport} className="w-full">
                Import {parsedData.length} Entries
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
