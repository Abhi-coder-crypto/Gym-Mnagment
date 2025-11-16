import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Activity,
  Droplet,
  Utensils,
  Clock,
  Flame,
  Scale
} from "lucide-react";

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Goal = "lose" | "maintain" | "gain";
type BodyType = "ectomorph" | "mesomorph" | "endomorph";

export function AdvancedNutritionCalculators() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [results, setResults] = useState<any>(null);

  // Body Fat Calculator States
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [bodyFatResult, setBodyFatResult] = useState<any>(null);

  // Macro Calculator States
  const [bodyType, setBodyType] = useState<BodyType>("mesomorph");
  const [macroResults, setMacroResults] = useState<any>(null);

  // Protein Calculator States
  const [proteinGoal, setProteinGoal] = useState<"general" | "muscle_gain" | "fat_loss" | "athlete">("general");
  const [proteinResult, setProteinResult] = useState<any>(null);

  // Meal Timing States
  const [workoutTime, setWorkoutTime] = useState("morning");
  const [mealTimingResult, setMealTimingResult] = useState<any>(null);

  // Carb Cycling States
  const [workoutDays, setWorkoutDays] = useState("");
  const [carbCycleResult, setCarbCycleResult] = useState<any>(null);

  // Hydration States
  const [hydrationActivity, setHydrationActivity] = useState<ActivityLevel>("moderate");
  const [climate, setClimate] = useState<"temperate" | "hot" | "cold">("temperate");
  const [hydrationResult, setHydrationResult] = useState<any>(null);

  const calculateBMI = (weightKg: number, heightM: number): number => {
    return weightKg / (heightM * heightM);
  };

  const calculateBMR = (weightKg: number, heightCm: number, ageYears: number, genderVal: "male" | "female"): number => {
    if (genderVal === "male") {
      return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
    } else {
      return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    }
  };

  const calculateTDEE = (bmr: number, activity: ActivityLevel): number => {
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return bmr * multipliers[activity];
  };

  const calculateIdealWeight = (heightCm: number, genderVal: "male" | "female"): { min: number; max: number } => {
    const heightM = heightCm / 100;
    const minBMI = 18.5;
    const maxBMI = 24.9;
    return {
      min: minBMI * heightM * heightM,
      max: maxBMI * heightM * heightM
    };
  };

  const getCalorieTarget = (tdee: number, goalType: Goal): number => {
    if (goalType === "lose") return tdee - 500;
    if (goalType === "gain") return tdee + 300;
    return tdee;
  };

  const handleCalculateTDEE = () => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseInt(age);

    if (!weightKg || !heightCm || !ageYears) {
      return;
    }

    const heightM = heightCm / 100;
    const bmi = calculateBMI(weightKg, heightM);
    const bmr = calculateBMR(weightKg, heightCm, ageYears, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const idealWeight = calculateIdealWeight(heightCm, gender);
    const calorieTarget = getCalorieTarget(tdee, goal);

    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 25) bmiCategory = "Normal weight";
    else if (bmi < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";

    setResults({
      bmi: bmi.toFixed(1),
      bmiCategory,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      idealWeight,
      calorieTarget: Math.round(calorieTarget),
      goal
    });
  };

  const handleCalculateBodyFat = () => {
    const neckCm = parseFloat(neck);
    const waistCm = parseFloat(waist);
    const hipCm = parseFloat(hip);
    const heightCm = parseFloat(height);

    if (!neckCm || !waistCm || !heightCm) return;

    let bodyFatPercentage = 0;
    
    if (gender === "male") {
      bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      if (!hipCm) return;
      bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
    }

    let category = "";
    let color = "";
    
    if (gender === "male") {
      if (bodyFatPercentage < 6) { category = "Essential Fat"; color = "bg-chart-4"; }
      else if (bodyFatPercentage < 14) { category = "Athletes"; color = "bg-chart-3"; }
      else if (bodyFatPercentage < 18) { category = "Fitness"; color = "bg-chart-2"; }
      else if (bodyFatPercentage < 25) { category = "Average"; color = "bg-chart-1"; }
      else { category = "Obese"; color = "bg-destructive"; }
    } else {
      if (bodyFatPercentage < 14) { category = "Essential Fat"; color = "bg-chart-4"; }
      else if (bodyFatPercentage < 21) { category = "Athletes"; color = "bg-chart-3"; }
      else if (bodyFatPercentage < 25) { category = "Fitness"; color = "bg-chart-2"; }
      else if (bodyFatPercentage < 32) { category = "Average"; color = "bg-chart-1"; }
      else { category = "Obese"; color = "bg-destructive"; }
    }

    setBodyFatResult({
      percentage: bodyFatPercentage.toFixed(1),
      category,
      color,
      leanMass: (parseFloat(weight) * (1 - bodyFatPercentage / 100)).toFixed(1),
      fatMass: (parseFloat(weight) * (bodyFatPercentage / 100)).toFixed(1)
    });
  };

  const handleCalculateMacros = () => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseInt(age);

    if (!weightKg || !heightCm || !ageYears) return;

    const bmr = calculateBMR(weightKg, heightCm, ageYears, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = getCalorieTarget(tdee, goal);

    let proteinPercent = 30;
    let carbPercent = 40;
    let fatPercent = 30;

    if (bodyType === "ectomorph") {
      proteinPercent = 25;
      carbPercent = 55;
      fatPercent = 20;
    } else if (bodyType === "endomorph") {
      proteinPercent = 35;
      carbPercent = 25;
      fatPercent = 40;
    }

    if (goal === "lose") {
      proteinPercent += 5;
      carbPercent -= 5;
    } else if (goal === "gain") {
      carbPercent += 5;
      fatPercent -= 5;
    }

    const proteinGrams = Math.round((targetCalories * (proteinPercent / 100)) / 4);
    const carbGrams = Math.round((targetCalories * (carbPercent / 100)) / 4);
    const fatGrams = Math.round((targetCalories * (fatPercent / 100)) / 9);

    setMacroResults({
      calories: targetCalories,
      protein: { grams: proteinGrams, percent: proteinPercent },
      carbs: { grams: carbGrams, percent: carbPercent },
      fats: { grams: fatGrams, percent: fatPercent },
      bodyType,
      goal
    });
  };

  const handleCalculateProtein = () => {
    const weightKg = parseFloat(weight);
    if (!weightKg) return;

    const multipliers = {
      general: 0.8,
      muscle_gain: 2.2,
      fat_loss: 2.0,
      athlete: 1.8
    };

    const proteinGrams = Math.round(weightKg * multipliers[proteinGoal]);
    const calories = proteinGrams * 4;

    setProteinResult({
      grams: proteinGrams,
      calories,
      goal: proteinGoal,
      perMeal: Math.round(proteinGrams / 4)
    });
  };

  const handleCalculateMealTiming = () => {
    const schedules = {
      morning: {
        preworkout: "6:00 AM - Light carbs & protein (banana + protein shake)",
        workout: "7:00 AM - 9:00 AM",
        postworkout: "9:30 AM - High protein + carbs (eggs, oats, fruit)",
        lunch: "12:30 PM - Balanced meal",
        snack: "3:30 PM - Protein-rich",
        dinner: "7:00 PM - Moderate carbs, high protein"
      },
      afternoon: {
        breakfast: "7:00 AM - Balanced breakfast",
        snack: "10:00 AM - Light protein",
        preworkout: "2:30 PM - Complex carbs + protein",
        workout: "3:30 PM - 5:30 PM",
        postworkout: "6:00 PM - High protein + carbs",
        dinner: "8:00 PM - Moderate meal"
      },
      evening: {
        breakfast: "7:00 AM - High protein breakfast",
        lunch: "12:00 PM - Balanced meal",
        preworkout: "5:00 PM - Light carbs + protein",
        workout: "6:00 PM - 8:00 PM",
        postworkout: "8:30 PM - High protein, moderate carbs",
        lateSnack: "10:00 PM - Casein protein (optional)"
      }
    };

    setMealTimingResult(schedules[workoutTime as keyof typeof schedules]);
  };

  const handleCalculateCarbCycling = () => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageYears = parseInt(age);
    const days = parseInt(workoutDays);

    if (!weightKg || !heightCm || !ageYears || !days) return;

    const bmr = calculateBMR(weightKg, heightCm, ageYears, gender);
    const tdee = calculateTDEE(bmr, activityLevel);

    const highCarbCalories = Math.round(tdee + 200);
    const lowCarbCalories = Math.round(tdee - 300);
    const restDays = 7 - days;

    const highCarbProtein = Math.round(weightKg * 2);
    const highCarbFat = Math.round((highCarbCalories * 0.20) / 9);
    const highCarbCarbs = Math.round((highCarbCalories - (highCarbProtein * 4) - (highCarbFat * 9)) / 4);

    const lowCarbProtein = Math.round(weightKg * 2.2);
    const lowCarbFat = Math.round((lowCarbCalories * 0.35) / 9);
    const lowCarbCarbs = Math.round((lowCarbCalories - (lowCarbProtein * 4) - (lowCarbFat * 9)) / 4);

    setCarbCycleResult({
      highDays: {
        days,
        calories: highCarbCalories,
        protein: highCarbProtein,
        carbs: highCarbCarbs,
        fats: highCarbFat
      },
      lowDays: {
        days: restDays,
        calories: lowCarbCalories,
        protein: lowCarbProtein,
        carbs: lowCarbCarbs,
        fats: lowCarbFat
      }
    });
  };

  const handleCalculateHydration = () => {
    const weightKg = parseFloat(weight);
    if (!weightKg) return;

    let baseWater = weightKg * 0.033;

    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.3,
      active: 1.5,
      very_active: 1.7
    };

    const climateMultipliers = {
      temperate: 1.0,
      hot: 1.25,
      cold: 0.9
    };

    baseWater *= activityMultipliers[hydrationActivity];
    baseWater *= climateMultipliers[climate];

    const liters = baseWater.toFixed(1);
    const glasses = Math.round(baseWater * 4);
    const ounces = Math.round(baseWater * 33.814);

    setHydrationResult({
      liters,
      glasses,
      ounces,
      perHour: (parseFloat(liters) / 16).toFixed(2)
    });
  };

  const getBMIColor = (category: string) => {
    if (category === "Normal weight") return "bg-chart-3 text-white";
    if (category === "Underweight") return "bg-chart-4";
    return "bg-chart-1";
  };

  return (
    <Tabs defaultValue="tdee" className="w-full">
      <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-2 h-auto p-2">
        <TabsTrigger value="tdee" className="text-xs" data-testid="tab-tdee">
          <Flame className="h-3 w-3 mr-1" />
          TDEE & BMI
        </TabsTrigger>
        <TabsTrigger value="bodyfat" className="text-xs" data-testid="tab-bodyfat">
          <Scale className="h-3 w-3 mr-1" />
          Body Fat
        </TabsTrigger>
        <TabsTrigger value="macros" className="text-xs" data-testid="tab-macros">
          <Utensils className="h-3 w-3 mr-1" />
          Macros
        </TabsTrigger>
        <TabsTrigger value="protein" className="text-xs" data-testid="tab-protein">
          <Activity className="h-3 w-3 mr-1" />
          Protein
        </TabsTrigger>
        <TabsTrigger value="timing" className="text-xs" data-testid="tab-timing">
          <Clock className="h-3 w-3 mr-1" />
          Meal Timing
        </TabsTrigger>
        <TabsTrigger value="deficit" className="text-xs" data-testid="tab-deficit">
          <TrendingDown className="h-3 w-3 mr-1" />
          Deficit/Surplus
        </TabsTrigger>
        <TabsTrigger value="carbs" className="text-xs" data-testid="tab-carbs">
          <TrendingUp className="h-3 w-3 mr-1" />
          Carb Cycling
        </TabsTrigger>
        <TabsTrigger value="hydration" className="text-xs" data-testid="tab-hydration">
          <Droplet className="h-3 w-3 mr-1" />
          Hydration
        </TabsTrigger>
      </TabsList>

      {/* TDEE & BMI Calculator */}
      <TabsContent value="tdee" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              TDEE & BMI Calculator
            </CardTitle>
            <CardDescription>
              Calculate your Total Daily Energy Expenditure and Body Mass Index
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  data-testid="input-age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={(value: "male" | "female") => setGender(value)}>
                  <SelectTrigger id="gender" data-testid="select-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  data-testid="input-height"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  data-testid="input-weight"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select value={activityLevel} onValueChange={(value: ActivityLevel) => setActivityLevel(value)}>
                  <SelectTrigger id="activity" data-testid="select-activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (intense exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Fitness Goal</Label>
                <Select value={goal} onValueChange={(value: Goal) => setGoal(value)}>
                  <SelectTrigger id="goal" data-testid="select-goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain">Gain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCalculateTDEE} className="w-full" data-testid="button-calculate-tdee">
              Calculate TDEE & BMI
            </Button>
          </CardContent>
        </Card>

        {results && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Body Mass Index (BMI)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold font-display">{results.bmi}</div>
                  <Badge className={getBMIColor(results.bmiCategory)}>{results.bmiCategory}</Badge>
                  <p className="text-sm text-muted-foreground">
                    Normal range: 18.5 - 24.9
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ideal Weight Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold font-display">
                    {results.idealWeight.min.toFixed(1)} - {results.idealWeight.max.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">kg</p>
                  <p className="text-sm text-muted-foreground">
                    Based on BMI 18.5-24.9
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basal Metabolic Rate (BMR)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold font-display">{results.bmr}</div>
                  <p className="text-sm text-muted-foreground">calories/day at rest</p>
                  <p className="text-xs text-muted-foreground">
                    Calories your body burns at rest
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Daily Energy Expenditure (TDEE)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold font-display">{results.tdee}</div>
                  <p className="text-sm text-muted-foreground">calories/day</p>
                  <p className="text-xs text-muted-foreground">
                    Total calories burned daily with activity
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.goal === "lose" && <TrendingDown className="h-5 w-5 text-chart-1" />}
                  {results.goal === "maintain" && <Minus className="h-5 w-5 text-chart-3" />}
                  {results.goal === "gain" && <TrendingUp className="h-5 w-5 text-chart-2" />}
                  Daily Calorie Target
                </CardTitle>
                <CardDescription>
                  {results.goal === "lose" && "For fat loss, target 500 calories below TDEE"}
                  {results.goal === "maintain" && "For weight maintenance, match your TDEE"}
                  {results.goal === "gain" && "For muscle gain, target 300 calories above TDEE"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-accent/50 rounded-md">
                  <div className="text-5xl font-bold font-display text-primary mb-2">
                    {results.calorieTarget}
                  </div>
                  <p className="text-lg text-muted-foreground">calories per day</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    {results.goal === "lose" && "This should help you lose approximately 0.5 kg per week"}
                    {results.goal === "maintain" && "This will help you maintain your current weight"}
                    {results.goal === "gain" && "This should help you gain muscle while minimizing fat"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      {/* Body Fat Percentage Calculator */}
      <TabsContent value="bodyfat" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Body Fat Percentage Calculator
            </CardTitle>
            <CardDescription>
              Estimate body fat using U.S. Navy Method (measurements in cm)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="neck">Neck Circumference (cm)</Label>
                <Input
                  id="neck"
                  type="number"
                  placeholder="38"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  data-testid="input-neck"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waist">Waist Circumference (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  placeholder="85"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  data-testid="input-waist"
                />
              </div>
              {gender === "female" && (
                <div className="space-y-2">
                  <Label htmlFor="hip">Hip Circumference (cm)</Label>
                  <Input
                    id="hip"
                    type="number"
                    placeholder="95"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    data-testid="input-hip"
                  />
                </div>
              )}
            </div>
            <Button onClick={handleCalculateBodyFat} className="w-full" data-testid="button-calculate-bodyfat">
              Calculate Body Fat
            </Button>
          </CardContent>
        </Card>

        {bodyFatResult && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Body Fat Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold font-display">{bodyFatResult.percentage}%</div>
                  <Badge className={bodyFatResult.color}>{bodyFatResult.category}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lean Body Mass</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold font-display text-chart-3">{bodyFatResult.leanMass}</div>
                  <p className="text-sm text-muted-foreground">kg</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fat Mass</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold font-display text-chart-1">{bodyFatResult.fatMass}</div>
                  <p className="text-sm text-muted-foreground">kg</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      {/* Macro Distribution Calculator */}
      <TabsContent value="macros" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Macro Distribution Calculator
            </CardTitle>
            <CardDescription>
              Customizable protein/carb/fat ratios based on body type and goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bodytype">Body Type</Label>
              <Select value={bodyType} onValueChange={(value: BodyType) => setBodyType(value)}>
                <SelectTrigger id="bodytype" data-testid="select-bodytype">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ectomorph">Ectomorph (Naturally lean, fast metabolism)</SelectItem>
                  <SelectItem value="mesomorph">Mesomorph (Athletic build, gains muscle easily)</SelectItem>
                  <SelectItem value="endomorph">Endomorph (Larger build, slower metabolism)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCalculateMacros} className="w-full" data-testid="button-calculate-macros">
              Calculate Macro Distribution
            </Button>
          </CardContent>
        </Card>

        {macroResults && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Recommended Macro Distribution</CardTitle>
              <CardDescription>
                Optimized for {macroResults.bodyType} body type with {macroResults.goal} goal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-accent/50 rounded-md">
                  <div className="text-3xl font-bold font-display text-primary">{macroResults.calories}</div>
                  <p className="text-sm text-muted-foreground mt-1">Total Calories</p>
                </div>
                <div className="text-center p-4 bg-chart-1/10 rounded-md">
                  <div className="text-3xl font-bold font-display text-chart-1">{macroResults.protein.grams}g</div>
                  <p className="text-sm text-muted-foreground mt-1">Protein ({macroResults.protein.percent}%)</p>
                </div>
                <div className="text-center p-4 bg-chart-2/10 rounded-md">
                  <div className="text-3xl font-bold font-display text-chart-2">{macroResults.carbs.grams}g</div>
                  <p className="text-sm text-muted-foreground mt-1">Carbs ({macroResults.carbs.percent}%)</p>
                </div>
                <div className="text-center p-4 bg-chart-3/10 rounded-md">
                  <div className="text-3xl font-bold font-display text-chart-3">{macroResults.fats.grams}g</div>
                  <p className="text-sm text-muted-foreground mt-1">Fats ({macroResults.fats.percent}%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Protein Requirements Calculator */}
      <TabsContent value="protein" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Protein Requirements Calculator
            </CardTitle>
            <CardDescription>
              Based on weight, activity level, and fitness goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proteingoal">Protein Goal</Label>
              <Select value={proteinGoal} onValueChange={(value: any) => setProteinGoal(value)}>
                <SelectTrigger id="proteingoal" data-testid="select-proteingoal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Health (0.8g/kg)</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain (2.2g/kg)</SelectItem>
                  <SelectItem value="fat_loss">Fat Loss (2.0g/kg)</SelectItem>
                  <SelectItem value="athlete">Athletic Performance (1.8g/kg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCalculateProtein} className="w-full" data-testid="button-calculate-protein">
              Calculate Protein Needs
            </Button>
          </CardContent>
        </Card>

        {proteinResult && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Daily Protein Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-chart-1/10 rounded-md">
                  <div className="text-4xl font-bold font-display text-chart-1">{proteinResult.grams}g</div>
                  <p className="text-sm text-muted-foreground mt-1">Total Protein/Day</p>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-md">
                  <div className="text-4xl font-bold font-display">{proteinResult.calories}</div>
                  <p className="text-sm text-muted-foreground mt-1">Calories from Protein</p>
                </div>
                <div className="text-center p-4 bg-chart-2/10 rounded-md">
                  <div className="text-4xl font-bold font-display text-chart-2">{proteinResult.perMeal}g</div>
                  <p className="text-sm text-muted-foreground mt-1">Per Meal (4 meals)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Meal Timing Calculator */}
      <TabsContent value="timing" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Meal Timing Calculator
            </CardTitle>
            <CardDescription>
              Optimal pre/post workout nutrition timing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workouttime">Preferred Workout Time</Label>
              <Select value={workoutTime} onValueChange={setWorkoutTime}>
                <SelectTrigger id="workouttime" data-testid="select-workouttime">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (7-9 AM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (3-5 PM)</SelectItem>
                  <SelectItem value="evening">Evening (6-8 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCalculateMealTiming} className="w-full" data-testid="button-calculate-timing">
              Generate Meal Schedule
            </Button>
          </CardContent>
        </Card>

        {mealTimingResult && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Optimized Meal Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(mealTimingResult).map(([key, value], index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-accent/30 rounded-md">
                    <Clock className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-sm text-muted-foreground">{value as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Calorie Deficit/Surplus Calculator */}
      <TabsContent value="deficit" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Calorie Deficit/Surplus Calculator
            </CardTitle>
            <CardDescription>
              Calculate calorie adjustments for weight loss or gain goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use the TDEE & BMI tab to calculate your daily calorie target based on your weight goal.
              Your results will automatically show the appropriate deficit or surplus.
            </p>
            <div className="p-4 bg-accent/50 rounded-md space-y-2">
              <p className="text-sm font-semibold">Quick Reference:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Weight Loss: 500 calorie deficit = ~0.5kg/week loss</li>
                <li>• Weight Gain: 300 calorie surplus = ~0.25kg/week gain</li>
                <li>• Maintenance: Match your TDEE exactly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Carb Cycling Calculator */}
      <TabsContent value="carbs" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Carb Cycling Calculator
            </CardTitle>
            <CardDescription>
              High/low carb day planning for advanced users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workoutdays">Workout Days per Week</Label>
              <Input
                id="workoutdays"
                type="number"
                min="1"
                max="7"
                placeholder="4"
                value={workoutDays}
                onChange={(e) => setWorkoutDays(e.target.value)}
                data-testid="input-workoutdays"
              />
            </div>
            <Button onClick={handleCalculateCarbCycling} className="w-full" data-testid="button-calculate-carbs">
              Calculate Carb Cycling Plan
            </Button>
          </CardContent>
        </Card>

        {carbCycleResult && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-chart-2/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                  High Carb Days ({carbCycleResult.highDays.days} days)
                </CardTitle>
                <CardDescription>Training days - fuel your workouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-accent/50 rounded-md">
                    <div className="text-2xl font-bold font-display">{carbCycleResult.highDays.calories}</div>
                    <p className="text-xs text-muted-foreground mt-1">Calories</p>
                  </div>
                  <div className="text-center p-3 bg-chart-1/10 rounded-md">
                    <div className="text-2xl font-bold font-display text-chart-1">{carbCycleResult.highDays.protein}g</div>
                    <p className="text-xs text-muted-foreground mt-1">Protein</p>
                  </div>
                  <div className="text-center p-3 bg-chart-2/10 rounded-md">
                    <div className="text-2xl font-bold font-display text-chart-2">{carbCycleResult.highDays.carbs}g</div>
                    <p className="text-xs text-muted-foreground mt-1">Carbs</p>
                  </div>
                  <div className="text-center p-3 bg-chart-3/10 rounded-md">
                    <div className="text-2xl font-bold font-display text-chart-3">{carbCycleResult.highDays.fats}g</div>
                    <p className="text-xs text-muted-foreground mt-1">Fats</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-chart-1/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-chart-1" />
                  Low Carb Days ({carbCycleResult.lowDays.days} days)
                </CardTitle>
                <CardDescription>Rest days - promote fat burning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-accent/50 rounded-md">
                    <div className="text-2xl font-bold font-display">{carbCycleResult.lowDays.calories}</div>
                    <p className="text-xs text-muted-foreground mt-1">Calories</p>
                  </div>
                  <div className="text-center p-3 bg-chart-1/10 rounded-md">
                    <div className="text-2xl font-bold font-display text-chart-1">{carbCycleResult.lowDays.protein}g</div>
                    <p className="text-xs text-muted-foreground mt-1">Protein</p>
                  </div>
                  <div className="text-center p-3 bg-chart-2/10 rounded-md">
                    <div className="text-2xl font-bold font-display text-chart-2">{carbCycleResult.lowDays.carbs}g</div>
                    <p className="text-xs text-muted-foreground mt-1">Carbs</p>
                  </div>
                  <div className="text-center p-3 bg-chart-3/10 rounded-md">
                    <div className="text-2xl font-bold font-display text-chart-3">{carbCycleResult.lowDays.fats}g</div>
                    <p className="text-xs text-muted-foreground mt-1">Fats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      {/* Hydration Calculator */}
      <TabsContent value="hydration" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              Hydration Calculator
            </CardTitle>
            <CardDescription>
              Personalized water intake based on weight and activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hydrationactivity">Activity Level</Label>
                <Select value={hydrationActivity} onValueChange={(value: ActivityLevel) => setHydrationActivity(value)}>
                  <SelectTrigger id="hydrationactivity" data-testid="select-hydrationactivity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Light Activity</SelectItem>
                    <SelectItem value="moderate">Moderate Activity</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very_active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="climate">Climate</Label>
                <Select value={climate} onValueChange={(value: any) => setClimate(value)}>
                  <SelectTrigger id="climate" data-testid="select-climate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperate">Temperate</SelectItem>
                    <SelectItem value="hot">Hot/Humid</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCalculateHydration} className="w-full" data-testid="button-calculate-hydration">
              Calculate Hydration Needs
            </Button>
          </CardContent>
        </Card>

        {hydrationResult && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Daily Water Intake Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-500/10 rounded-md">
                  <div className="text-4xl font-bold font-display text-blue-500">{hydrationResult.liters}L</div>
                  <p className="text-sm text-muted-foreground mt-1">Liters per day</p>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-md">
                  <div className="text-4xl font-bold font-display">{hydrationResult.glasses}</div>
                  <p className="text-sm text-muted-foreground mt-1">Glasses (250ml)</p>
                </div>
                <div className="text-center p-4 bg-chart-2/10 rounded-md">
                  <div className="text-4xl font-bold font-display text-chart-2">{hydrationResult.ounces}</div>
                  <p className="text-sm text-muted-foreground mt-1">Fluid Ounces</p>
                </div>
                <div className="text-center p-4 bg-chart-3/10 rounded-md">
                  <div className="text-4xl font-bold font-display text-chart-3">{hydrationResult.perHour}</div>
                  <p className="text-sm text-muted-foreground mt-1">L/hour (awake)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
