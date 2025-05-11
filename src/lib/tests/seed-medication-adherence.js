const { connectToDb } = require('./mongodb-seed');
const { ObjectId } = require('mongodb');

async function createMedicationAdherenceRecords(userId, db) {
  // First check if there's existing data for this user
  const existingData = await db.collection('medicationAdherence')
    .findOne({ userId: new ObjectId(userId) });
  
  if (existingData) {
    console.log(`Adherence data already exists for user ${userId}, skipping...`);
    return;
  }

  const today = new Date();
  const adherenceData = [];
  
  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate realistic adherence patterns:
    // - Weekends have lower adherence (people tend to be less consistent)
    // - Random variation but generally high adherence (medical needs)
    let baseAdherence = Math.random() * 0.3 + 0.7; // Base adherence between 0.7 and 1.0
    
    // Lower adherence on weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      baseAdherence *= 0.8; // 20% lower adherence on weekends
    }
    
    // Add some random variation
    const finalAdherence = Math.min(1, Math.max(0, baseAdherence + (Math.random() * 0.2 - 0.1)));
    
    adherenceData.push({
      userId: new ObjectId(userId),
      date: date,
      adherence: Number(finalAdherence.toFixed(2)) // Round to 2 decimal places
    });
  }
  
  // Insert all records for this user
  if (adherenceData.length > 0) {
    await db.collection('medicationAdherence').insertMany(adherenceData);
  }
}

async function seedMedicationAdherence() {
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
    console.log('Starting medication adherence seeding...');
    
    // Create adherence records for each user
    for (const user of users) {
      try {
        await createMedicationAdherenceRecords(user._id, db);
        console.log(`Created adherence records for user: ${user.email}`);
      } catch (error) {
        console.error(`Error creating adherence records for user ${user.email}:`, error);
      }
    }
    
    console.log('Medication adherence seeding completed!');
  } catch (error) {
    console.error('Failed to seed medication adherence data:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

seedMedicationAdherence();
