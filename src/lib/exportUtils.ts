import { format, getDaysInMonth, parseISO, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Entry } from '@/types/entry';
import { getMonthOccurrences, generateOccurrences } from './recurrence';
import { EntryStatusValue } from '@/hooks/useEntryStatuses';

// Option A: Register Format
export interface RegisterRow {
  sNo: number;
  date: string;
  title: string;
  frequency: string;
  status: string;
}

// Option B: Schedule Format
export interface ScheduleRow {
  sNo: number;
  equipment: string;
  qty: number;
  checks: string;
  
  // Weekly
  wLast: string;
  w1: string;
  w2: string;
  w3: string;
  w4: string;
  w5: string;
  
  // Fortnightly
  fLast: string;
  f1: string;
  f2: string;
  f3: string;
  
  // Monthly
  mLast: string;
  mNext: string;
  
  // 3 Monthly
  qLast: string;
  qNext: string;
  
  // Half Yearly
  hyLast: string;
  hyNext: string;
  
  // Yearly
  yLast: string;
  yNext: string;
}

export function generateMonthData(
  entries: Entry[], 
  year: number, 
  month: number,
  statuses: Record<string, EntryStatusValue> = {}
): RegisterRow[] {
  const occurrenceMap = getMonthOccurrences(entries, year, month);
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const rows: RegisterRow[] = [];

  let sNo = 1;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = format(date, 'yyyy-MM-dd');
    const occurrences = occurrenceMap.get(dateStr) || [];
    
    // One row per date, even if empty
    const titles = occurrences.map(o => o.entry.title).join(', ');
    const freqs = occurrences.map(o => mapFrequencyCode(o.entry.frequency)).join(', ');
    
    // Status Logic - STRICT "Completed" or "In-Completed"
    const statusTexts = occurrences.map(o => {
      const key = `${o.entry.id}-${dateStr}`;
      const status = statuses[key] || 'INCOMPLETE';
      return status === 'COMPLETED' ? 'Completed' : 'In-Completed';
    }).join(', ');

    rows.push({
      sNo: sNo++,
      date: format(date, 'dd/MM/yyyy'),
      title: titles,
      frequency: freqs,
      // If no tasks on this date, status is empty, otherwise use the calculated string
      status: titles ? statusTexts : ''
    });
  }

  return rows;
}

export function generateEquipmentData(entries: Entry[], selectedDate: Date): ScheduleRow[] {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  
  // Look back period for "Last" date (e.g., 1 year back)
  const lookBackStart = subMonths(monthStart, 12); 

  return entries.map((entry, index) => {
    // Generate occurrences for this month
    const monthOccurrences = generateOccurrences(entry, monthStart, monthEnd);
    const monthDates = monthOccurrences.map(o => format(parseISO(o.date), 'dd'));
    
    // Generate occurrences before this month (for "Last")
    const prevOccurrences = generateOccurrences(entry, lookBackStart, subDays(monthStart, 1));
    const lastDateObj = prevOccurrences.length > 0 ? prevOccurrences[prevOccurrences.length - 1] : null;
    const lastDate = lastDateObj ? format(parseISO(lastDateObj.date), 'dd/MM') : '';

    const freqCode = mapFrequencyCode(entry.frequency);

    const row: ScheduleRow = {
      sNo: index + 1,
      equipment: entry.title,
      qty: 1,
      checks: freqCode,
      wLast: '', w1: '', w2: '', w3: '', w4: '', w5: '',
      fLast: '', f1: '', f2: '', f3: '',
      mLast: '', mNext: '',
      qLast: '', qNext: '',
      hyLast: '', hyNext: '',
      yLast: '', yNext: ''
    };

    // Populate columns based on frequency
    if (entry.frequency === 'weekly') {
      row.wLast = lastDate;
      row.w1 = monthDates[0] || '';
      row.w2 = monthDates[1] || '';
      row.w3 = monthDates[2] || '';
      row.w4 = monthDates[3] || '';
      row.w5 = monthDates[4] || '';
    } else if (entry.frequency === 'fortnightly') {
      row.fLast = lastDate;
      row.f1 = monthDates[0] || '';
      row.f2 = monthDates[1] || '';
      row.f3 = monthDates[2] || '';
    } else if (entry.frequency === 'monthly') {
      row.mLast = lastDate;
      row.mNext = monthDates[0] || '';
    } else if (entry.frequency === 'quarterly') {
      row.qLast = lastDate;
      row.qNext = monthDates[0] || '';
    } else if (entry.frequency === 'halfyearly') {
      row.hyLast = lastDate;
      row.hyNext = monthDates[0] || '';
    } else if (entry.frequency === 'yearly') {
      row.yLast = lastDate;
      row.yNext = monthDates[0] || '';
    }

    return row;
  });
}

function mapFrequencyCode(freq: string): string {
  const map: Record<string, string> = {
    'daily': 'D',
    'weekly': 'W',
    'fortnightly': 'F',
    'monthly': 'M',
    'quarterly': '3M',
    'halfyearly': 'HY',
    'yearly': 'Y'
  };
  return map[freq] || freq;
}

export function exportToCSV(data: any[], title: string, type: 'register' | 'schedule'): void {
  let header = '';
  let rows = '';

  if (type === 'register') {
    header = 'S. No.,Date,M&P,Frequency,Status\n';
    rows = (data as RegisterRow[]).map(row => 
      `${row.sNo},"${row.date}","${row.title}","${row.frequency}","${row.status}"`
    ).join('\n');
  } else {
    header = 'S.No.,M&P Name,Qty,Checks,W-Last,W-1,W-2,W-3,W-4,W-5,F-Last,F-1,F-2,F-3,M-Last,M-Next,3M-Last,3M-Next,HY-Last,HY-Next,Y-Last,Y-Next\n';
    rows = (data as ScheduleRow[]).map(row => 
      `${row.sNo},"${row.equipment}",${row.qty},"${row.checks}","${row.wLast}","${row.w1}","${row.w2}","${row.w3}","${row.w4}","${row.w5}","${row.fLast}","${row.f1}","${row.f2}","${row.f3}","${row.mLast}","${row.mNext}","${row.qLast}","${row.qNext}","${row.hyLast}","${row.hyNext}","${row.yLast}","${row.yNext}"`
    ).join('\n');
  }

  const csvContent = header + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${title.replace(' ', '_')}_${type}.csv`);
}

export function exportToTXT(data: any[], title: string, type: 'register' | 'schedule'): void {
  let content = `REPORT: ${title}\nTYPE: ${type.toUpperCase()}\n\n`;
  const separator = '='.repeat(120) + '\n';
  
  if (type === 'register') {
    content += 'S. No. | Date       | M&P                                       | Frequency      | Status\n';
    content += separator;
    (data as RegisterRow[]).forEach(row => {
      content += `${row.sNo.toString().padEnd(6)} | ${row.date.padEnd(10)} | ${row.title.padEnd(41)} | ${row.frequency.padEnd(14)} | ${row.status}\n`;
    });
  } else {
    content += 'Equipment Schedule (Simplified View)\n';
    content += separator;
    (data as ScheduleRow[]).forEach(row => {
      content += `${row.sNo}. ${row.equipment} (${row.checks})\n`;
    });
  }
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, `${title.replace(' ', '_')}_${type}.txt`);
}

export function exportToExcel(data: any[], title: string, type: 'register' | 'schedule'): void {
  let worksheetData: any[][] = [];
  let cols: any[] = [];
  let merges: any[] = [];

  if (type === 'register') {
    worksheetData = [
      [`MONTH – ${title}`],
      [],
      ['S. No.', 'Date', 'M&P', 'Frequency', 'Status'],
      ...(data as RegisterRow[]).map(row => [row.sNo, row.date, row.title, row.frequency, row.status])
    ];
    cols = [{ wch: 8 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }];
    merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
  } else {
    // Complex header for Schedule
    worksheetData = [
      [`MONTH – ${title}`],
      [],
      [
        'S. No.', 'M&P Name', 'Qty', 'Checks',
        'Weekly', '', '', '', '', '',
        'Fortnightly', '', '', '',
        'Monthly', '',
        '3 Monthly', '',
        'Half Yearly', '',
        'Yearly', ''
      ],
      [
        '', '', '', '',
        'Last', '1st', '2nd', '3rd', '4th', '5th',
        'Last', '1st', '2nd', '3rd',
        'Last', 'Next',
        'Last', 'Next',
        'Last', 'Next',
        'Last', 'Next'
      ],
      ...(data as ScheduleRow[]).map(row => [
        row.sNo, row.equipment, row.qty, row.checks,
        row.wLast, row.w1, row.w2, row.w3, row.w4, row.w5,
        row.fLast, row.f1, row.f2, row.f3,
        row.mLast, row.mNext,
        row.qLast, row.qNext,
        row.hyLast, row.hyNext,
        row.yLast, row.yNext
      ])
    ];
    
    cols = [
      { wch: 6 }, { wch: 30 }, { wch: 6 }, { wch: 8 },
      { wch: 6 }, { wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 4 },
      { wch: 6 }, { wch: 4 }, { wch: 4 }, { wch: 4 },
      { wch: 6 }, { wch: 6 },
      { wch: 6 }, { wch: 6 },
      { wch: 6 }, { wch: 6 },
      { wch: 6 }, { wch: 6 }
    ];

    merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 21 } }, // Title
      { s: { r: 2, c: 4 }, e: { r: 2, c: 9 } },  // Weekly
      { s: { r: 2, c: 10 }, e: { r: 2, c: 13 } }, // Fortnightly
      { s: { r: 2, c: 14 }, e: { r: 2, c: 15 } }, // Monthly
      { s: { r: 2, c: 16 }, e: { r: 2, c: 17 } }, // 3M
      { s: { r: 2, c: 18 }, e: { r: 2, c: 19 } }, // HY
      { s: { r: 2, c: 20 }, e: { r: 2, c: 21 } }, // Y
      // Merge main headers vertically
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
      { s: { r: 2, c: 2 }, e: { r: 3, c: 2 } },
      { s: { r: 2, c: 3 }, e: { r: 3, c: 3 } },
    ];
  }
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet['!cols'] = cols;
  worksheet['!merges'] = merges;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  XLSX.writeFile(workbook, `${title.replace(' ', '_')}_${type}.xlsx`);
}

// Helper to create the PDF document with content
function createPDF(data: any[], title: string, type: 'register' | 'schedule') {
  const doc = new jsPDF({
    orientation: type === 'register' ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });
  
  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`MONTH – ${title}`, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  
  if (type === 'register') {
    // ONE PAGE ENFORCEMENT for Register
    autoTable(doc, {
      startY: 20,
      head: [['S. No.', 'Date', 'M&P', 'Frequency', 'Status']],
      body: (data as RegisterRow[]).map(row => [row.sNo, row.date, row.title, row.frequency, row.status]),
      theme: 'grid',
      styles: { 
        fontSize: 8, // Small font to fit
        cellPadding: 1.5,
        overflow: 'linebreak',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 'auto' }, // Title takes remaining space
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
      },
      // CRITICAL: Force all rows on one page if possible
      pageBreak: 'avoid', 
      rowPageBreak: 'avoid',
      margin: { top: 20, bottom: 10, left: 10, right: 10 },
    });
  } else {
    // Schedule Format - Landscape, Complex Grid
    autoTable(doc, {
      startY: 20,
      head: [
        [
          { content: 'S. No.', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'M&P Name', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'Qty', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'Checks', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'Weekly', colSpan: 6, styles: { halign: 'center' } },
          { content: 'Fortnightly', colSpan: 4, styles: { halign: 'center' } },
          { content: 'Monthly', colSpan: 2, styles: { halign: 'center' } },
          { content: '3 Monthly', colSpan: 2, styles: { halign: 'center' } },
          { content: 'Half Yearly', colSpan: 2, styles: { halign: 'center' } },
          { content: 'Yearly', colSpan: 2, styles: { halign: 'center' } },
        ],
        [
          'Last', '1st', '2nd', '3rd', '4th', '5th',
          'Last', '1st', '2nd', '3rd',
          'Last', 'Next',
          'Last', 'Next',
          'Last', 'Next',
          'Last', 'Next'
        ]
      ],
      body: (data as ScheduleRow[]).map(row => [
        row.sNo, row.equipment, row.qty, row.checks,
        row.wLast, row.w1, row.w2, row.w3, row.w4, row.w5,
        row.fLast, row.f1, row.f2, row.f3,
        row.mLast, row.mNext,
        row.qLast, row.qNext,
        row.hyLast, row.hyNext,
        row.yLast, row.yNext
      ]),
      theme: 'grid',
      styles: { 
        fontSize: 6, // Very small font for wide table
        cellPadding: 1,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        halign: 'center', // Center align most data
      },
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        lineWidth: 0.1,
      },
      columnStyles: {
        1: { halign: 'left', cellWidth: 35 }, // Equipment name left aligned
      },
      pageBreak: 'avoid',
      margin: { top: 20, bottom: 10, left: 5, right: 5 },
    });
  }
  
  // Add Page Number 1/1
  const pageCount = doc.internal.pages.length - 1;
  doc.setFontSize(8);
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 5);
  }
  
  return doc;
}

export function exportToPDF(data: any[], title: string, type: 'register' | 'schedule'): void {
  const doc = createPDF(data, title, type);
  doc.save(`${title.replace(' ', '_')}_${type}.pdf`);
}

export function printPDF(data: any[], title: string, type: 'register' | 'schedule'): void {
  const doc = createPDF(data, title, type);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
