import { useState, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, FileText, FileSpreadsheet, File, Printer, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Entry } from '@/types/entry';
import {
  generateMonthData,
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToTXT,
  printPDF,
} from '@/lib/exportUtils';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: Entry[];
  initialDate: Date;
}

export function ExportDialog({ open, onOpenChange, entries, initialDate }: ExportDialogProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showPreview, setShowPreview] = useState(false);

  const monthYear = format(selectedDate, 'MMMM yyyy');
  
  const exportData = useMemo(() => {
    return generateMonthData(entries, selectedDate.getFullYear(), selectedDate.getMonth());
  }, [entries, selectedDate]);

  const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

  const handleExportPDF = () => {
    exportToPDF(exportData, monthYear);
  };

  const handleExportCSV = () => {
    exportToCSV(exportData, monthYear);
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, monthYear);
  };

  const handleExportTXT = () => {
    exportToTXT(exportData, monthYear);
  };

  const handlePrint = () => {
    printPDF(exportData, monthYear);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center">Export Monthly Report</DialogTitle>
        </DialogHeader>

        {/* Month Selector */}
        <div className="flex items-center justify-between bg-muted rounded-lg p-3">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-lg">{monthYear}</span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Preview Toggle */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>

        {/* Preview Table */}
        {showPreview && (
          <ScrollArea className="h-[250px] border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="p-2 text-left border-b w-12">S.No.</th>
                  <th className="p-2 text-left border-b w-24">Date</th>
                  <th className="p-2 text-left border-b">Title</th>
                  <th className="p-2 text-left border-b w-24">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {exportData.map((row) => (
                  <tr key={row.sNo} className="border-b last:border-b-0">
                    <td className="p-2 text-muted-foreground">{row.sNo}</td>
                    <td className="p-2">{row.date}</td>
                    <td className="p-2 truncate max-w-[150px]" title={row.title}>
                      {row.title || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-2 text-xs font-medium text-muted-foreground">
                      {row.frequency || <span className="text-muted-foreground/50">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}

        {/* Export Buttons */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">Choose export format:</p>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleExportPDF}
              className="flex items-center gap-2"
              variant="default"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            
            <Button
              onClick={handleExportExcel}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            
            <Button
              onClick={handleExportCSV}
              className="flex items-center gap-2"
              variant="outline"
            >
              <File className="h-4 w-4" />
              CSV
            </Button>
            
            <Button
              onClick={handleExportTXT}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileText className="h-4 w-4" />
              TXT
            </Button>
          </div>

          <Button
            onClick={handlePrint}
            className="w-full flex items-center gap-2"
            variant="secondary"
          >
            <Printer className="h-4 w-4" />
            Print Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
