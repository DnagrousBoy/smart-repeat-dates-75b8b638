export type Frequency = 
  | 'daily' 
  | 'weekly' 
  | 'fortnightly' 
  | 'monthly' 
  | 'quarterly' 
  | 'halfyearly';

export interface Entry {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  startDate: string; // ISO date string
  frequency: Frequency;
  endDate?: string; // Optional end date
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedOccurrence {
  entryId: string;
  date: string; // ISO date string
  entry: Entry;
}

export const frequencyLabels: Record<Frequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  fortnightly: 'Fortnightly (15 days)',
  monthly: 'Monthly',
  quarterly: '3 Monthly',
  halfyearly: '6 Monthly',
};

export const frequencyDays: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  fortnightly: 15,
  monthly: 30, // Approximate, handled specially
  quarterly: 90, // Approximate, handled specially
  halfyearly: 180, // Approximate, handled specially
};
