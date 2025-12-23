import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Camera, Upload, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ScanMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealScanned: (meal: {
    name: string;
    items: string[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) => void;
}

export function ScanMealDialog({ open, onOpenChange, onMealScanned }: ScanMealDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with realistic delay
    setTimeout(() => {
      // Mock AI analysis results - in a real app, this would call an AI API
      const mockResults = [
        {
          name: 'Grilled Chicken with Rice and Vegetables',
          items: ['Grilled chicken breast (200g)', 'Brown rice (150g)', 'Steamed broccoli (100g)', 'Carrots (50g)', 'Olive oil drizzle'],
          calories: 520,
          protein: 45,
          carbs: 58,
          fats: 12,
          confidence: 92
        },
        {
          name: 'Salmon Bowl with Quinoa',
          items: ['Grilled salmon (180g)', 'Quinoa (120g)', 'Mixed greens (80g)', 'Cherry tomatoes (50g)', 'Lemon dressing'],
          calories: 580,
          protein: 42,
          carbs: 52,
          fats: 18,
          confidence: 88
        },
        {
          name: 'Protein Pasta Bowl',
          items: ['Whole wheat pasta (150g)', 'Grilled chicken (150g)', 'Tomato sauce (100g)', 'Spinach (50g)', 'Parmesan (20g)'],
          calories: 620,
          protein: 48,
          carbs: 72,
          fats: 14,
          confidence: 85
        }
      ];

      // Randomly select one of the mock results
      const result = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleUseMeal = () => {
    if (analysisResult) {
      onMealScanned({
        name: analysisResult.name,
        items: analysisResult.items,
        calories: analysisResult.calories,
        protein: analysisResult.protein,
        carbs: analysisResult.carbs,
        fats: analysisResult.fats,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    onOpenChange(false);
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Meal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedImage ? (
            // Upload Section
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Take a photo or upload an image of your meal. Our AI will analyze it and estimate the nutritional content.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Card className="p-8 border-2 border-dashed hover:border-nutrition transition-colors">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Camera className="h-12 w-12 text-nutrition" />
                      <div>
                        <p className="text-foreground mb-1">Take Photo</p>
                        <p className="text-xs text-muted-foreground">Use your camera</p>
                      </div>
                    </div>
                  </Card>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Card className="p-8 border-2 border-dashed hover:border-nutrition transition-colors">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Upload className="h-12 w-12 text-nutrition" />
                      <div>
                        <p className="text-foreground mb-1">Upload Image</p>
                        <p className="text-xs text-muted-foreground">Choose from gallery</p>
                      </div>
                    </div>
                  </Card>
                </label>
              </div>
            </div>
          ) : (
            // Analysis Section
            <div className="space-y-4">
              {/* Image Preview */}
              <Card className="p-4 bg-muted/50">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="Meal preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </Card>

              {/* Analysis Status */}
              {isAnalyzing && (
                <Card className="p-6 bg-gradient-to-br from-nutrition/10 to-success/10">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 text-nutrition animate-spin" />
                    <div>
                      <p className="text-foreground mb-1">Analyzing your meal...</p>
                      <p className="text-sm text-muted-foreground">Using AI to identify ingredients and estimate nutrition</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Analysis Results */}
              {analysisResult && !isAnalyzing && (
                <div className="space-y-4">
                  <Card className="p-4 bg-gradient-to-br from-nutrition/10 to-success/10 border-nutrition/30">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-nutrition rounded-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-foreground">{analysisResult.name}</h4>
                          <Badge className="bg-success/20 text-success border-success/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {analysisResult.confidence}% confident
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">AI-powered estimation</p>
                      </div>
                    </div>

                    {/* Nutrition Facts */}
                    <div className="grid grid-cols-4 gap-3 p-4 bg-card rounded-lg">
                      <div className="text-center">
                        <p className="text-lg text-foreground">{analysisResult.calories}</p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg text-foreground">{analysisResult.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg text-foreground">{analysisResult.carbs}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg text-foreground">{analysisResult.fats}g</p>
                        <p className="text-xs text-muted-foreground">Fats</p>
                      </div>
                    </div>
                  </Card>

                  {/* Detected Ingredients */}
                  <Card className="p-4">
                    <h4 className="text-foreground mb-3">Detected Ingredients</h4>
                    <ul className="space-y-2">
                      {analysisResult.items.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-nutrition mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-3 bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> These values are estimates based on AI analysis. For more accurate tracking, you can manually adjust the values after adding the meal.
                    </p>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {selectedImage && !isAnalyzing && analysisResult && (
            <>
              <Button variant="outline" onClick={handleRetake}>
                Retake Photo
              </Button>
              <Button onClick={handleUseMeal} className="bg-gradient-to-r from-nutrition to-success">
                Use This Meal
              </Button>
            </>
          )}
          {!selectedImage && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}