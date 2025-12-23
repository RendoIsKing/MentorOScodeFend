import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { X, Plus, Camera } from 'lucide-react';

interface Meal {
  id: number;
  name: string;
  time: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed?: boolean;
  isModified?: boolean;
}

interface MealEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: Meal | null;
  onSave: (meal: Meal) => void;
  isNewMeal?: boolean;
  onScanInstead?: () => void;
}

export function MealEditorDialog({ open, onOpenChange, meal, onSave, isNewMeal = false, onScanInstead }: MealEditorDialogProps) {
  const [editedMeal, setEditedMeal] = useState<Meal | null>(null);
  const [newIngredient, setNewIngredient] = useState('');

  useEffect(() => {
    if (meal) {
      setEditedMeal({ ...meal });
    } else if (isNewMeal && open) {
      // Create a blank meal template
      setEditedMeal({
        id: Date.now(),
        name: '',
        time: '',
        items: [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        completed: false,
        isModified: true,
      });
    }
  }, [meal, open, isNewMeal]);

  const handleSave = () => {
    if (editedMeal) {
      onSave({ ...editedMeal, isModified: true });
      onOpenChange(false);
      setNewIngredient('');
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && editedMeal) {
      setEditedMeal({
        ...editedMeal,
        items: [...editedMeal.items, newIngredient.trim()],
      });
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    if (editedMeal) {
      setEditedMeal({
        ...editedMeal,
        items: editedMeal.items.filter((_, i) => i !== index),
      });
    }
  };

  const handleIngredientKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  if (!editedMeal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isNewMeal ? 'Add Custom Meal' : 'Edit Meal'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="meal-name">Meal Name</Label>
                <Input
                  id="meal-name"
                  value={editedMeal.name}
                  onChange={(e) => setEditedMeal({ ...editedMeal, name: e.target.value })}
                  placeholder="e.g., Grilled Chicken Salad"
                />
              </div>

              <div>
                <Label htmlFor="meal-time">Time</Label>
                <Input
                  id="meal-time"
                  value={editedMeal.time}
                  onChange={(e) => setEditedMeal({ ...editedMeal, time: e.target.value })}
                  placeholder="e.g., 12:00 PM"
                />
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <Label>Ingredients / Food Items</Label>
              <div className="mt-2 space-y-2">
                {editedMeal.items.map((item, index) => (
                  <Card key={index} className="p-3 bg-gradient-to-br from-nutrition-primary/20 to-nutrition-primary/30 border-nutrition-primary/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-foreground flex-1">{item}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIngredient(index)}
                        className="h-8 w-8 p-0 hover:bg-background/50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                <div className="flex gap-2">
                  <Input
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={handleIngredientKeyPress}
                    placeholder="Add ingredient or food item..."
                  />
                  <Button
                    onClick={handleAddIngredient}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div>
              <Label className="mb-3 block">Nutritional Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories" className="text-sm">Calories (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={editedMeal.calories}
                    onChange={(e) => setEditedMeal({ ...editedMeal, calories: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="protein" className="text-sm">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={editedMeal.protein}
                    onChange={(e) => setEditedMeal({ ...editedMeal, protein: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="carbs" className="text-sm">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={editedMeal.carbs}
                    onChange={(e) => setEditedMeal({ ...editedMeal, carbs: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="fats" className="text-sm">Fats (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    value={editedMeal.fats}
                    onChange={(e) => setEditedMeal({ ...editedMeal, fats: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 gap-2">
          {onScanInstead && (
            <Button
              onClick={onScanInstead}
              variant="outline"
              className="mr-auto border-nutrition/30 hover:bg-nutrition/10"
            >
              <Camera className="h-4 w-4 mr-2" />
              Scan Instead
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!editedMeal.name.trim()}>
            {isNewMeal ? 'Add Meal' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}