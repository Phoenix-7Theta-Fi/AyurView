const { connectToDb } = require('./mongodb-seed');
const { ObjectId } = require('mongodb');

async function createBiomarkerRecords(userId, db) {
  // First check if there's existing data for this user
  const existingData = await db.collection('biomarkers')
    .findOne({ userId: new ObjectId(userId) });
  
  if (existingData) {
    console.log(`Biomarker data already exists for user ${userId}, skipping...`);
    return;
  }

  // Biomarker configurations with realistic ranges
  const biomarkerConfigs = [
    { name: 'Resting Heart Rate', unit: 'bpm', optimalRange: [60, 80], targetValue: 70 },
    { name: 'Systolic BP', unit: 'mmHg', optimalRange: [110, 120], targetValue: 115 },
    { name: 'Diastolic BP', unit: 'mmHg', optimalRange: [70, 80], targetValue: 75 },
    { name: 'Fasting Glucose', unit: 'mg/dL', optimalRange: [70, 99], targetValue: 90 },
    { name: 'HbA1c', unit: '%', optimalRange: [4.0, 5.6], targetValue: 5.0 },
    { name: 'Total Cholesterol', unit: 'mg/dL', optimalRange: [0, 200], targetValue: 180 },
    { name: 'LDL Cholesterol', unit: 'mg/dL', optimalRange: [0, 100], targetValue: 80 },
    { name: 'HDL Cholesterol', unit: 'mg/dL', optimalRange: [60, 200], targetValue: 70 },
    { name: 'Triglycerides', unit: 'mg/dL', optimalRange: [0, 150], targetValue: 100 },
    { name: 'CRP (hs-CRP)', unit: 'mg/L', optimalRange: [0, 1.0], targetValue: 0.5 }
  ];

  const records = [];
  const today = new Date();
  
  // Generate 90 days of data for each biomarker
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    biomarkerConfigs.forEach(config => {
      const [min, max] = config.optimalRange;
      const range = max - min;
      
      // Generate a value that tends to be near the target but with some variation
      let baseValue = config.targetValue + (Math.random() * range * 0.4 - range * 0.2);
      
      // Add some daily variation
      baseValue += Math.random() * range * 0.1 - range * 0.05;
      
      // Ensure value stays within reasonable bounds
      const minAllowed = min * 0.5;  // Allow down to 50% below minimum
      const maxAllowed = max * 1.5;  // Allow up to 50% above maximum
      const value = Math.max(minAllowed, Math.min(maxAllowed, baseValue));

      records.push({
        userId: new ObjectId(userId),
        biomarkerName: config.name,
        value: Number(value.toFixed(2)),
        unit: config.unit,
        date: date,
        referenceRange: {
          min: config.optimalRange[0],
          max: config.optimalRange[1]
        },
        targetValue: config.targetValue,
        createdAt: date,
        updatedAt: date
      });
    });
  }

  // Insert all records for this user
  if (records.length > 0) {
    await db.collection('biomarkers').insertMany(records);
  }
}

async function seedBiomarkers() {
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
    console.log('Starting biomarker data seeding...');

    // Create biomarker records for each user
    for (const user of users) {
      try {
        await createBiomarkerRecords(user._id, db);
        console.log(`Created biomarker records for user: ${user.email}`);
      } catch (error) {
        console.error(`Error creating biomarker records for user ${user.email}:`, error);
      }
    }

    // Create indexes after seeding
    await db.collection('biomarkers').createIndex({ userId: 1, date: -1 });
    await db.collection('biomarkers').createIndex({ biomarkerName: 1 });
    
    console.log('Biomarker data seeding completed!');
  } catch (error) {
    console.error('Failed to seed biomarker data:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

seedBiomarkers();
