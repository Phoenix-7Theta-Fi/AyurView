const { connectToDb } = require('./mongodb-seed');
const { ObjectId } = require('mongodb');

const PRACTICE_TYPES = [
  'mindfulness',
  'breath-work',
  'body-scan',
  'loving-kindness',
  'transcendental',
  'guided'
];

const PRACTICE_DURATIONS = [
  5,  // Quick session
  10, // Short session
  15, // Medium session
  20, // Standard session
  30, // Long session
  45  // Extended session
];

async function createMeditationPractices(userId, db) {
  // First check if there's existing data for this user
  const existingData = await db.collection('meditationPractices')
    .findOne({ userId: new ObjectId(userId) });
  
  if (existingData) {
    console.log(`Meditation data already exists for user ${userId}, skipping...`);
    return;
  }

  const today = new Date();
  const meditationData = [];
  
  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Users typically have 1-3 meditation sessions per day
    const sessionsForDay = Math.floor(Math.random() * 3) + 1;
    
    for (let session = 0; session < sessionsForDay; session++) {
      // Distribute practice times throughout the day
      const hourOffset = (session * 8) + Math.floor(Math.random() * 4); // Space sessions out
      date.setHours(6 + hourOffset); // Start from 6 AM
      date.setMinutes(Math.floor(Math.random() * 60));
      
      // Generate realistic completion patterns:
      // - Higher completion rates in morning sessions
      // - Weekend sessions more likely to be completed (more free time)
      // - Random variation but generally high completion rate
      let baseCompletion = Math.random() * 0.3 + 0.7; // Base completion between 0.7 and 1.0
      
      // Morning sessions more likely to be completed
      if (date.getHours() < 12) {
        baseCompletion *= 1.1; // 10% higher completion in mornings
      }
      
      // Weekend sessions more likely to be completed
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        baseCompletion *= 1.1; // 10% higher completion on weekends
      }
      
      const completed = Math.random() < Math.min(1, baseCompletion);
      
      // Random practice type and duration
      const practiceType = PRACTICE_TYPES[Math.floor(Math.random() * PRACTICE_TYPES.length)];
      const duration = PRACTICE_DURATIONS[Math.floor(Math.random() * PRACTICE_DURATIONS.length)];
      
      meditationData.push({
        userId: new ObjectId(userId),
        timestamp: new Date(date),
        practiceType,
        duration,
        completed
      });
    }
  }
  
  // Insert all records for this user
  if (meditationData.length > 0) {
    await db.collection('meditationPractices').insertMany(meditationData);
  }
}

async function seedMeditationPractices() {
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
    console.log('Starting meditation practices seeding...');
    
    // Create meditation records for each user
    for (const user of users) {
      try {
        await createMeditationPractices(user._id, db);
        console.log(`Created meditation records for user: ${user.email}`);
      } catch (error) {
        console.error(`Error creating meditation records for user ${user.email}:`, error);
      }
    }
    
    console.log('Meditation practices seeding completed!');
  } catch (error) {
    console.error('Failed to seed meditation practices data:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

seedMeditationPractices();
