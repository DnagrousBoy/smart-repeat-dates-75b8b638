export type Frequency = 
  | 'daily' 
  | 'weekly' 
  | 'fortnightly' 
  | 'monthly' 
  | 'quarterly' 
  | 'halfyearly'
  | 'yearly';

export interface Entry {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  startDate: string; // ISO date string
  frequency: Frequency;
  endDate?: string; // Optional end date
  isPaused: boolean;
  status: 'Completed' | 'In-Completed'; // Added status field
  createdAt: string;
  updatedAt: string;
}

export interface EntryStatus {
  id: string;
  entryId: string;
  date: string;
  status: 'COMPLETED' | 'INCOMPLETE';
  remarks?: string;
  updatedAt: string;
}

export interface GeneratedOccurrence {
  entryId: string;
  date: string; // ISO date string
  entry: Entry;
  status?: EntryStatus; // Optional status for this occurrence
}

export const frequencyLabels: Record<Frequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  fortnightly: 'Fortnightly (15 days)',
  monthly: 'Monthly',
  quarterly: '3 Monthly',
  halfyearly: '6 Monthly',
  yearly: 'Yearly',
};

export const frequencyDays: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  fortnightly: 15,
  monthly: 30,
  quarterly: 90,
  halfyearly: 180,
  yearly: 365,
};

// Map frontend frequency to database enum
export const frequencyToDbEnum: Record<Frequency, string> = {
  daily: 'DAILY',
  weekly: 'WEEKLY',
  fortnightly: 'FORTNIGHTLY',
  monthly: 'MONTHLY',
  quarterly: '3_MONTHLY',
  halfyearly: '6_MONTHLY',
  yearly: 'YEARLY',
};

// Map database enum to frontend frequency
export const dbEnumToFrequency: Record<string, Frequency> = {
  'DAILY': 'daily',
  'WEEKLY': 'weekly',
  'FORTNIGHTLY': 'fortnightly',
  'MONTHLY': 'monthly',
  '3_MONTHLY': 'quarterly',
  '6_MONTHLY': 'halfyearly',
  'YEARLY': 'yearly',
};
