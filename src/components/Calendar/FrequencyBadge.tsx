import { Frequency, frequencyLabels } from '@/types/entry';
import { cn } from '@/lib/utils';

interface FrequencyBadgeProps {
  frequency: Frequency;
  className?: string;
}

export function FrequencyBadge({ frequency, className }: FrequencyBadgeProps) {
  const badgeClass = `freq-${frequency}`;
  
  return (
    <span className={cn('frequency-badge', badgeClass, className)}>
      {frequencyLabels[frequency]}
    </span>
  );
}
