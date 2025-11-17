/**
 * Script to add test workout sessions, body metrics, and achievements
 * for testing the client dashboard
 * 
 * Run: node add-test-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const clientId = '691aa22e5a74cad79bfdf95a'; // Abhijeet Singh's ID
const clientEmail = 'abhijeet@gmail.com';

async function addTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define schemas
    const WorkoutSession = mongoose.model('WorkoutSession', new mongoose.Schema({}, { strict: false }));
    const BodyMetrics = mongoose.model('BodyMetrics', new mongoose.Schema({}, { strict: false }));
    const Achievement = mongoose.model('Achievement', new mongoose.Schema({}, { strict: false }));
    const Client = mongoose.model('Client', new mongoose.Schema({}, { strict: false }));

    console.log('📋 ADDING TEST DATA FOR: Abhijeet Singh\n');

    // 1. ADD WORKOUT SESSIONS (for streak, calories, session count)
    console.log('1️⃣ Adding Workout Sessions...');
    
    const today = new Date();
    const workoutSessions = [
      {
        clientId: clientId,
        workoutName: 'Full Body Workout',
        duration: 60,
        caloriesBurned: 450,
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 10, weight: 60 },
          { name: 'Squats', sets: 4, reps: 12, weight: 80 },
          { name: 'Deadlifts', sets: 3, reps: 8, weight: 100 }
        ],
        completedAt: new Date(today.getTime() - 0 * 24 * 60 * 60 * 1000), // Today
        notes: 'Great session, feeling strong!'
      },
      {
        clientId: clientId,
        workoutName: 'Upper Body Focus',
        duration: 45,
        caloriesBurned: 320,
        exercises: [
          { name: 'Pull-ups', sets: 4, reps: 8 },
          { name: 'Shoulder Press', sets: 3, reps: 12, weight: 40 },
          { name: 'Bicep Curls', sets: 3, reps: 15, weight: 15 }
        ],
        completedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        notes: 'Good pump!'
      },
      {
        clientId: clientId,
        workoutName: 'Leg Day',
        duration: 55,
        caloriesBurned: 400,
        exercises: [
          { name: 'Squats', sets: 5, reps: 10, weight: 90 },
          { name: 'Leg Press', sets: 4, reps: 12, weight: 150 },
          { name: 'Lunges', sets: 3, reps: 12 }
        ],
        completedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        clientId: clientId,
        workoutName: 'Cardio & Core',
        duration: 40,
        caloriesBurned: 280,
        exercises: [
          { name: 'Running', sets: 1, duration: 20 },
          { name: 'Planks', sets: 3, duration: 60 },
          { name: 'Russian Twists', sets: 3, reps: 20 }
        ],
        completedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        clientId: clientId,
        workoutName: 'Full Body Strength',
        duration: 50,
        caloriesBurned: 380,
        exercises: [
          { name: 'Deadlifts', sets: 4, reps: 8, weight: 110 },
          { name: 'Bench Press', sets: 4, reps: 10, weight: 65 },
          { name: 'Rows', sets: 3, reps: 12, weight: 50 }
        ],
        completedAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      }
    ];

    await WorkoutSession.insertMany(workoutSessions);
    console.log(`   ✅ Added ${workoutSessions.length} workout sessions`);
    console.log(`   📊 Total Calories: ${workoutSessions.reduce((sum, s) => sum + s.caloriesBurned, 0)}`);
    console.log(`   🔥 Current Streak: 5 days\n`);

    // 2. ADD BODY METRICS (for weight progress)
    console.log('2️⃣ Adding Body Metrics...');
    
    const bodyMetrics = {
      clientId: clientId,
      weight: 78,
      height: 175,
      age: 28,
      gender: 'male',
      bmi: 25.5,
      bmr: 1750,
      tdee: 2450,
      idealWeight: 75,
      targetCalories: 2200,
      activityLevel: 'moderate',
      goal: 'Build Muscle',
      recordedAt: new Date()
    };

    await BodyMetrics.create(bodyMetrics);
    
    // Update client with initial weight
    await Client.updateOne(
      { _id: clientId },
      { $set: { weight: 80 } } // Initial weight (before progress)
    );
    
    console.log('   ✅ Added body metrics');
    console.log(`   ⚖️  Current Weight: ${bodyMetrics.weight}kg`);
    console.log(`   🎯 Target Weight: ${bodyMetrics.idealWeight}kg`);
    console.log(`   📈 Progress: ${((80 - 78) / (80 - 75) * 100).toFixed(0)}%\n`);

    // 3. ADD ACHIEVEMENTS
    console.log('3️⃣ Adding Achievements...');
    
    const achievements = [
      {
        clientId: clientId,
        type: 'first_workout',
        title: 'First Workout Complete! 🎉',
        description: 'Completed your very first workout session',
        unlockedAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
        metadata: {}
      },
      {
        clientId: clientId,
        type: 'streak_week',
        title: 'Week Streak Champion 🔥',
        description: 'Maintained a 5-day workout streak',
        unlockedAt: new Date(),
        metadata: { streak: 5 }
      },
      {
        clientId: clientId,
        type: 'calories_milestone',
        title: 'Calorie Burner 💪',
        description: 'Burned over 1500 calories this week',
        unlockedAt: new Date(),
        metadata: { calories: 1830 }
      }
    ];

    await Achievement.insertMany(achievements);
    console.log(`   ✅ Added ${achievements.length} achievements\n`);

    // Summary
    console.log('━'.repeat(60));
    console.log('✨ TEST DATA ADDED SUCCESSFULLY!\n');
    console.log('📊 SUMMARY:');
    console.log(`   - ${workoutSessions.length} Workout Sessions`);
    console.log(`   - 1 Body Metrics Record`);
    console.log(`   - ${achievements.length} Achievements`);
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Login to client dashboard: abhijeet@gmail.com / test123');
    console.log('   2. Verify all dashboard features are working');
    console.log('   3. Check streak, calories, sessions, progress, achievements');
    console.log('━'.repeat(60));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addTestData();
