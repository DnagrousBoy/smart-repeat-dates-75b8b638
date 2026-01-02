import { useMemo, useState } from 'react';
import { format, getDaysInMonth } from 'date-fns';
import { Download, FileText, FileSpreadsheet, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Entry } from '@/types/entry';
import { generateOccurrences } from '@/lib/recurrence';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface YearlyViewProps {
  entries: Entry[];
}

interface YearlyExportRow {
  sNo: number;
  date: string;
  title: string;
  frequency: string;
}

export function YearlyView({ entries }: YearlyViewProps) {
  const [year, setYear] = useState(2026);

  // Filter yearly entries
  const yearlyEntries = useMemo(() => {
    return entries.filter(e => e.frequency === 'yearly');
  }, [entries]);

  // Generate all yearly occurrences for the selected year
  const yearlyOccurrences = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const occurrences: { date: string; title: string; entry: Entry }[] = [];
    
    yearlyEntries.forEach(entry => {
      const entryOccurrences = generateOccurrences(entry, startDate, endDate);
      entryOccurrences.forEach(occ => {
        occurrences.push({
          date: occ.date,
          title: occ.entry.title,
          entry: occ.entry,
        });
      });
    });
    
    // Sort by date
    occurrences.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return occurrences;
  }, [yearlyEntries, year]);

  // Generate export data
  const generateExportData = (): YearlyExportRow[] => {
    return yearlyOccurrences.map((occ, idx) => ({
      sNo: idx + 1,
      date: format(new Date(occ.date), 'dd/MM/yyyy'),
      title: occ.title,
      frequency: 'YEARLY',
    }));
  };

  const exportToCSV = () => {
    const data = generateExportData();
    const header = 'S. No.,Date,Title,Frequency\n';
    const rows = data.map(row => `${row.sNo},"${row.date}","${row.title}","${row.frequency}"`).join('\n');
    const csvContent = header + rows;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `Yearly_Report_${year}.csv`);
  };

  const exportToExcel = () => {
    const data = generateExportData();
    const worksheetData = [
      [`YEARLY TASKS - ${year}`],
      [],
      ['S. No.', 'Date', 'Title', 'Frequency'],
      ...data.map(row => [row.sNo, row.date, row.title, row.frequency])
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 50 },
      { wch: 15 },
    ];
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Yearly Report');
    XLSX.writeFile(workbook, `Yearly_Report_${year}.xlsx`);
  };

  const exportToPDF = () => {
    const data = generateExportData();
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`YEARLY TASKS - ${year}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    autoTable(doc, {
      startY: 30,
      head: [['S. No.', 'Date', 'Title', 'Frequency']],
      body: data.map(row => [row.sNo, row.date, row.title, row.frequency]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'left', cellWidth: 'auto' },
        3: { halign: 'center', cellWidth: 25 },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      theme: 'grid',
    });
    
    doc.save(`Yearly_Report_${year}.pdf`);
  };

  const printPDF = () => {
    const data = generateExportData();
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`YEARLY TASKS - ${year}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    autoTable(doc, {
      startY: 30,
      head: [['S. No.', 'Date', 'Title', 'Frequency']],
      body: data.map(row => [row.sNo, row.date, row.title, row.frequency]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'left', cellWidth: 'auto' },
        3: { halign: 'center', cellWidth: 25 },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      theme: 'grid',
    });
    
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-4">
      {/* Year Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Yearly Tasks</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setYear(y => y - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-lg min-w-[60px] text-center">{year}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setYear(y => y + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={printPDF}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {yearlyEntries.length} yearly task{yearlyEntries.length !== 1 ? 's' : ''} • 
            {yearlyOccurrences.length} occurrence{yearlyOccurrences.length !== 1 ? 's' : ''} in {year}
          </p>
        </CardContent>
      </Card>

      {/* Yearly Tasks List */}
      {yearlyOccurrences.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No yearly tasks for {year}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add entries with "Yearly" frequency to see them here
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">S.No.</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyOccurrences.map((occ, idx) => (
                    <tr key={`${occ.date}-${occ.title}-${idx}`} className="border-b last:border-0">
                      <td className="py-2 px-2 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 px-2">{format(new Date(occ.date), 'dd/MM/yyyy')}</td>
                      <td className="py-2 px-2 font-medium">{occ.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
