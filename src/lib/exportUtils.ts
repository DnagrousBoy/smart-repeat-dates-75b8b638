import { format, getDaysInMonth, startOfMonth } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Entry } from '@/types/entry';
import { getMonthOccurrences } from './recurrence';

interface ExportRow {
  sNo: number;
  date: string;
  title: string;
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
    
    rows.push({
      sNo: day,
      date: format(date, 'dd/MM/yyyy'),
      title: titles,
    });
  }

  return rows;
}

export function exportToCSV(data: ExportRow[], monthYear: string): void {
  const header = 'S. No.,Date,Title / Description\n';
  const rows = data.map(row => `${row.sNo},"${row.date}","${row.title}"`).join('\n');
  const csvContent = header + rows;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `Monthly_Report_${monthYear.replace(' ', '_')}.csv`);
}

export function exportToTXT(data: ExportRow[], monthYear: string): void {
  const header = `MONTH - ${monthYear}\n\n`;
  const separator = '='.repeat(60) + '\n';
  const columnHeader = 'S. No.  |  Date        |  Title / Description\n';
  const divider = '-'.repeat(60) + '\n';
  
  let content = header + separator + columnHeader + divider;
  
  data.forEach(row => {
    const sNo = row.sNo.toString().padEnd(6);
    const date = row.date.padEnd(12);
    content += `${sNo}  |  ${date}  |  ${row.title}\n`;
  });
  
  content += separator;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, `Monthly_Report_${monthYear.replace(' ', '_')}.txt`);
}

export function exportToExcel(data: ExportRow[], monthYear: string): void {
  const worksheetData = [
    [`MONTH - ${monthYear}`],
    [],
    ['S. No.', 'Date', 'Title / Description'],
    ...data.map(row => [row.sNo, row.date, row.title])
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // S. No.
    { wch: 15 }, // Date
    { wch: 50 }, // Title
  ];
  
  // Merge header cell
  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
  
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
    head: [['S. No.', 'Date', 'Title / Description']],
    body: data.map(row => [row.sNo, row.date, row.title]),
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
      1: { halign: 'center', cellWidth: 30 },
      2: { halign: 'left', cellWidth: 'auto' },
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
    head: [['S. No.', 'Date', 'Title / Description']],
    body: data.map(row => [row.sNo, row.date, row.title]),
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
      1: { halign: 'center', cellWidth: 30 },
      2: { halign: 'left', cellWidth: 'auto' },
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
