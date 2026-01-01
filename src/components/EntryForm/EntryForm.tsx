import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Entry, Frequency, frequencyLabels } from '@/types/entry';
import { cn } from '@/lib/utils';

interface EntryFormProps {
  onSubmit: (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialDate?: Date;
  editEntry?: Entry;
}

export function EntryForm({ onSubmit, onCancel, initialDate, editEntry }: EntryFormProps) {
  const [title, setTitle] = useState(editEntry?.title || '');
  const [description, setDescription] = useState(editEntry?.description || '');
  const [amount, setAmount] = useState(editEntry?.amount?.toString() || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    editEntry ? new Date(editEntry.startDate) : initialDate || new Date()
  );
  const [frequency, setFrequency] = useState<Frequency>(editEntry?.frequency || 'monthly');
  const [hasEndDate, setHasEndDate] = useState(!!editEntry?.endDate);
  const [endDate, setEndDate] = useState<Date | undefined>(
    editEntry?.endDate ? new Date(editEntry.endDate) : undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !startDate) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      startDate: format(startDate, 'yyyy-MM-dd'),
      frequency,
      endDate: hasEndDate && endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      isPaused: editEntry?.isPaused || false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {editEntry ? 'Edit Entry' : 'New Entry'}
        </h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Monthly Rent, Weekly Grocery..."
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
          rows={2}
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (Optional)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 1500"
        />
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Start Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label>Frequency *</Label>
        <Select value={frequency} onValueChange={(val) => setFrequency(val as Frequency)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(frequencyLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* End Date Toggle */}
      <div className="flex items-center justify-between py-2">
        <Label htmlFor="has-end-date" className="cursor-pointer">
          Set end date for recurrence
        </Label>
        <Switch
          id="has-end-date"
          checked={hasEndDate}
          onCheckedChange={setHasEndDate}
        />
      </div>

      {/* End Date */}
      {hasEndDate && (
        <div className="space-y-2 animate-fade-in">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'Pick end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => startDate ? date < startDate : false}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {editEntry ? 'Update' : 'Save Entry'}
        </Button>
      </div>
    </form>
  );
}
