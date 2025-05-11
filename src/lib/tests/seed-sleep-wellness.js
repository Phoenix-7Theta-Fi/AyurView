const { connectToDb } = require('./mongodb-seed');
const { ObjectId } = require('mongodb');
const { subDays } = require('date-fns');

async function createSleepWellnessRecords(userId, db) {
  // First check if there's existing data for this user
  const existingData = await db.collection('sleepWellness')
    .findOne({ userId: new ObjectId(userId) });
  
  if (existingData) {
    console.log(`Sleep wellness data already exists for user ${userId}, skipping...`);
    return;
  }

  const today = new Date();
  const sleepWellnessData = [];

  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    
    // Generate realistic sleep metrics
    const totalSleep = Math.floor(Math.random() * 3) + 6; // 6-8 hours total
    const rem = parseFloat((totalSleep * (Math.random() * 0.15 + 0.15)).toFixed(1)); // 15-30%
    const deep = parseFloat((totalSleep * (Math.random() * 0.1 + 0.1)).toFixed(1)); // 10-20%
    const light = parseFloat((totalSleep - rem - deep - (Math.random() * 0.5)).toFixed(1));
    const awake = parseFloat((totalSleep * (Math.random() * 0.05)).toFixed(1));

    // Generate correlated mental wellness metrics
    // Lower quality sleep tends to correlate with higher stress and lower mood
    const sleepQuality = (rem + deep) / totalSleep; // Simple sleep quality metric
    const baseStressLevel = 10 - (sleepQuality * 10); // Inverse correlation with sleep quality
    const baseMoodScore = sleepQuality * 10; // Direct correlation with sleep quality

    // Add some randomness while maintaining correlation
    const stressLevel = Math.min(10, Math.max(1, Math.round(baseStressLevel + (Math.random() * 2 - 1))));
    const moodScore = Math.min(10, Math.max(1, Math.round(baseMoodScore + (Math.random() * 2 - 1))));

    sleepWellnessData.push({
      userId: new ObjectId(userId),
      date: date,
      sleepMetrics: {
        rem: Math.max(0, rem),
        deep: Math.max(0, deep),
        light: Math.max(0, light),
        awake: Math.max(0, awake),
        totalDuration: totalSleep
      },
      mentalWellness: {
        stressLevel,
        moodScore
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  // Insert all records for this user
  if (sleepWellnessData.length > 0) {
    await db.collection('sleepWellness').insertMany(sleepWellnessData);
  }
}

async function seedSleepWellness() {
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
    console.log('Starting sleep wellness seeding...');
    
    // Create sleep wellness records for each user
    for (const user of users) {
      try {
        await createSleepWellnessRecords(user._id, db);
        console.log(`Created sleep wellness records for user: ${user.email}`);
      } catch (error) {
        console.error(`Error creating sleep wellness records for user ${user.email}:`, error);
      }
    }
    
    console.log('Sleep wellness seeding completed!');
  } catch (error) {
    console.error('Failed to seed sleep wellness data:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

seedSleepWellness();
