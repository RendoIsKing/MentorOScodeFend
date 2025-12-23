import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Scale } from 'lucide-react';

interface WeighInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { weight: number; date: Date; condition: string; notes?: string }) => void;
}

export function WeighInDialog({ open, onOpenChange, onSubmit }: WeighInDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>('');
  const [condition, setCondition] = useState<string>('morning-fasted');
  const [customNotes, setCustomNotes] = useState<string>('');

  const handleSubmit = () => {
    if (!weight || parseFloat(weight) <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    const notes = condition === 'other' ? customNotes : undefined;

    onSubmit({
      weight: parseFloat(weight),
      date,
      condition,
      notes,
    });

    // Reset form
    setWeight('');
    setCondition('morning-fasted');
    setCustomNotes('');
    setDate(new Date());
    onOpenChange(false);
  };

  const conditionLabels: { [key: string]: string } = {
    'morning-fasted': 'Morning (fasted) ✅ Optimal',
    'after-breakfast': 'After breakfast',
    'after-lunch': 'After lunch',
    'after-dinner': 'After dinner',
    'evening': 'Evening',
    'other': 'Other (specify below)',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-stats-primary to-stats-secondary">
              <Scale className="h-5 w-5 text-white" />
            </div>
            Weigh In
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Weight Input */}
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          {/* Condition Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(conditionLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              💡 For best accuracy, weigh yourself in the morning before eating or drinking
            </p>
          </div>

          {/* Custom Notes (shown when "Other" is selected) */}
          {condition === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe when and under what conditions you weighed yourself..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-stats-primary to-stats-secondary text-white"
          >
            Save Weigh In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}