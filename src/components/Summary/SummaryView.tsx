import { useMemo } from 'react';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  addMonths,
  format
} from 'date-fns';
import { TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { Entry } from '@/types/entry';
import { calculatePeriodSummary } from '@/lib/recurrence';

interface SummaryViewProps {
  entries: Entry[];
  currentDate: Date;
}

export function SummaryView({ entries, currentDate }: SummaryViewProps) {
  const summaries = useMemo(() => {
    const today = new Date();
    
    // This month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthlySummary = calculatePeriodSummary(entries, monthStart, monthEnd);

    // This week
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const weeklySummary = calculatePeriodSummary(entries, weekStart, weekEnd);

    // Quarter (3 months)
    const quarterStart = subMonths(monthStart, 2);
    const quarterEnd = monthEnd;
    const quarterlySummary = calculatePeriodSummary(entries, quarterStart, quarterEnd);

    // Half year (6 months)
    const halfYearStart = subMonths(monthStart, 5);
    const halfYearEnd = monthEnd;
    const halfYearlySummary = calculatePeriodSummary(entries, halfYearStart, halfYearEnd);

    return {
      monthly: monthlySummary,
      weekly: weeklySummary,
      quarterly: quarterlySummary,
      halfYearly: halfYearlySummary,
    };
  }, [entries, currentDate]);

  const summaryCards = [
    {
      title: 'This Week',
      icon: Calendar,
      count: summaries.weekly.entryCount,
      amount: summaries.weekly.totalAmount,
      color: 'text-frequency-weekly',
      bgColor: 'bg-frequency-weekly/10',
    },
    {
      title: format(currentDate, 'MMMM'),
      icon: TrendingUp,
      count: summaries.monthly.entryCount,
      amount: summaries.monthly.totalAmount,
      color: 'text-frequency-monthly',
      bgColor: 'bg-frequency-monthly/10',
    },
    {
      title: 'Quarter',
      icon: BarChart3,
      count: summaries.quarterly.entryCount,
      amount: summaries.quarterly.totalAmount,
      color: 'text-frequency-quarterly',
      bgColor: 'bg-frequency-quarterly/10',
    },
    {
      title: 'Half Year',
      icon: DollarSign,
      count: summaries.halfYearly.entryCount,
      amount: summaries.halfYearly.totalAmount,
      color: 'text-frequency-halfyearly',
      bgColor: 'bg-frequency-halfyearly/10',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold px-2">Summary</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="glass-card rounded-xl p-4 animate-slide-up"
          >
            <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center mb-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
            <p className="text-2xl font-bold">{card.count}</p>
            <p className="text-xs text-muted-foreground">entries</p>
            {card.amount > 0 && (
              <p className={`text-sm font-semibold mt-2 ${card.color}`}>
                ₹{card.amount.toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
