import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Scale, TrendingDown, CheckCircle, Share2 } from 'lucide-react';

interface WeighInCardProps {
  onSubmit: (data: { weight: number; date: Date; condition: string; notes?: string }) => void;
  submittedData?: {
    weight: number;
    date: Date;
    condition: string;
    notes?: string;
  };
  onShare?: (data?: { weight: number; date: Date; condition: string; notes?: string }) => void;
}

export function WeighInCard({ onSubmit, submittedData, onShare }: WeighInCardProps) {
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
    const data = {
      weight: parseFloat(weight),
      date,
      condition,
      notes,
    };

    onSubmit(data);
  };

  const conditionLabels: { [key: string]: string } = {
    'morning-fasted': 'Morning (fasted) ✅ Optimal',
    'after-breakfast': 'After breakfast',
    'after-lunch': 'After lunch',
    'after-dinner': 'After dinner',
    'evening': 'Evening',
    'other': 'Other (specify below)',
  };

  // If submitted data exists, show the logged weigh-in
  if (submittedData) {
    return (
      <Card className="p-5 relative bg-white border-stats-primary/20 shadow-sm">
        {/* Share Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-gray-600"
          onClick={() => {
            // Share functionality placeholder
            onShare && onShare(submittedData);
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-stats-primary to-stats-secondary shadow-md">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-gray-900 font-semibold">Weigh In Logged</h3>
        </div>

        <div className="space-y-3">
          {/* Logged Weight Entry */}
          <div className="flex items-center justify-between p-4 bg-stats-primary/10 rounded-xl border border-stats-primary/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-stats-primary/20">
                <CheckCircle className="h-5 w-5 text-stats-primary" />
              </div>
              <div>
                <p className="text-gray-900 text-lg font-semibold">{submittedData.weight} kg</p>
                <p className="text-xs text-gray-500">
                  {submittedData.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="text-stats-primary">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>

          {/* Condition Info */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1.5 font-medium">Condition</p>
            <p className="text-sm text-gray-900">
              {conditionLabels[submittedData.condition] || submittedData.condition}
            </p>
            {submittedData.notes && (
              <>
                <p className="text-xs text-gray-500 mt-3 mb-1.5 font-medium">Notes</p>
                <p className="text-sm text-gray-900">{submittedData.notes}</p>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Otherwise, show the input form
  return (
    <Card className="p-5 relative bg-white border-stats-primary/20 shadow-sm">
      {/* Share Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-gray-600"
        onClick={() => {
          // When sharing from form, pass current form values if weight is filled in
          if (weight && parseFloat(weight) > 0) {
            const notes = condition === 'other' ? customNotes : undefined;
            const formData = {
              weight: parseFloat(weight),
              date,
              condition,
              notes,
            };
            onShare && onShare(formData);
          } else {
            // If no weight entered, share with defaults
            onShare && onShare();
          }
        }}
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-stats-primary to-stats-secondary shadow-md">
          <Scale className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-gray-900 font-semibold">Weigh In</h3>
      </div>

      <div className="space-y-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-gray-700 font-medium">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left text-sm bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
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
          <Label htmlFor="weight" className="text-gray-700 font-medium">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="75.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="bg-white border-gray-300 focus:border-stats-primary text-gray-900"
          />
        </div>

        {/* Condition Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="condition" className="text-gray-700 font-medium">Condition</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id="condition" className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              {Object.entries(conditionLabels).map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-gray-900">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            💡 For best accuracy, weigh yourself in the morning before eating or drinking
          </p>
        </div>

        {/* Custom Notes (shown when "Other" is selected) */}
        {condition === 'other' && (
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-700 font-medium">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Describe when and under what conditions you weighed yourself..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={3}
              className="bg-white border-gray-300 focus:border-stats-primary text-gray-900"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-stats-primary to-stats-secondary text-white hover:opacity-90 shadow-lg"
          >
            Save Weigh In
          </Button>
        </div>
      </div>
    </Card>
  );
}