const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}

const uri = process.env.MONGODB_URI;

async function seedYogaPractices() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('ayurview');
    const collection = db.collection('yogaPractices');

    // Clear existing data
    await collection.deleteMany({});
    console.log('Cleared existing yoga practices data.');

    // Generate 30 days of yoga practice data for each user
    const users = await db.collection('users').find().toArray();
    let yogaData = [];

    const yogaTypes = [
      {
        name: 'Hatha Yoga',
        practices: ['Posture Alignment', 'Breath Control'],
        subPractices: {
          'Posture Alignment': {
            'Balance Practice': ['Standing Poses', 'Core Strength'],
            'Spine Health': ['Back Bends', 'Twists']
          },
          'Breath Control': {
            'Pranayama': ['Meditation', 'Energy Work']
          }
        }
      },
      {
        name: 'Vinyasa Flow',
        practices: ['Dynamic Flow'],
        subPractices: {
          'Dynamic Flow': {
            'Power Yoga': ['Strength Flow', 'Core Flow'],
            'Endurance': ['Flow Sequences', 'Transitions']
          }
        }
      },
      {
        name: 'Yin Yoga',
        practices: ['Deep Stretch'],
        subPractices: {
          'Deep Stretch': {
            'Joint Health': ['Hip Opening', 'Shoulder Release'],
            'Fascia Release': ['Meridian Work', 'Tissue Release']
          }
        }
      },
      {
        name: 'Ashtanga',
        practices: ['Traditional Series'],
        subPractices: {
          'Traditional Series': {
            'Primary Series': ['Sun Salutations', 'Standing Sequence'],
            'Intermediate': ['Backbends', 'Arm Balances']
          }
        }
      },
      {
        name: 'Kundalini',
        practices: ['Energy Work'],
        subPractices: {
          'Energy Work': {
            'Chakra Focus': ['Lower Chakras', 'Upper Chakras'],
            'Kriya Practice': ['Breathing', 'Movement']
          }
        }
      }
    ];

    for (const user of users) {
      // Generate data for past 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate 1-3 practices per day
        const practicesCount = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < practicesCount; j++) {
          const yogaType = yogaTypes[Math.floor(Math.random() * yogaTypes.length)];
          const practice = yogaType.practices[Math.floor(Math.random() * yogaType.practices.length)];
          const subPracticeObj = yogaType.subPractices[practice];
          const subPracticeTypes = Object.keys(subPracticeObj);
          const subPracticeType = subPracticeTypes[Math.floor(Math.random() * subPracticeTypes.length)];
          const elements = subPracticeObj[subPracticeType];
          const element = elements[Math.floor(Math.random() * elements.length)];
          
          yogaData.push({
            userId: user._id,
            timestamp: date,
            type: yogaType.name,
            practice: practice,
            subPractice: subPracticeType,
            element: element,
            duration: Math.floor(Math.random() * 31) + 30, // 30-60 minutes
            difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
            completed: Math.random() > 0.1, // 90% completion rate
          });
        }
      }
    }

    if (yogaData.length > 0) {
      await collection.insertMany(yogaData);
      console.log(`Seeded ${yogaData.length} yoga practice records`);
    }

  } catch (error) {
    console.error('Error seeding yoga practices:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedYogaPractices().catch(console.error);
