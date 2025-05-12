const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}

const uri = process.env.MONGODB_URI;

// Activity templates categorized by dosha type and health focus
const activityTemplates = {
  vata: {
    morning: [
      {
        title: "Warm Oil Self-Massage",
        category: "Wellness",
        description: "Gentle self-massage with warm sesame oil",
        details: "Perform abhyanga with warm sesame oil, focusing on joints and dry areas. Use gentle, steady strokes to calm Vata.",
        icon: 'Heart',
        duration: 20
      },
      {
        title: "Grounding Yoga Practice",
        category: "Wellness",
        description: "Slow, gentle yoga focusing on stability",
        details: "Practice grounding asanas like Tadasana, Vrksasana, and Malasana. Hold poses longer to reduce Vata.",
        icon: 'Sprout',
        duration: 30
      }
    ],
    meals: [
      {
        title: "Warm Oatmeal with Dates",
        category: "Nutrition",
        description: "Nourishing, grounding breakfast",
        details: "Cook steel-cut oats with warming spices (cinnamon, cardamom), add chopped dates and ghee.",
        icon: 'Apple',
        duration: 30
      }
    ]
  },
  pitta: {
    morning: [
      {
        title: "Cool Rose Water Face Spray",
        category: "Wellness",
        description: "Refreshing morning ritual",
        details: "Spray face and neck with cooling rose water, follow with coconut oil moisturizer.",
        icon: 'Droplets',
        duration: 10
      },
      {
        title: "Moon Salutation Sequence",
        category: "Wellness",
        description: "Cooling yoga practice",
        details: "Practice Chandra Namaskar with emphasis on forward bends and twists to cool Pitta.",
        icon: 'Moon',
        duration: 25
      }
    ],
    meals: [
      {
        title: "Cooling Fresh Fruit Bowl",
        category: "Nutrition",
        description: "Light, sweet breakfast",
        details: "Mix fresh sweet fruits like mangoes, pomegranate, and sweet pears. Add mint leaves for extra cooling.",
        icon: 'Apple',
        duration: 20
      }
    ]
  },
  kapha: {
    morning: [
      {
        title: "Dry Brushing Routine",
        category: "Wellness",
        description: "Stimulating skin brushing",
        details: "Use a natural bristle brush to perform garshana (dry brushing), moving towards the heart.",
        icon: 'Wind',
        duration: 15
      },
      {
        title: "Dynamic Sun Salutations",
        category: "Wellness",
        description: "Energetic yoga practice",
        details: "Practice 12 rounds of Surya Namaskar A at a brisk pace to stimulate circulation.",
        icon: 'Sun',
        duration: 35
      }
    ],
    meals: [
      {
        title: "Light Ginger-Spiced Quinoa",
        category: "Nutrition",
        description: "Light, warming breakfast",
        details: "Cook quinoa with ginger, black pepper, and turmeric. Add steamed vegetables.",
        icon: 'Apple',
        duration: 25
      }
    ]
  }
};

// Health condition specific activities
const healthActivities = {
  stress: [
    {
      title: "Stress-Relief Breathing",
      category: "Wellness",
      description: "Calming breath practice",
      details: "Practice 10 minutes of Nadi Shodhana (alternate nostril breathing) for stress relief.",
      icon: 'Wind',
      duration: 15
    }
  ],
  digestion: [
    {
      title: "Digestive Tea Break",
      category: "Wellness",
      description: "Herbal tea for digestion",
      details: "Prepare and sip CCF tea (cumin, coriander, fennel) between meals.",
      icon: 'Cup',
      duration: 15
    }
  ],
  sleep: [
    {
      title: "Evening Wind-Down",
      category: "Lifestyle",
      description: "Prepare for restful sleep",
      details: "Dim lights, practice gentle stretches, and enjoy calming chamomile tea.",
      icon: 'Moon',
      duration: 30
    }
  ]
};

// Helper function to generate a time string based on hour and minute
function generateTimeString(hour, minute) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
}

// Function to generate a personalized daily schedule
function generatePersonalizedSchedule(userId, doshaType, healthConditions) {
  let currentHour = 6; // Start day at 6 AM
  let currentMinute = 0;
  const schedule = [];
  
  // Helper to add activity and advance time
  const addActivity = (activity) => {
    schedule.push({
      id: new ObjectId().toString(),
      userId: userId,
      time: generateTimeString(currentHour, currentMinute),
      ...activity,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Advance time based on activity duration
    currentMinute += activity.duration;
    while (currentMinute >= 60) {
      currentHour++;
      currentMinute -= 60;
    }
  };

  // Add morning routine based on dosha
  const doshaActivities = activityTemplates[doshaType];
  doshaActivities.morning.forEach(activity => addActivity(activity));
  
  // Add breakfast
  const breakfast = doshaActivities.meals[0];
  addActivity(breakfast);
  
  // Add health condition specific activities
  healthConditions.forEach(condition => {
    if (healthActivities[condition]) {
      // Space out health activities throughout the day
      currentHour += 2;
      currentMinute = 0;
      healthActivities[condition].forEach(activity => addActivity(activity));
    }
  });

  return schedule;
}

async function seedDailySchedule() {
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
    const collection = db.collection('daily-schedules');

    // Clear existing data
    await collection.deleteMany({});
    console.log('Cleared existing daily schedules.');

    // Get users from the database
    const users = await db.collection('users').find().toArray();
    
    // Sample dosha types and health conditions for demonstration
    const doshaTypes = ['vata', 'pitta', 'kapha'];
    const healthConditionSets = [
      ['stress', 'sleep'],
      ['digestion', 'stress'],
      ['sleep'],
      ['digestion']
    ];

    // Generate personalized schedules for each user
    const schedules = users.map((user, index) => {
      // Rotate through dosha types and health conditions to create variety
      const doshaType = doshaTypes[index % doshaTypes.length];
      const healthConditions = healthConditionSets[index % healthConditionSets.length];
      
      return generatePersonalizedSchedule(user._id, doshaType, healthConditions);
    }).flat();

    // Insert the schedules
    if (schedules.length > 0) {
      await collection.insertMany(schedules);
      console.log(`✅ Successfully seeded ${schedules.length} personalized daily schedule activities`);
    } else {
      console.log('⚠️ No users found to create daily schedules for');
    }

  } catch (error) {
    console.error('❌ Error seeding daily schedule:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDailySchedule().catch(console.error);
