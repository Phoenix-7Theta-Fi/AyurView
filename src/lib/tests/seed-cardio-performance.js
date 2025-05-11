const { connectToDb } = require('./mongodb-seed');
const { ObjectId } = require('mongodb');

async function createCardioPerformanceRecords(userId, db) {
  // First check if there's existing data for this user
  const existingData = await db.collection('cardioPerformance')
    .findOne({ userId: new ObjectId(userId) });
  
  if (existingData) {
    console.log(`Cardio performance data already exists for user ${userId}, skipping...`);
    return;
  }

  const today = new Date();
  const cardioData = [];
  
  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate realistic workout patterns:
    // - Not every day has a workout (every other day pattern)
    // - Duration affects distance (correlation between the two)
    // - Weekends might have longer sessions (more free time)
    const dayOfWeek = date.getDay();
    const isWorkoutDay = i % 2 === 0; // Workout every other day

    if (isWorkoutDay) {
      // Base duration between 20-60 minutes
      let baseDuration = Math.floor(Math.random() * 40) + 20;
      
      // Longer workouts on weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseDuration = Math.min(60, baseDuration + 15); // Add up to 15 minutes on weekends
      }

      // Calculate distance based on duration with some variation
      // Assuming average pace between 6-8 min/km
      const avgPaceMinPerKm = 6 + (Math.random() * 2); // Random pace between 6-8 min/km
      let distance = Number((baseDuration / avgPaceMinPerKm).toFixed(1));
      
      // Ensure distance stays within realistic bounds (2-10 km)
      distance = Math.max(2, Math.min(10, distance));

      cardioData.push({
        userId: new ObjectId(userId),
        date: date,
        metrics: {
          duration: baseDuration,
          distance: distance
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  
  // Insert all records for this user
  if (cardioData.length > 0) {
    await db.collection('cardioPerformance').insertMany(cardioData);
  }
}

async function seedCardioPerformance() {
  let client;
  
  try {
    console.log('Connecting to database...');
    client = await connectToDb();
    const db = client.db("ayurview");
    
    // First, get all users
    const users = await db.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('No users found in database');
      process.exit(1);
    }
    
    console.log(`Found ${users.length} users`);
    console.log('Starting cardio performance seeding...');
    
    // Create cardio records for each user
    for (const user of users) {
      try {
        await createCardioPerformanceRecords(user._id, db);
        console.log(`Created cardio performance records for user: ${user.email}`);
      } catch (error) {
        console.error(`Error creating cardio records for user ${user.email}:`, error);
      }
    }
    
    console.log('Cardio performance seeding completed!');
  } catch (error) {
    console.error('Failed to seed cardio performance data:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

seedCardioPerformance();
