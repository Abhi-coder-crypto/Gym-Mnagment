import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DietPlan } from '../models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const dietTemplates = [
  {
    name: "Low Carb Weight Loss Plan",
    description: "Effective low-carb diet focusing on protein and healthy fats for sustainable weight loss. Ideal for those looking to reduce body fat while maintaining muscle mass.",
    category: "Low Carb",
    targetCalories: 1800,
    protein: 135,
    carbs: 90,
    fats: 100,
    isTemplate: true,
    assignedCount: 0,
    waterIntakeGoal: 3000,
    meals: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        items: [
          { name: "Scrambled eggs with spinach and cheese", calories: 350, protein: 25, carbs: 5, fats: 25 },
          { name: "Avocado (half)", calories: 120, protein: 1.5, carbs: 6, fats: 11 },
          { name: "Black coffee", calories: 5, protein: 0, carbs: 1, fats: 0 }
        ]
      },
      {
        name: "Mid-Morning Snack",
        time: "11:00 AM",
        items: [
          { name: "Almonds (1/4 cup)", calories: 170, protein: 6, carbs: 6, fats: 15 },
          { name: "String cheese", calories: 80, protein: 6, carbs: 1, fats: 6 }
        ]
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        items: [
          { name: "Grilled chicken breast (6oz)", calories: 280, protein: 52, carbs: 0, fats: 6 },
          { name: "Mixed green salad with olive oil", calories: 150, protein: 2, carbs: 8, fats: 12 },
          { name: "Cucumber and tomato", calories: 25, protein: 1, carbs: 5, fats: 0 }
        ]
      },
      {
        name: "Afternoon Snack",
        time: "4:00 PM",
        items: [
          { name: "Greek yogurt (plain)", calories: 130, protein: 15, carbs: 8, fats: 5 },
          { name: "Handful of walnuts", calories: 100, protein: 2, carbs: 2, fats: 10 }
        ]
      },
      {
        name: "Dinner",
        time: "7:00 PM",
        items: [
          { name: "Grilled salmon (6oz)", calories: 340, protein: 40, carbs: 0, fats: 20 },
          { name: "Roasted broccoli with garlic", calories: 80, protein: 4, carbs: 10, fats: 3 },
          { name: "Cauliflower rice", calories: 50, protein: 2, carbs: 10, fats: 1 }
        ]
      }
    ],
    allergens: ["eggs", "dairy", "tree nuts", "fish"],
    supplements: [
      { name: "Multivitamin", dosage: "1 tablet", timing: "Morning with breakfast" },
      { name: "Omega-3 Fish Oil", dosage: "1000mg", timing: "Evening with dinner" }
    ]
  },
  {
    name: "High Protein Muscle Building Plan",
    description: "High protein diet designed for muscle growth and strength training. Optimized for athletes and bodybuilders seeking lean muscle gains.",
    category: "High Protein",
    targetCalories: 2800,
    protein: 210,
    carbs: 280,
    fats: 93,
    isTemplate: true,
    assignedCount: 0,
    waterIntakeGoal: 4000,
    meals: [
      {
        name: "Breakfast",
        time: "7:00 AM",
        items: [
          { name: "Oatmeal with protein powder", calories: 400, protein: 35, carbs: 50, fats: 8 },
          { name: "Egg whites (6)", calories: 100, protein: 24, carbs: 2, fats: 0 },
          { name: "Banana", calories: 105, protein: 1, carbs: 27, fats: 0 }
        ]
      },
      {
        name: "Mid-Morning Snack",
        time: "10:00 AM",
        items: [
          { name: "Protein shake with milk", calories: 280, protein: 30, carbs: 20, fats: 8 },
          { name: "Apple with almond butter", calories: 200, protein: 4, carbs: 25, fats: 10 }
        ]
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        items: [
          { name: "Grilled chicken breast (8oz)", calories: 370, protein: 70, carbs: 0, fats: 8 },
          { name: "Brown rice (1 cup)", calories: 215, protein: 5, carbs: 45, fats: 2 },
          { name: "Steamed vegetables", calories: 80, protein: 3, carbs: 15, fats: 1 }
        ]
      },
      {
        name: "Pre-Workout Snack",
        time: "3:30 PM",
        items: [
          { name: "Greek yogurt", calories: 130, protein: 15, carbs: 8, fats: 5 },
          { name: "Granola", calories: 150, protein: 4, carbs: 22, fats: 5 }
        ]
      },
      {
        name: "Post-Workout Shake",
        time: "5:30 PM",
        items: [
          { name: "Whey protein shake", calories: 200, protein: 40, carbs: 10, fats: 2 },
          { name: "Dextrose powder", calories: 100, protein: 0, carbs: 25, fats: 0 }
        ]
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        items: [
          { name: "Lean beef (8oz)", calories: 450, protein: 60, carbs: 0, fats: 22 },
          { name: "Sweet potato (large)", calories: 180, protein: 4, carbs: 41, fats: 0 },
          { name: "Asparagus", calories: 40, protein: 4, carbs: 8, fats: 0 }
        ]
      },
      {
        name: "Before Bed",
        time: "10:30 PM",
        items: [
          { name: "Casein protein shake", calories: 120, protein: 24, carbs: 3, fats: 1 }
        ]
      }
    ],
    allergens: ["dairy", "tree nuts"],
    supplements: [
      { name: "Whey Protein", dosage: "2 scoops", timing: "Post-workout" },
      { name: "Creatine Monohydrate", dosage: "5g", timing: "Post-workout" },
      { name: "BCAA", dosage: "10g", timing: "During workout" }
    ]
  },
  {
    name: "Ketogenic Fat Loss Plan",
    description: "Ultra low-carb ketogenic diet for rapid fat loss and metabolic health. Designed to put your body into ketosis for efficient fat burning.",
    category: "Ketogenic",
    targetCalories: 2000,
    protein: 125,
    carbs: 25,
    fats: 155,
    isTemplate: true,
    assignedCount: 0,
    waterIntakeGoal: 3500,
    meals: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        items: [
          { name: "Bulletproof coffee (coffee, butter, MCT oil)", calories: 450, protein: 1, carbs: 0, fats: 51 },
          { name: "Bacon (4 strips)", calories: 180, protein: 12, carbs: 0, fats: 14 }
        ]
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        items: [
          { name: "Ribeye steak (6oz)", calories: 460, protein: 42, carbs: 0, fats: 32 },
          { name: "Butter sautéed spinach", calories: 120, protein: 3, carbs: 4, fats: 10 },
          { name: "Caesar salad with parmesan", calories: 250, protein: 8, carbs: 5, fats: 22 }
        ]
      },
      {
        name: "Afternoon Snack",
        time: "4:00 PM",
        items: [
          { name: "Macadamia nuts (1/4 cup)", calories: 240, protein: 3, carbs: 4, fats: 25 },
          { name: "String cheese", calories: 80, protein: 6, carbs: 1, fats: 6 }
        ]
      },
      {
        name: "Dinner",
        time: "7:30 PM",
        items: [
          { name: "Grilled salmon (6oz)", calories: 340, protein: 40, carbs: 0, fats: 20 },
          { name: "Avocado (whole)", calories: 240, protein: 3, carbs: 12, fats: 22 },
          { name: "Zucchini noodles with butter", calories: 140, protein: 2, carbs: 7, fats: 12 }
        ]
      }
    ],
    allergens: ["dairy", "fish", "tree nuts"],
    supplements: [
      { name: "Electrolytes", dosage: "1 serving", timing: "Throughout the day" },
      { name: "MCT Oil", dosage: "1 tbsp", timing: "Morning coffee" },
      { name: "Magnesium", dosage: "400mg", timing: "Before bed" }
    ]
  },
  {
    name: "Complete Vegan Nutrition Plan",
    description: "Well-balanced plant-based diet providing all essential nutrients. Perfect for vegans seeking optimal health and fitness results.",
    category: "Vegan",
    targetCalories: 2200,
    protein: 110,
    carbs: 275,
    fats: 73,
    isTemplate: true,
    assignedCount: 0,
    waterIntakeGoal: 3000,
    meals: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        items: [
          { name: "Oatmeal with chia seeds and berries", calories: 350, protein: 12, carbs: 58, fats: 10 },
          { name: "Almond milk smoothie with banana", calories: 200, protein: 8, carbs: 35, fats: 4 },
          { name: "Peanut butter (2 tbsp)", calories: 190, protein: 8, carbs: 7, fats: 16 }
        ]
      },
      {
        name: "Mid-Morning Snack",
        time: "11:00 AM",
        items: [
          { name: "Apple with almond butter", calories: 200, protein: 4, carbs: 25, fats: 10 },
          { name: "Handful of walnuts", calories: 185, protein: 4, carbs: 4, fats: 18 }
        ]
      },
      {
        name: "Lunch",
        time: "1:30 PM",
        items: [
          { name: "Chickpea curry with quinoa", calories: 450, protein: 18, carbs: 65, fats: 12 },
          { name: "Mixed vegetable salad", calories: 100, protein: 3, carbs: 15, fats: 4 },
          { name: "Whole wheat pita", calories: 170, protein: 6, carbs: 35, fats: 2 }
        ]
      },
      {
        name: "Afternoon Snack",
        time: "4:30 PM",
        items: [
          { name: "Hummus with carrots and celery", calories: 180, protein: 6, carbs: 20, fats: 8 },
          { name: "Vegan protein bar", calories: 200, protein: 15, carbs: 22, fats: 7 }
        ]
      },
      {
        name: "Dinner",
        time: "7:30 PM",
        items: [
          { name: "Tofu stir-fry with vegetables", calories: 320, protein: 22, carbs: 25, fats: 16 },
          { name: "Brown rice (1 cup)", calories: 215, protein: 5, carbs: 45, fats: 2 },
          { name: "Edamame", calories: 120, protein: 11, carbs: 10, fats: 5 }
        ]
      },
      {
        name: "Evening Snack",
        time: "9:00 PM",
        items: [
          { name: "Vegan protein shake", calories: 160, protein: 20, carbs: 15, fats: 3 }
        ]
      }
    ],
    allergens: ["soy", "tree nuts", "peanuts", "gluten"],
    supplements: [
      { name: "Vitamin B12", dosage: "1000mcg", timing: "Morning" },
      { name: "Vitamin D3 (vegan)", dosage: "2000 IU", timing: "Morning" },
      { name: "Omega-3 (algae-based)", dosage: "500mg", timing: "Evening" }
    ]
  },
  {
    name: "Balanced Nutrition Plan",
    description: "Well-rounded diet with balanced macronutrients for overall health and wellness. Suitable for maintaining healthy weight and lifestyle.",
    category: "Balanced",
    targetCalories: 2200,
    protein: 138,
    carbs: 248,
    fats: 73,
    isTemplate: true,
    assignedCount: 0,
    waterIntakeGoal: 2500,
    meals: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        items: [
          { name: "Whole grain toast with avocado", calories: 280, protein: 8, carbs: 35, fats: 14 },
          { name: "Scrambled eggs (2)", calories: 140, protein: 12, carbs: 2, fats: 10 },
          { name: "Orange juice", calories: 110, protein: 2, carbs: 26, fats: 0 }
        ]
      },
      {
        name: "Mid-Morning Snack",
        time: "10:30 AM",
        items: [
          { name: "Greek yogurt with honey", calories: 180, protein: 15, carbs: 20, fats: 5 },
          { name: "Mixed berries", calories: 70, protein: 1, carbs: 17, fats: 0 }
        ]
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        items: [
          { name: "Grilled chicken sandwich on whole wheat", calories: 420, protein: 35, carbs: 45, fats: 12 },
          { name: "Side salad with vinaigrette", calories: 120, protein: 2, carbs: 10, fats: 8 },
          { name: "Apple", calories: 95, protein: 0, carbs: 25, fats: 0 }
        ]
      },
      {
        name: "Afternoon Snack",
        time: "4:00 PM",
        items: [
          { name: "Handful of almonds", calories: 170, protein: 6, carbs: 6, fats: 15 },
          { name: "Banana", calories: 105, protein: 1, carbs: 27, fats: 0 }
        ]
      },
      {
        name: "Dinner",
        time: "7:30 PM",
        items: [
          { name: "Baked cod (6oz)", calories: 180, protein: 38, carbs: 0, fats: 2 },
          { name: "Quinoa pilaf (1 cup)", calories: 220, protein: 8, carbs: 39, fats: 4 },
          { name: "Roasted vegetables", calories: 110, protein: 3, carbs: 18, fats: 4 }
        ]
      },
      {
        name: "Evening Snack",
        time: "9:00 PM",
        items: [
          { name: "Cottage cheese", calories: 110, protein: 14, carbs: 6, fats: 3 }
        ]
      }
    ],
    allergens: ["eggs", "dairy", "gluten", "fish", "tree nuts"],
    supplements: [
      { name: "Multivitamin", dosage: "1 tablet", timing: "Morning" },
      { name: "Omega-3", dosage: "1000mg", timing: "Evening" }
    ]
  },
  {
    name: "Paleo Performance Plan",
    description: "Ancestral eating pattern focusing on whole foods, lean proteins, and natural fats. Eliminates grains, dairy, and processed foods for optimal health.",
    category: "Paleo",
    targetCalories: 2300,
    protein: 173,
    carbs: 173,
    fats: 102,
    isTemplate: true,
    assignedCount: 0,
    waterIntakeGoal: 3000,
    meals: [
      {
        name: "Breakfast",
        time: "7:30 AM",
        items: [
          { name: "Sweet potato hash with eggs", calories: 380, protein: 18, carbs: 35, fats: 20 },
          { name: "Sausage (2 links)", calories: 220, protein: 14, carbs: 2, fats: 18 },
          { name: "Mixed berries", calories: 70, protein: 1, carbs: 17, fats: 0 }
        ]
      },
      {
        name: "Mid-Morning Snack",
        time: "10:30 AM",
        items: [
          { name: "Hard-boiled eggs (2)", calories: 140, protein: 12, carbs: 2, fats: 10 },
          { name: "Carrots with guacamole", calories: 150, protein: 2, carbs: 12, fats: 11 }
        ]
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        items: [
          { name: "Grass-fed burger patty (6oz)", calories: 340, protein: 42, carbs: 0, fats: 18 },
          { name: "Sweet potato fries", calories: 180, protein: 2, carbs: 35, fats: 4 },
          { name: "Coleslaw (no dairy)", calories: 100, protein: 1, carbs: 12, fats: 5 }
        ]
      },
      {
        name: "Afternoon Snack",
        time: "4:00 PM",
        items: [
          { name: "Apple with almond butter", calories: 200, protein: 4, carbs: 25, fats: 10 },
          { name: "Beef jerky", calories: 80, protein: 12, carbs: 3, fats: 2 }
        ]
      },
      {
        name: "Dinner",
        time: "7:30 PM",
        items: [
          { name: "Grilled wild salmon (6oz)", calories: 340, protein: 40, carbs: 0, fats: 20 },
          { name: "Roasted butternut squash", calories: 100, protein: 2, carbs: 22, fats: 1 },
          { name: "Sautéed kale with garlic", calories: 80, protein: 3, carbs: 8, fats: 4 }
        ]
      },
      {
        name: "Evening Snack",
        time: "9:00 PM",
        items: [
          { name: "Mixed nuts", calories: 180, protein: 5, carbs: 6, fats: 16 }
        ]
      }
    ],
    allergens: ["eggs", "tree nuts", "fish"],
    supplements: [
      { name: "Vitamin D", dosage: "2000 IU", timing: "Morning" },
      { name: "Fish Oil", dosage: "2000mg", timing: "Evening" },
      { name: "Magnesium", dosage: "400mg", timing: "Before bed" }
    ]
  },
  {
    name: "Mediterranean Heart-Healthy Plan",
    description: "Heart-healthy Mediterranean diet rich in olive oil, fish, vegetables, and whole grains. Proven to reduce cardiovascular disease risk and promote longevity.",
    category: "Mediterranean",
    targetCalories: 2100,
    protein: 105,
    carbs: 245,
    fats: 84,
    isTemplate: true,
    assignedCount: 0,
    waterIntakeGoal: 2500,
    meals: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        items: [
          { name: "Greek yogurt with honey and walnuts", calories: 280, protein: 18, carbs: 25, fats: 14 },
          { name: "Whole grain toast with olive oil", calories: 180, protein: 5, carbs: 25, fats: 7 },
          { name: "Fresh figs", calories: 75, protein: 1, carbs: 19, fats: 0 }
        ]
      },
      {
        name: "Mid-Morning Snack",
        time: "10:30 AM",
        items: [
          { name: "Hummus with whole wheat pita", calories: 220, protein: 8, carbs: 32, fats: 7 },
          { name: "Cherry tomatoes", calories: 30, protein: 1, carbs: 7, fats: 0 }
        ]
      },
      {
        name: "Lunch",
        time: "1:30 PM",
        items: [
          { name: "Grilled sea bass (6oz)", calories: 220, protein: 40, carbs: 0, fats: 6 },
          { name: "Quinoa tabbouleh salad", calories: 200, protein: 6, carbs: 32, fats: 6 },
          { name: "Greek salad with feta", calories: 180, protein: 6, carbs: 10, fats: 13 }
        ]
      },
      {
        name: "Afternoon Snack",
        time: "4:30 PM",
        items: [
          { name: "Olives and cheese", calories: 150, protein: 6, carbs: 3, fats: 12 },
          { name: "Handful of almonds", calories: 170, protein: 6, carbs: 6, fats: 15 }
        ]
      },
      {
        name: "Dinner",
        time: "7:30 PM",
        items: [
          { name: "Chicken souvlaki (6oz)", calories: 280, protein: 45, carbs: 5, fats: 9 },
          { name: "Whole wheat couscous", calories: 175, protein: 6, carbs: 36, fats: 0 },
          { name: "Roasted eggplant and zucchini", calories: 120, protein: 3, carbs: 18, fats: 5 }
        ]
      },
      {
        name: "Evening Snack",
        time: "9:00 PM",
        items: [
          { name: "Fresh fruit salad", calories: 100, protein: 1, carbs: 25, fats: 0 }
        ]
      }
    ],
    allergens: ["dairy", "fish", "tree nuts", "gluten"],
    supplements: [
      { name: "Extra Virgin Olive Oil", dosage: "2 tbsp", timing: "With meals" },
      { name: "Omega-3 Fish Oil", dosage: "1000mg", timing: "Evening" }
    ]
  }
];

async function populateDietTemplates() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if templates already exist
    const existingCount = await DietPlan.countDocuments({ isTemplate: true });
    console.log(`📊 Found ${existingCount} existing diet templates`);

    // Clear existing templates
    if (existingCount > 0) {
      console.log('🗑️  Removing existing templates...');
      await DietPlan.deleteMany({ isTemplate: true });
      console.log('✅ Existing templates removed');
    }

    console.log('📝 Creating 7 new diet plan templates...');
    
    for (const template of dietTemplates) {
      const created = await DietPlan.create(template);
      console.log(`✅ Created: ${created.name} (${created.category})`);
    }

    console.log('\n🎉 Successfully created all 7 diet plan templates!');
    console.log('\n📋 Summary:');
    dietTemplates.forEach((t, i) => {
      console.log(`${i + 1}. ${t.category}: ${t.name}`);
      console.log(`   Calories: ${t.targetCalories} | Protein: ${t.protein}g | Carbs: ${t.carbs}g | Fats: ${t.fats}g`);
    });

    console.log('\n✅ Templates are now ready to be assigned to clients from the trainer dashboard!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

populateDietTemplates();
