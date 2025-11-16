import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Utensils, 
  Droplet, 
  Pill, 
  ShoppingCart, 
  Apple, 
  Flame, 
  AlarmClock,
  ChefHat,
  AlertTriangle,
  Check,
  RefreshCw
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";

export default function ClientDiet() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string | null>(null);
  const [waterIntake, setWaterIntake] = useState(0);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  const { data: dietPlans, isLoading, isError } = useQuery<any[]>({
    queryKey: ['/api/diet-plans', clientId],
    enabled: !!clientId,
  });

  const currentPlan = dietPlans?.[0];

  const waterGoal = currentPlan?.waterIntakeGoal || 8;
  const supplements = currentPlan?.supplements || [
    { name: "Multivitamin", dosage: "1 tablet", timing: "Morning with breakfast" },
    { name: "Protein Powder", dosage: "30g", timing: "Post-workout" },
    { name: "Omega-3", dosage: "1000mg", timing: "With dinner" }
  ];

  const mealSchedule = [
    {
      time: "7:00 AM",
      type: "Breakfast",
      meal: currentPlan?.meals?.breakfast || {
        name: "Oatmeal with Berries",
        calories: 450,
        protein: 15,
        carbs: 65,
        fats: 12,
        ingredients: ["1 cup oatmeal", "1/2 cup blueberries", "1/4 cup almonds", "1 tbsp honey", "1 cup almond milk"],
        instructions: "1. Cook oatmeal according to package directions with almond milk. 2. Top with fresh berries, almonds, and drizzle with honey. 3. Serve warm.",
        alternatives: ["Greek Yogurt Parfait", "Scrambled Eggs with Toast", "Protein Smoothie Bowl"]
      }
    },
    {
      time: "10:00 AM",
      type: "Morning Snack",
      meal: {
        name: "Apple with Almond Butter",
        calories: 200,
        protein: 4,
        carbs: 25,
        fats: 9,
        ingredients: ["1 medium apple", "2 tbsp almond butter"],
        instructions: "Slice apple and serve with almond butter for dipping.",
        alternatives: ["Protein Bar", "Handful of Mixed Nuts", "Greek Yogurt"]
      }
    },
    {
      time: "12:30 PM",
      type: "Lunch",
      meal: currentPlan?.meals?.lunch || {
        name: "Grilled Chicken Salad",
        calories: 550,
        protein: 45,
        carbs: 40,
        fats: 18,
        ingredients: ["6oz grilled chicken breast", "2 cups mixed greens", "1/2 cup cherry tomatoes", "1/4 avocado", "2 tbsp balsamic vinaigrette", "1/4 cup quinoa"],
        instructions: "1. Grill chicken breast seasoned with salt and pepper. 2. Toss greens with tomatoes and quinoa. 3. Slice chicken and avocado, place on salad. 4. Drizzle with vinaigrette.",
        alternatives: ["Turkey Wrap", "Quinoa Buddha Bowl", "Tuna Poke Bowl"]
      }
    },
    {
      time: "3:30 PM",
      type: "Afternoon Snack",
      meal: currentPlan?.meals?.snack || {
        name: "Greek Yogurt & Almonds",
        calories: 300,
        protein: 20,
        carbs: 25,
        fats: 15,
        ingredients: ["1 cup Greek yogurt", "1/4 cup almonds", "1 tbsp honey"],
        instructions: "Mix Greek yogurt with honey, top with almonds.",
        alternatives: ["Cottage Cheese with Fruit", "Protein Shake", "Rice Cakes with Peanut Butter"]
      }
    },
    {
      time: "7:00 PM",
      type: "Dinner",
      meal: currentPlan?.meals?.dinner || {
        name: "Salmon with Quinoa",
        calories: 650,
        protein: 50,
        carbs: 55,
        fats: 20,
        ingredients: ["6oz wild salmon", "1 cup cooked quinoa", "2 cups roasted broccoli", "1 tbsp olive oil", "Lemon & herbs for seasoning"],
        instructions: "1. Season salmon with lemon, herbs, salt, and pepper. 2. Bake at 400°F for 15-18 minutes. 3. Cook quinoa according to package. 4. Roast broccoli with olive oil. 5. Serve together.",
        alternatives: ["Grilled Chicken with Sweet Potato", "Lean Beef Stir-Fry", "Tofu Bowl with Brown Rice"]
      }
    }
  ];

  const allergens = currentPlan?.allergens || [];
  const totalDailyCalories = mealSchedule.reduce((sum, item) => sum + item.meal.calories, 0);
  const totalDailyProtein = mealSchedule.reduce((sum, item) => sum + item.meal.protein, 0);
  const totalDailyCarbs = mealSchedule.reduce((sum, item) => sum + item.meal.carbs, 0);
  const totalDailyFats = mealSchedule.reduce((sum, item) => sum + item.meal.fats, 0);

  const groceryList = [
    { category: "Proteins", items: ["Chicken breast (2 lbs)", "Wild salmon (1 lb)", "Greek yogurt (32oz)", "Eggs (1 dozen)"] },
    { category: "Grains", items: ["Oatmeal (18oz)", "Quinoa (1 lb)", "Whole grain bread (1 loaf)"] },
    { category: "Fruits", items: ["Blueberries (1 pint)", "Apples (6)", "Lemons (3)"] },
    { category: "Vegetables", items: ["Mixed greens (2 bags)", "Broccoli (2 lbs)", "Cherry tomatoes (1 pint)", "Avocados (3)"] },
    { category: "Nuts & Seeds", items: ["Almonds (1 lb)", "Almond butter (16oz)"] },
    { category: "Dairy & Alternatives", items: ["Almond milk (64oz)"] },
    { category: "Pantry", items: ["Olive oil", "Balsamic vinaigrette", "Honey", "Herbs & spices"] }
  ];

  const handleWaterIntake = () => {
    if (waterIntake < waterGoal) {
      setWaterIntake(waterIntake + 1);
    }
  };

  const handleResetWater = () => {
    setWaterIntake(0);
  };

  const toggleMealSelection = (mealId: string) => {
    setSelectedMeals(prev => 
      prev.includes(mealId) ? prev.filter(id => id !== mealId) : [...prev, mealId]
    );
  };

  const handleExportGroceryList = () => {
    const uncheckedItems: string[] = [];
    groceryList.forEach((category, catIndex) => {
      category.items.forEach((item, itemIndex) => {
        if (!selectedMeals.includes(`${catIndex}-${itemIndex}`)) {
          uncheckedItems.push(`${category.category}: ${item}`);
        }
      });
    });

    const listText = uncheckedItems.length > 0 
      ? `Shopping List:\n\n${uncheckedItems.join('\n')}`
      : 'All items are checked off!';

    navigator.clipboard.writeText(listText).then(() => {
      toast({
        title: "Shopping List Exported",
        description: "Your grocery list has been copied to clipboard!",
      });
    }).catch(() => {
      toast({
        title: "Export Failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader currentPage="diet" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Diet & Nutrition</h1>
              <p className="text-muted-foreground mt-1">
                Personalized meal plans with comprehensive nutrition tracking
              </p>
            </div>
            {currentPlan && (
              <Badge className="bg-chart-2" data-testid="badge-plan-type">Premium Plan</Badge>
            )}
          </div>

          {!clientId ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Redirecting to login...
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading your nutrition plan...
              </CardContent>
            </Card>
          ) : isError ? (
            <Card>
              <CardContent className="py-8 text-center text-destructive">
                Failed to load nutrition plan. Please refresh the page.
              </CardContent>
            </Card>
          ) : !currentPlan ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No diet plan assigned yet. Contact your trainer to get started!
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Flame className="h-5 w-5 text-chart-1" />
                    Daily Nutrition Goals
                  </CardTitle>
                  <CardDescription>Target calories, protein, carbs, and fats for your plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold font-display text-primary" data-testid="text-daily-calories">
                        {totalDailyCalories}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Daily Calories</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold font-display text-chart-1" data-testid="text-daily-protein">
                        {totalDailyProtein}g
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold font-display text-chart-2" data-testid="text-daily-carbs">
                        {totalDailyCarbs}g
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold font-display text-chart-3" data-testid="text-daily-fats">
                        {totalDailyFats}g
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Fats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="meals" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="meals" data-testid="tab-meals">
                    <Utensils className="h-4 w-4 mr-2" />
                    Meal Plans
                  </TabsTrigger>
                  <TabsTrigger value="tracking" data-testid="tab-tracking">
                    <Droplet className="h-4 w-4 mr-2" />
                    Tracking
                  </TabsTrigger>
                  <TabsTrigger value="supplements" data-testid="tab-supplements">
                    <Pill className="h-4 w-4 mr-2" />
                    Supplements
                  </TabsTrigger>
                  <TabsTrigger value="grocery" data-testid="tab-grocery">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Grocery List
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="meals" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display">Daily Meal Breakdown</CardTitle>
                      <CardDescription>Detailed breakfast, lunch, dinner, and snack suggestions with timing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {mealSchedule.map((meal, index) => (
                        <Collapsible key={index}>
                          <div className="border rounded-md p-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <AlarmClock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{meal.time}</span>
                                  <Badge variant="outline" data-testid={`badge-meal-type-${index}`}>{meal.type}</Badge>
                                </div>
                                <h3 className="font-semibold text-lg" data-testid={`text-meal-name-${index}`}>
                                  {meal.meal.name}
                                </h3>
                              </div>
                              <Badge className="bg-primary" data-testid={`badge-meal-calories-${index}`}>
                                {meal.meal.calories} cal
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                              <span data-testid={`text-meal-protein-${index}`}>Protein: {meal.meal.protein}g</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span data-testid={`text-meal-carbs-${index}`}>Carbs: {meal.meal.carbs}g</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span data-testid={`text-meal-fats-${index}`}>Fats: {meal.meal.fats}g</span>
                            </div>

                            <CollapsibleTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full" data-testid={`button-expand-meal-${index}`}>
                                <ChefHat className="h-4 w-4 mr-2" />
                                View Recipe Details & Alternatives
                              </Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="mt-4 space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Apple className="h-4 w-4" />
                                  Ingredients
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                  {meal.meal.ingredients?.map((ingredient: string, i: number) => (
                                    <li key={i} data-testid={`text-ingredient-${index}-${i}`}>{ingredient}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Preparation Instructions</h4>
                                <p className="text-sm text-muted-foreground" data-testid={`text-instructions-${index}`}>
                                  {meal.meal.instructions}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4" />
                                  Meal Substitutions
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {meal.meal.alternatives?.map((alt: string, i: number) => (
                                    <Badge key={i} variant="secondary" data-testid={`badge-alternative-${index}-${i}`}>
                                      {alt}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </CardContent>
                  </Card>

                  {allergens.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-display flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Food Allergy Management
                        </CardTitle>
                        <CardDescription>Your marked allergens and dietary restrictions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {allergens.map((allergen: string, index: number) => (
                            <Badge key={index} variant="destructive" data-testid={`badge-allergen-${index}`}>
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          All meal suggestions have been filtered to exclude these allergens. Alternative meals are safe options.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="tracking" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display flex items-center gap-2">
                        <Droplet className="h-5 w-5 text-blue-500" />
                        Water Intake Tracker
                      </CardTitle>
                      <CardDescription>Daily hydration goal monitoring</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground" data-testid="text-water-progress">
                            {waterIntake} / {waterGoal} glasses
                          </span>
                        </div>
                        <Progress value={(waterIntake / waterGoal) * 100} className="h-2" data-testid="progress-water" />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleWaterIntake} 
                          disabled={waterIntake >= waterGoal}
                          data-testid="button-add-water"
                        >
                          <Droplet className="h-4 w-4 mr-2" />
                          Add Glass
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleResetWater}
                          data-testid="button-reset-water"
                        >
                          Reset
                        </Button>
                      </div>
                      {waterIntake >= waterGoal && (
                        <div className="flex items-center gap-2 text-sm text-chart-2">
                          <Check className="h-4 w-4" />
                          <span>Daily hydration goal achieved!</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display">Macro Calculator</CardTitle>
                      <CardDescription>Protein, carbs, and fat tracking per meal and daily total</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mealSchedule.map((meal, index) => (
                          <div key={index} className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">{meal.type}</span>
                            <div className="flex gap-3 text-xs text-muted-foreground">
                              <span>P: {meal.meal.protein}g</span>
                              <span>C: {meal.meal.carbs}g</span>
                              <span>F: {meal.meal.fats}g</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 font-semibold">
                          <span>Daily Total</span>
                          <div className="flex gap-3 text-sm">
                            <span className="text-chart-1">P: {totalDailyProtein}g</span>
                            <span className="text-chart-2">C: {totalDailyCarbs}g</span>
                            <span className="text-chart-3">F: {totalDailyFats}g</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="supplements" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display flex items-center gap-2">
                        <Pill className="h-5 w-5 text-chart-1" />
                        Supplement Tracker
                      </CardTitle>
                      <CardDescription>Log vitamins, protein shakes, and supplements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {supplements.map((supplement: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 border rounded-md p-4">
                            <Checkbox id={`supplement-${index}`} data-testid={`checkbox-supplement-${index}`} />
                            <div className="flex-1">
                              <label 
                                htmlFor={`supplement-${index}`}
                                className="font-semibold cursor-pointer"
                                data-testid={`text-supplement-name-${index}`}
                              >
                                {supplement.name}
                              </label>
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium">Dosage:</span> {supplement.dosage}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Timing:</span> {supplement.timing}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="grocery" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-chart-2" />
                        Grocery List Generator
                      </CardTitle>
                      <CardDescription>Auto-generated shopping list from your weekly meal plan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {groceryList.map((category, index) => (
                          <div key={index}>
                            <h3 className="font-semibold mb-3" data-testid={`text-grocery-category-${index}`}>
                              {category.category}
                            </h3>
                            <div className="space-y-2">
                              {category.items.map((item: string, itemIndex: number) => (
                                <div key={itemIndex} className="flex items-center gap-3">
                                  <Checkbox 
                                    id={`grocery-${index}-${itemIndex}`}
                                    checked={selectedMeals.includes(`${index}-${itemIndex}`)}
                                    onCheckedChange={() => toggleMealSelection(`${index}-${itemIndex}`)}
                                    data-testid={`checkbox-grocery-${index}-${itemIndex}`}
                                  />
                                  <label 
                                    htmlFor={`grocery-${index}-${itemIndex}`}
                                    className="text-sm cursor-pointer flex-1"
                                    data-testid={`text-grocery-item-${index}-${itemIndex}`}
                                  >
                                    {item}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <Button className="w-full" onClick={handleExportGroceryList} data-testid="button-export-grocery">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Export Shopping List
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
