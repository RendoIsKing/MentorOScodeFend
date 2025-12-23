import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Target, TrendingUp, Utensils, Heart, Zap, Award, Calendar, Apple, ChevronDown } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useState } from 'react';

interface NutritionPlanOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NutritionPlanOverviewDialog({ open, onOpenChange }: NutritionPlanOverviewDialogProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    philosophy: true,
    macros: true,
    foodGroups: true,
    micronutrients: true,
    journey: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[95vh] max-h-[95vh] p-0 gap-0 bg-background border rounded-lg my-auto flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-nutrition-primary to-nutrition-secondary px-6 py-6 border-b border-nutrition-primary/20 rounded-t-lg">
          <div className="space-y-2">
            <DialogTitle className="text-white">Lean Muscle Building Plan</DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white border-gray-600/60 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                4 Weeks
              </Badge>
              <Badge className="bg-white/20 text-white border-gray-600/60 text-xs">
                <Utensils className="h-3 w-3 mr-1" />
                4 Meals/Day
              </Badge>
              <Badge className="bg-white/20 text-white border-gray-600/60 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                2000 cal
              </Badge>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-6 px-6 py-6">
            {/* Nutrition Philosophy */}
            <div>
              <button
                onClick={() => toggleSection('philosophy')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-nutrition-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Nutrition Philosophy</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.philosophy ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.philosophy && (
                <Card className="p-6 bg-gradient-to-br from-nutrition-primary/10 to-nutrition-primary/5 border-nutrition-primary/30">
                  <p className="text-foreground leading-relaxed mb-4">
                    This nutrition plan is designed to support <strong>lean muscle growth</strong> while maintaining a <strong>healthy body composition</strong>. 
                    The plan focuses on whole, nutrient-dense foods that provide the energy and building blocks your body needs to recover from training 
                    and build muscle effectively.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    Each meal is carefully balanced with the right combination of protein, carbohydrates, and healthy fats to optimize muscle protein synthesis, 
                    maintain steady energy levels throughout the day, and support overall health and performance. The plan is flexible enough to accommodate 
                    your preferences while staying aligned with your fitness goals.
                  </p>
                </Card>
              )}
            </div>

            {/* Macronutrient Breakdown */}
            <div>
              <button
                onClick={() => toggleSection('macros')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-nutrition-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Daily Macronutrient Targets</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.macros ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.macros && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5 bg-gradient-to-br from-nutrition-primary/10 to-transparent border-nutrition-primary/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-nutrition-primary/20 rounded-lg">
                        <Utensils className="h-5 w-5 text-nutrition-primary" />
                      </div>
                      <h5 className="text-foreground">Macro Distribution</h5>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">Protein</span>
                          <span className="text-foreground"><strong>120g</strong></span>
                        </div>
                        <p className="text-xs text-white">Essential for muscle repair and growth. Distributed evenly across meals for optimal absorption.</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">Carbohydrates</span>
                          <span className="text-foreground"><strong>250g</strong></span>
                        </div>
                        <p className="text-xs text-white">Primary energy source for training and daily activities. Focus on complex carbs for sustained energy.</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">Fats</span>
                          <span className="text-foreground"><strong>65g</strong></span>
                        </div>
                        <p className="text-xs text-white">Supports hormone production and nutrient absorption. Emphasizes healthy unsaturated fats.</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5 bg-gradient-to-br from-nutrition-secondary/10 to-transparent border-nutrition-secondary/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-nutrition-secondary/20 rounded-lg">
                        <Zap className="h-5 w-5 text-nutrition-secondary" />
                      </div>
                      <h5 className="text-foreground">Meal Timing Strategy</h5>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-white mb-2">Daily Structure:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-nutrition-primary/20 text-white border-nutrition-primary/40">
                            Breakfast 8am
                          </Badge>
                          <Badge variant="outline" className="bg-nutrition-primary/20 text-white border-nutrition-primary/40">
                            Lunch 1pm
                          </Badge>
                          <Badge variant="outline" className="bg-nutrition-primary/20 text-white border-nutrition-primary/40">
                            Snack 4pm
                          </Badge>
                          <Badge variant="outline" className="bg-nutrition-primary/20 text-white border-nutrition-primary/40">
                            Dinner 7pm
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-foreground leading-relaxed mt-3">
                          Meals are strategically timed to fuel workouts, maximize muscle protein synthesis throughout the day, 
                          and maintain steady energy levels. Pre-workout meals focus on easily digestible carbs and protein, 
                          while post-workout nutrition emphasizes recovery and replenishment.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Key Food Groups */}
            <div>
              <button
                onClick={() => toggleSection('foodGroups')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-nutrition-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Core Food Groups</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.foodGroups ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.foodGroups && (
                <Card className="p-6 bg-gradient-to-br from-nutrition-primary/5 to-transparent border-nutrition-primary/20">
                  <p className="text-sm text-white mb-4">
                    This plan emphasizes whole, minimally processed foods that provide maximum nutrition:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-foreground mb-3 flex items-center gap-2">
                        <Apple className="h-4 w-4 text-nutrition-primary" />
                        Protein Sources
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Chicken & Turkey</strong> - Lean, high-quality protein</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Salmon & Fish</strong> - Protein + omega-3 fatty acids</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Greek Yogurt</strong> - Protein + probiotics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Eggs</strong> - Complete amino acid profile</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Whey Protein</strong> - Fast-absorbing post-workout</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-foreground mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-nutrition-secondary" />
                        Carbohydrate Sources
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Oatmeal</strong> - Slow-releasing complex carbs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Quinoa</strong> - Complete protein + fiber</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Sweet Potatoes</strong> - Vitamins + sustained energy</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Fruits</strong> - Natural sugars + micronutrients</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-secondary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Vegetables</strong> - Fiber + vitamins + minerals</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h6 className="text-foreground mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-nutrition-primary" />
                      Healthy Fat Sources
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Avocado</strong> - Monounsaturated fats + fiber</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Nuts & Nut Butters</strong> - Healthy fats + protein</span>
                        </li>
                      </ul>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Olive Oil</strong> - Heart-healthy monounsaturated fats</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-nutrition-primary flex-shrink-0"></div>
                          <span className="text-foreground"><strong>Fatty Fish</strong> - Omega-3s for inflammation</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Nutritional Benefits */}
            <div>
              <button
                onClick={() => toggleSection('micronutrients')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-nutrition-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Micronutrient Focus</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.micronutrients ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.micronutrients && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'Vitamin D', benefit: 'Bone & Immune Health' },
                    { name: 'Iron', benefit: 'Energy & Oxygen Transport' },
                    { name: 'Calcium', benefit: 'Bone Strength' },
                    { name: 'Magnesium', benefit: 'Muscle Function' },
                    { name: 'Zinc', benefit: 'Recovery & Immunity' },
                    { name: 'B Vitamins', benefit: 'Energy Metabolism' },
                    { name: 'Vitamin C', benefit: 'Immune Support' },
                    { name: 'Omega-3', benefit: 'Anti-inflammatory' },
                  ].map((nutrient) => (
                    <Card 
                      key={nutrient.name} 
                      className="p-4 bg-gradient-to-br from-nutrition-primary/5 to-transparent border-nutrition-primary/20 hover:border-nutrition-primary/40 transition-colors"
                    >
                      <p className="text-foreground mb-1">{nutrient.name}</p>
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-nutrition-primary/20 text-white border-nutrition-primary/40"
                      >
                        {nutrient.benefit}
                      </Badge>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Expected Outcomes */}
            <div>
              <button
                onClick={() => toggleSection('journey')}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <div className="h-1 w-1 rounded-full bg-nutrition-primary"></div>
                <h4 className="text-foreground uppercase tracking-wide text-sm">Your Nutrition Journey</h4>
                <div className="flex-1 h-px bg-border"></div>
                <ChevronDown className={`h-4 w-4 text-foreground transition-transform ${expandedSections.journey ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections.journey && (
                <Card className="p-6 bg-gradient-to-br from-purple-500/15 via-purple-500/10 to-purple-500/5 border-purple-500/40">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex-shrink-0">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="text-foreground mb-2">What to Expect</h5>
                      <p className="text-sm text-foreground leading-relaxed">
                        Following this nutrition plan will transform not just your body, but your entire relationship with food. You'll learn to fuel your body 
                        properly, understand portion sizes, and develop sustainable eating habits that last a lifetime.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h6 className="text-foreground flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-purple-500" />
                        Physical Benefits
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Increased lean muscle mass</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Improved body composition</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Faster workout recovery</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Stable energy levels all day</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Better digestion & gut health</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h6 className="text-foreground flex items-center gap-2">
                        <Heart className="h-4 w-4 text-purple-500" />
                        Mental & Lifestyle Benefits
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Improved mental clarity & focus</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Better mood & emotional balance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Healthy relationship with food</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Sustainable eating habits</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">✓</span>
                          <span className="text-foreground">Knowledge to fuel any goal</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-foreground leading-relaxed italic">
                      🥗 <strong>Remember:</strong> Nutrition is not about restriction—it's about nourishment. This plan gives you the flexibility to enjoy food 
                      while reaching your goals. Focus on progress, not perfection, and remember that consistency beats intensity every time.
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Coach's Note */}
            <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex-shrink-0">
                  <span className="text-2xl">👋</span>
                </div>
                <div>
                  <h5 className="text-foreground mb-2">A Note from Coach Majen</h5>
                  <p className="text-sm text-foreground leading-relaxed">
                    "This nutrition plan is designed to work seamlessly with your training program. I've taken the guesswork out of meal planning so you can 
                    focus on what matters—showing up, staying consistent, and trusting the process. Remember, food is fuel, and you deserve to eat well. 
                    Don't stress about being perfect; aim for progress. I'm here to support you every step of the way! 🌟"
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-muted/30">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full bg-gradient-to-r from-nutrition-primary to-nutrition-secondary hover:from-nutrition-primary/90 hover:to-nutrition-secondary/90 text-white shadow-lg"
          >
            Let's Get Started!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}