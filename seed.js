require("dotenv").config();
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URI;
const client = new MongoClient(url);

async function seedDatabase() {
  try {
    await client.connect();
    const db = client.db();

    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("workouts").deleteMany({});

    // Create test user
    const testPassword = await bcrypt.hash("password123", 10);
    const userResult = await db.collection("users").insertOne({
      email: "test@example.com",
      password: testPassword,
      createdAt: new Date()
    });

    const userId = userResult.insertedId.toString();

    // Create sample workouts
    const workouts = [
      { exercise: "Running", duration: 30, calories: 300, date: "2024-02-10", intensity: "High", muscleGroup: "Legs", notes: "Morning jog at the park" },
      { exercise: "Bench Press", duration: 45, calories: 350, date: "2024-02-11", intensity: "High", muscleGroup: "Chest", notes: "3 sets of 8 reps" },
      { exercise: "Swimming", duration: 60, calories: 500, date: "2024-02-11", intensity: "Medium", muscleGroup: "Full Body", notes: "Freestyle and backstroke" },
      { exercise: "Cycling", duration: 40, calories: 400, date: "2024-02-12", intensity: "Medium", muscleGroup: "Legs", notes: "Mountain biking trail" },
      { exercise: "Yoga", duration: 50, calories: 200, date: "2024-02-12", intensity: "Low", muscleGroup: "Full Body", notes: "Relaxing evening session" },
      { exercise: "Squats", duration: 35, calories: 320, date: "2024-02-13", intensity: "High", muscleGroup: "Legs", notes: "4 sets of 10 reps" },
      { exercise: "Pull-ups", duration: 25, calories: 250, date: "2024-02-13", intensity: "High", muscleGroup: "Back", notes: "5 sets max reps" },
      { exercise: "Jump Rope", duration: 20, calories: 280, date: "2024-02-13", intensity: "High", muscleGroup: "Full Body", notes: "Cardio warm-up" },
      { exercise: "Deadlift", duration: 40, calories: 400, date: "2024-02-14", intensity: "High", muscleGroup: "Back", notes: "5 sets of 5 reps" },
      { exercise: "Pilates", duration: 45, calories: 240, date: "2024-02-14", intensity: "Medium", muscleGroup: "Core", notes: "Core strengthening" },
      { exercise: "Rowing", duration: 30, calories: 350, date: "2024-02-14", intensity: "Medium", muscleGroup: "Full Body", notes: "Indoor rowing machine" },
      { exercise: "Boxing", duration: 35, calories: 420, date: "2024-02-15", intensity: "High", muscleGroup: "Full Body", notes: "Heavy bag training" },
      { exercise: "Walking", duration: 60, calories: 200, date: "2024-02-15", intensity: "Low", muscleGroup: "Legs", notes: "Park walk" },
      { exercise: "Dumbbell Curls", duration: 30, calories: 220, date: "2024-02-15", intensity: "Medium", muscleGroup: "Arms", notes: "3 sets of 12 reps" },
      { exercise: "Planks", duration: 15, calories: 150, date: "2024-02-16", intensity: "High", muscleGroup: "Core", notes: "4 sets of 1 minute" },
      { exercise: "Elliptical", duration: 35, calories: 380, date: "2024-02-16", intensity: "Medium", muscleGroup: "Legs", notes: "Steady cardio" },
      { exercise: "Kettlebell Swings", duration: 25, calories: 310, date: "2024-02-16", intensity: "High", muscleGroup: "Full Body", notes: "5 sets of 20 reps" },
      { exercise: "Lat Pulldowns", duration: 30, calories: 240, date: "2024-02-17", intensity: "Medium", muscleGroup: "Back", notes: "3 sets of 10 reps" },
      { exercise: "Incline Treadmill", duration: 25, calories: 320, date: "2024-02-17", intensity: "High", muscleGroup: "Legs", notes: "5% incline" },
      { exercise: "Chest Flyes", duration: 25, calories: 210, date: "2024-02-17", intensity: "Medium", muscleGroup: "Chest", notes: "Cable machine" },
      { exercise: "Hiking", duration: 90, calories: 600, date: "2024-02-18", intensity: "Medium", muscleGroup: "Full Body", notes: "Mountain trail" },
      { exercise: "Tricep Dips", duration: 20, calories: 240, date: "2024-02-18", intensity: "High", muscleGroup: "Arms", notes: "4 sets of 12 reps" }
    ];

    // Add userId to all workouts
    const workoutsWithUser = workouts.map(w => ({
      ...w,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await db.collection("workouts").insertMany(workoutsWithUser);

    console.log("✓ Database seeded successfully!");
    console.log(`✓ Created test user: test@example.com / password123`);
    console.log(`✓ Added ${workouts.length} sample workouts`);

  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.close();
  }
}

seedDatabase();
