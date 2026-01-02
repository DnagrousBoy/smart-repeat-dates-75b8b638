import { format, getDaysInMonth } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Entry } from '@/types/entry';
import { getMonthOccurrences } from './recurrence';

interface ExportRow {
  sNo: number;
  date: string;
  title: string;
  frequency: string;
}

export function generateMonthData(entries: Entry[], year: number, month: number): ExportRow[] {
  const occurrenceMap = getMonthOccurrences(entries, year, month);
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const rows: ExportRow[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = format(date, 'yyyy-MM-dd');
    const occurrences = occurrenceMap.get(dateStr) || [];
    
    // Get all titles for this date, comma separated
    const titles = occurrences.map(o => o.entry.title).join(', ');
    
    // Get all frequencies for this date, comma separated
    const frequencies = occurrences.map(o => o.entry.frequency.toUpperCase()).join(', ');
    
    rows.push({
      sNo: day,
      date: format(date, 'dd/MM/yyyy'),
      title: titles,
      frequency: frequencies,
    });
  }

  return rows;
}

export function exportToCSV(data: ExportRow[], monthYear: string): void {
  const header = 'S. No.,Date,Title / Description,Frequency\n';
  const rows = data.map(row => `${row.sNo},"${row.date}","${row.title}","${row.frequency}"`).join('\n');
  const csvContent = header + rows;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `Monthly_Report_${monthYear.replace(' ', '_')}.csv`);
}

export function exportToTXT(data: ExportRow[], monthYear: string): void {
  const header = `MONTH - ${monthYear}\n\n`;
  const separator = '='.repeat(80) + '\n';
  const columnHeader = 'S. No.  |  Date        |  Title / Description                           |  Frequency\n';
  const divider = '-'.repeat(80) + '\n';
  
  let content = header + separator + columnHeader + divider;
  
  data.forEach(row => {
    const sNo = row.sNo.toString().padEnd(6);
    const date = row.date.padEnd(12);
    const title = row.title.padEnd(45);
    content += `${sNo}  |  ${date}  |  ${title}  |  ${row.frequency}\n`;
  });
  
  content += separator;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, `Monthly_Report_${monthYear.replace(' ', '_')}.txt`);
}

export function exportToExcel(data: ExportRow[], monthYear: string): void {
  const worksheetData = [
    [`MONTH - ${monthYear}`],
    [],
    ['S. No.', 'Date', 'Title / Description', 'Frequency'],
    ...data.map(row => [row.sNo, row.date, row.title, row.frequency])
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // S. No.
    { wch: 15 }, // Date
    { wch: 50 }, // Title
    { wch: 20 }, // Frequency
  ];
  
  // Merge header cell
  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Report');
  
  XLSX.writeFile(workbook, `Monthly_Report_${monthYear.replace(' ', '_')}.xlsx`);
}

export function exportToPDF(data: ExportRow[], monthYear: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`MONTH - ${monthYear}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // Table
  autoTable(doc, {
    startY: 30,
    head: [['S. No.', 'Date', 'Title / Description', 'Frequency']],
    body: data.map(row => [row.sNo, row.date, row.title, row.frequency]),
    styles: {
      fontSize: 8, // Shrink font to fit on one page
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      overflow: 'linebreak',
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
      3: { halign: 'center', cellWidth: 35 },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    theme: 'grid',
  });
  
  doc.save(`Monthly_Report_${monthYear.replace(' ', '_')}.pdf`);
}

export function printPDF(data: ExportRow[], monthYear: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`MONTH - ${monthYear}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // Table
  autoTable(doc, {
    startY: 30,
    head: [['S. No.', 'Date', 'Title / Description', 'Frequency']],
    body: data.map(row => [row.sNo, row.date, row.title, row.frequency]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      overflow: 'linebreak',
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
      3: { halign: 'center', cellWidth: 35 },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    theme: 'grid',
  });
  
  // Open in new window for printing
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}

function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
