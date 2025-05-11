const { connectToDb } = require('./mongodb-seed');
const { ObjectId } = require('mongodb');

async function createDietAnalyticsRecords(userId, db) {
  // First check if there's existing data for this user
  const existingData = await db.collection('dietAnalytics')
    .findOne({ userId: new ObjectId(userId) });
  
  if (existingData) {
    console.log(`Diet analytics data already exists for user ${userId}, skipping...`);
    return;
  }

  const today = new Date();
  const dietData = [];
  
  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate realistic diet patterns:
    // Base values with some random variation
    let protein = Math.floor(Math.random() * 30) + 40; // 40-70g protein
    let carbs = Math.floor(Math.random() * 100) + 150; // 150-250g carbs
    let fats = Math.floor(Math.random() * 30) + 40; // 40-70g fats
    let vitamins = Math.floor(Math.random() * 20) + 10; // 10-30 units
    let minerals = Math.floor(Math.random() * 20) + 10; // 10-30 units
    
    // Weekend variations (higher values due to more relaxed eating)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      carbs *= 1.2; // 20% more carbs on weekends
      fats *= 1.15; // 15% more fats on weekends
    }
    
    // Round all values to whole numbers
    dietData.push({
      userId: new ObjectId(userId),
      date: date,
      nutrients: {
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fats: Math.round(fats),
        vitamins: Math.round(vitamins),
        minerals: Math.round(minerals)
      }
    });
  }
  
  // Insert all records for this user
  if (dietData.length > 0) {
    await db.collection('dietAnalytics').insertMany(dietData);
  }
}

async function seedDietAnalytics() {
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
    console.log('Starting diet analytics seeding...');
    
    // Create diet records for each user
    for (const user of users) {
      try {
        await createDietAnalyticsRecords(user._id, db);
        console.log(`Created diet analytics records for user: ${user.email}`);
      } catch (error) {
        console.error(`Error creating diet records for user ${user.email}:`, error);
      }
    }
    
    console.log('Diet analytics seeding completed!');
  } catch (error) {
    console.error('Failed to seed diet analytics data:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

seedDietAnalytics();
