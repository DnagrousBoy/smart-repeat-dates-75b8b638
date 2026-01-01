import { 
  addDays, 
  addMonths, 
  isBefore, 
  isAfter, 
  isSameDay, 
  startOfDay,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns';
import { Entry, Frequency, GeneratedOccurrence } from '@/types/entry';

// Generate occurrences for an entry within a date range
export function generateOccurrences(
  entry: Entry,
  rangeStart: Date,
  rangeEnd: Date
): GeneratedOccurrence[] {
  if (entry.isPaused) return [];

  const occurrences: GeneratedOccurrence[] = [];
  const startDate = parseISO(entry.startDate);
  const endDate = entry.endDate ? parseISO(entry.endDate) : null;
  
  // Don't generate before start date
  if (isAfter(rangeStart, startDate)) {
    // Find the first occurrence within or before the range
    let current = startDate;
    while (isBefore(current, rangeStart)) {
      current = getNextOccurrence(current, entry.frequency);
    }
    
    // Generate occurrences within range
    while (!isAfter(current, rangeEnd)) {
      if (endDate && isAfter(current, endDate)) break;
      
      occurrences.push({
        entryId: entry.id,
        date: format(current, 'yyyy-MM-dd'),
        entry,
      });
      
      current = getNextOccurrence(current, entry.frequency);
    }
  } else {
    // Start from the entry's start date
    let current = startDate;
    
    while (!isAfter(current, rangeEnd)) {
      if (endDate && isAfter(current, endDate)) break;
      
      if (!isBefore(current, rangeStart)) {
        occurrences.push({
          entryId: entry.id,
          date: format(current, 'yyyy-MM-dd'),
          entry,
        });
      }
      
      current = getNextOccurrence(current, entry.frequency);
    }
  }

  return occurrences;
}

// Get the next occurrence date based on frequency
function getNextOccurrence(date: Date, frequency: Frequency): Date {
  switch (frequency) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addDays(date, 7);
    case 'fortnightly':
      return addDays(date, 15);
    case 'monthly':
      return addMonths(date, 1);
    case 'quarterly':
      return addMonths(date, 3);
    case 'halfyearly':
      return addMonths(date, 6);
    default:
      return addDays(date, 1);
  }
}

// Get all occurrences for a specific month
export function getMonthOccurrences(
  entries: Entry[],
  year: number,
  month: number
): Map<string, GeneratedOccurrence[]> {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  
  const occurrenceMap = new Map<string, GeneratedOccurrence[]>();
  
  // Initialize all days of the month
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  allDays.forEach(day => {
    occurrenceMap.set(format(day, 'yyyy-MM-dd'), []);
  });
  
  // Generate occurrences for each entry
  entries.forEach(entry => {
    const occurrences = generateOccurrences(entry, monthStart, monthEnd);
    occurrences.forEach(occ => {
      const existing = occurrenceMap.get(occ.date) || [];
      existing.push(occ);
      occurrenceMap.set(occ.date, existing);
    });
  });
  
  return occurrenceMap;
}

// Get occurrences for a specific date
export function getDateOccurrences(
  entries: Entry[],
  date: Date
): GeneratedOccurrence[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  const occurrences: GeneratedOccurrence[] = [];
  
  entries.forEach(entry => {
    const dayOccurrences = generateOccurrences(entry, startOfDay(date), startOfDay(date));
    occurrences.push(...dayOccurrences.filter(o => o.date === dateStr));
  });
  
  return occurrences;
}

// Calculate summary for a period
export function calculatePeriodSummary(
  entries: Entry[],
  rangeStart: Date,
  rangeEnd: Date
): { totalAmount: number; entryCount: number; occurrences: GeneratedOccurrence[] } {
  let totalAmount = 0;
  let occurrenceCount = 0;
  const allOccurrences: GeneratedOccurrence[] = [];
  
  entries.forEach(entry => {
    const occurrences = generateOccurrences(entry, rangeStart, rangeEnd);
    occurrences.forEach(occ => {
      occurrenceCount++;
      if (occ.entry.amount) {
        totalAmount += occ.entry.amount;
      }
      allOccurrences.push(occ);
    });
  });
  
  return { 
    totalAmount, 
    entryCount: occurrenceCount,
    occurrences: allOccurrences 
  };
}
