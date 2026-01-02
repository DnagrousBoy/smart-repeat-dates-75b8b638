import { useState, useMemo, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, FileText, FileSpreadsheet, File, Printer, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Entry } from '@/types/entry';
import {
  generateMonthData,
  generateEquipmentData,
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToTXT,
  printPDF,
} from '@/lib/exportUtils';
import { useEntryStatuses } from '@/hooks/useEntryStatuses';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: Entry[];
  initialDate: Date;
}

type ExportType = 'register' | 'schedule';

export function ExportDialog({ open, onOpenChange, entries, initialDate }: ExportDialogProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showPreview, setShowPreview] = useState(false);
  const [exportType, setExportType] = useState<ExportType>('register');
  const { statuses, fetchStatuses, loading } = useEntryStatuses();

  const monthYear = format(selectedDate, 'MMMM yyyy');

  // Fetch statuses whenever the selected month changes or dialog opens
  useEffect(() => {
    if (open) {
      fetchStatuses(selectedDate);
    }
  }, [open, selectedDate, fetchStatuses]);

  const exportData = useMemo(() => {
    if (exportType === 'register') {
      return generateMonthData(entries, selectedDate.getFullYear(), selectedDate.getMonth(), statuses);
    } else {
      return generateEquipmentData(entries, selectedDate);
    }
  }, [entries, selectedDate, exportType, statuses]);

  const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

  const handleExportPDF = () => {
    exportToPDF(exportData, monthYear, exportType);
  };

  const handleExportCSV = () => {
    exportToCSV(exportData, monthYear, exportType);
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, monthYear, exportType);
  };

  const handleExportTXT = () => {
    exportToTXT(exportData, monthYear, exportType);
  };

  const handlePrint = () => {
    printPDF(exportData, monthYear, exportType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center">Export Data</DialogTitle>
        </DialogHeader>

        {/* Export Type Selection */}
        <div className="bg-muted/30 p-4 rounded-lg border">
          <Label className="text-sm font-medium mb-3 block">Select Export Format</Label>
          <RadioGroup 
            value={exportType} 
            onValueChange={(v) => setExportType(v as ExportType)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 border rounded-md p-3 bg-background hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="register" id="r1" />
              <Label htmlFor="r1" className="cursor-pointer flex-1">
                <div className="font-semibold">Date-wise Register</div>
                <div className="text-xs text-muted-foreground">Daily log (Portrait)</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-md p-3 bg-background hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="schedule" id="r2" />
              <Label htmlFor="r2" className="cursor-pointer flex-1">
                <div className="font-semibold">Equipment Schedule</div>
                <div className="text-xs text-muted-foreground">Planning Sheet (Landscape)</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between bg-muted rounded-lg p-3">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} disabled={loading}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{monthYear}</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={loading}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Preview Toggle */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowPreview(!showPreview)}
          disabled={loading}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>

        {/* Preview Table */}
        {showPreview && (
          <ScrollArea className="h-[250px] border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {exportType === 'register' ? (
                      <>
                        <th className="p-2 text-left border-b w-12">S.No.</th>
                        <th className="p-2 text-left border-b w-24">Date</th>
                        <th className="p-2 text-left border-b">M&P (Title)</th>
                        <th className="p-2 text-left border-b w-24">Frequency</th>
                        <th className="p-2 text-left border-b w-24">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="p-2 text-left border-b w-12">S.No.</th>
                        <th className="p-2 text-left border-b">M&P Name</th>
                        <th className="p-2 text-left border-b w-12">Qty</th>
                        <th className="p-2 text-left border-b w-16">Checks</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {exportData.map((row: any, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      {exportType === 'register' ? (
                        <>
                          <td className="p-2 text-muted-foreground">{row.sNo}</td>
                          <td className="p-2">{row.date}</td>
                          <td className="p-2 truncate max-w-[150px]" title={row.title}>
                            {row.title || <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="p-2 text-xs">{row.frequency}</td>
                          <td className="p-2 text-xs font-medium">
                            <span className={row.status === 'Completed' ? 'text-green-600' : 'text-red-500'}>
                              {row.status}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 text-muted-foreground">{row.sNo}</td>
                          <td className="p-2 font-medium">{row.equipment}</td>
                          <td className="p-2 text-xs">{row.qty}</td>
                          <td className="p-2 text-xs">{row.checks}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        )}

        {/* Export Buttons */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            {loading ? 'Loading data...' : 'Choose export format:'}
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleExportPDF}
              className="flex items-center gap-2"
              variant="default"
              disabled={loading}
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            
            <Button
              onClick={handleExportExcel}
              className="flex items-center gap-2"
              variant="outline"
              disabled={loading}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            
            <Button
              onClick={handleExportCSV}
              className="flex items-center gap-2"
              variant="outline"
              disabled={loading}
            >
              <File className="h-4 w-4" />
              CSV
            </Button>
            
            <Button
              onClick={handleExportTXT}
              className="flex items-center gap-2"
              variant="outline"
              disabled={loading}
            >
              <FileText className="h-4 w-4" />
              TXT
            </Button>
          </div>

          <Button
            onClick={handlePrint}
            className="w-full flex items-center gap-2"
            variant="secondary"
            disabled={loading}
          >
            <Printer className="h-4 w-4" />
            Print Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
