const { connectToDb } = require('./mongodb-seed');
const { ObjectId } = require('mongodb');

async function createWorkoutMetricRecords(userId, db) {
  // First check if there's existing data for this user
  const existingData = await db.collection('workoutMetrics')
    .findOne({ userId: new ObjectId(userId) });
  
  if (existingData) {
    console.log(`Workout metrics data already exists for user ${userId}, skipping...`);
    return;
  }

  const today = new Date();
  const metricsData = [];
  
  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate realistic workout metrics:
    // Base values represent typical fitness levels with room for improvement
    const baseMetrics = {
      strength: { base: 70, variance: 10, target: 85 },
      flexibility: { base: 65, variance: 8, target: 75 },
      vo2Max: { base: 50, variance: 12, target: 60 },
      endurance: { base: 75, variance: 15, target: 90 },
      agility: { base: 60, variance: 10, target: 80 }
    };

    // Calculate actual scores with realistic variations
    const metrics = {};
    for (const [metric, values] of Object.entries(baseMetrics)) {
      // Add random variation to base score
      const variation = (Math.random() * 2 - 1) * values.variance;
      const actualScore = Math.min(100, Math.max(0, values.base + variation));

      metrics[metric] = {
        actual: Number(actualScore.toFixed(1)),
        target: values.target
      };
    }

    // Weekend effect: slight decrease in performance due to recovery
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      for (const metric of Object.values(metrics)) {
        metric.actual *= 0.95; // 5% reduction in performance
        metric.actual = Number(metric.actual.toFixed(1));
      }
    }
    
    metricsData.push({
      userId: new ObjectId(userId),
      date: date,
      metrics: metrics,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  // Insert all records for this user
  if (metricsData.length > 0) {
    await db.collection('workoutMetrics').insertMany(metricsData);
  }
}

async function seedWorkoutMetrics() {
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
    console.log('Starting workout metrics seeding...');
    
    // Create metric records for each user
    for (const user of users) {
      try {
        await createWorkoutMetricRecords(user._id, db);
        console.log(`Created workout metric records for user: ${user.email}`);
      } catch (error) {
        console.error(`Error creating workout metric records for user ${user.email}:`, error);
      }
    }
    
    console.log('Workout metrics seeding completed!');
  } catch (error) {
    console.error('Failed to seed workout metrics data:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

seedWorkoutMetrics();
