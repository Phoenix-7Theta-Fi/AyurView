const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}

const uri = process.env.MONGODB_URI;

// Helper function to generate time slots for a practitioner
function generateTimeSlots(availability) {
  const slots = [];
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
  
  // Convert availability string to days array
  const availabilityDays = availability.split('(')[0].trim().split(',').map(day => day.trim());
  
  // Generate slots for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Skip if day is not in availability
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    if (!availabilityDays.some(availDay => day.includes(availDay))) {
      continue;
    }

    // Generate slots for the day
    timeSlots.forEach(time => {
      slots.push({
        date: date.toISOString().split('T')[0],
        time,
        available: Math.random() > 0.3 // 70% chance of slot being available
      });
    });
  }
  
  return slots;
}

async function seedPractitioners() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    // Initialize MongoDB connection
    await client.connect();
    const db = client.db('ayurview');

    // Get collections
    const practitionersCollection = db.collection('practitioners');
    const consultationsCollection = db.collection('consultations');
    const assignmentsCollection = db.collection('practitioner_assignments');

    // Check for existing data
    const existingPractitioners = await practitionersCollection.countDocuments();
    if (existingPractitioners > 0) {
      console.log('Practitioners data already seeded. Skipping...');
      await client.close();
      return;
    }

    // Seed practitioners
    const practitioners = [
      {
        _id: new ObjectId(),
        id: '1', // Keeping the same ID format as mock data
        name: 'Dr. Ananya Sharma',
        gender: 'female',
        specialization: 'Ayurvedic General Practice',
        bio: 'Dr. Sharma is a renowned Ayurvedic practitioner with over 15 years of experience in treating chronic ailments and promoting holistic wellness through personalized diet and lifestyle plans.',
        rating: 4.8,
        availability: 'Mon, Wed, Fri (9 AM - 5 PM)',
        location: 'Online & New Delhi Clinic',
        imageUrl: 'https://picsum.photos/seed/dr_ananya_sharma/400/400',
        dataAiHint: 'female ayurvedic doctor',
        availabilitySlots: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        id: '2',
        name: 'Yogi Rajendra Desai',
        gender: 'male',
        specialization: 'Yoga Therapy & Meditation',
        bio: 'Yogi Desai specializes in therapeutic yoga for stress management, physical rehabilitation, and spiritual growth. He conducts personalized sessions and group workshops.',
        rating: 4.9,
        availability: 'Tue, Thu, Sat (7 AM - 11 AM)',
        location: 'Online',
        imageUrl: 'https://picsum.photos/seed/yogi_rajendra/400/400',
        dataAiHint: 'male yoga instructor',
        availabilitySlots: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        id: '3',
        name: 'Ms. Priya Kulkarni',
        gender: 'female',
        specialization: 'Naturopathy & Herbal Medicine',
        bio: 'Priya focuses on natural healing methods, including hydrotherapy, mud therapy, and herbal remedies to detoxify the body and restore natural balance. She is passionate about preventive healthcare.',
        rating: 4.7,
        availability: 'Flexible (By Appointment)',
        location: 'Pune Wellness Center',
        imageUrl: 'https://picsum.photos/seed/priya_kulkarni/400/400',
        dataAiHint: 'female naturopath',
        availabilitySlots: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        id: '4',
        name: 'Dr. Vikram Singh',
        gender: 'male',
        specialization: 'Panchakarma Specialist',
        bio: 'With expertise in traditional Panchakarma therapies, Dr. Singh helps clients achieve deep detoxification and rejuvenation. He has successfully treated various complex health issues.',
        rating: 4.6,
        availability: 'Mon - Sat (10 AM - 6 PM)',
        location: 'Jaipur Ayurveda Hospital',
        imageUrl: 'https://picsum.photos/seed/dr_vikram_singh/400/400',
        dataAiHint: 'male panchakarma doctor',
        availabilitySlots: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        id: '5',
        name: 'Dr. Meera Chavan',
        gender: 'female',
        specialization: 'Ayurvedic Nutrition & Dietetics',
        bio: 'Dr. Chavan provides personalized dietary consultations based on Ayurvedic principles to manage weight, improve digestion, and enhance overall vitality. She believes food is medicine.',
        rating: 4.8,
        availability: 'Mon, Tue, Thu (2 PM - 7 PM)',
        location: 'Online',
        imageUrl: 'https://picsum.photos/seed/dr_meera_chavan/400/400',
        dataAiHint: 'female nutrition doctor',
        availabilitySlots: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        id: '6',
        name: 'Acharya Advait Sharma',
        gender: 'male',
        specialization: 'Vedic Astrology & Wellness',
        bio: 'Acharya Advait combines Vedic astrology with Ayurvedic wellness principles to offer guidance for life path, health, and relationships. Holistic consultations for mind-body-spirit harmony.',
        rating: 4.5,
        availability: 'Wed, Fri (11 AM - 4 PM)',
        location: 'Online & Rishikesh Ashram',
        imageUrl: 'https://picsum.photos/seed/acharya_advait/400/400',
        dataAiHint: 'male vedic astrologer',
        availabilitySlots: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Generate availability slots for each practitioner
    practitioners.forEach(practitioner => {
      practitioner.availabilitySlots = generateTimeSlots(practitioner.availability);
    });

    // Insert practitioners
    await practitionersCollection.insertMany(practitioners);
    console.log('Successfully seeded practitioners');

    // Seed some sample consultations (based on mockUpcomingConsultations)
    const consultations = [
      {
        _id: new ObjectId(),
        id: 'uc1',
        practitionerId: practitioners[0]._id, // Dr. Ananya Sharma
        practitionerName: practitioners[0].name,
        specialization: practitioners[0].specialization,
        date: "2024-08-15",
        time: "10:00 AM",
        mode: 'online',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        id: 'uc2',
        practitionerId: practitioners[1]._id, // Yogi Rajendra Desai
        practitionerName: practitioners[1].name,
        specialization: practitioners[1].specialization,
        date: "2024-07-25",
        time: "08:00 AM",
        mode: 'online',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await consultationsCollection.insertMany(consultations);
    console.log('Successfully seeded consultations');

    // Seed sample practitioner assignment (based on mockAssignedPractitioner)
    const assignment = {
      _id: new ObjectId(),
      practitionerId: practitioners[0]._id, // Dr. Ananya Sharma is the assigned practitioner
      practitionerName: practitioners[0].name,
      specialization: practitioners[0].specialization,
      assignedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await assignmentsCollection.insertMany([assignment]);
    console.log('Successfully seeded practitioner assignments');

    // Create indexes
    await practitionersCollection.createIndex({ specialization: 1 });
    await practitionersCollection.createIndex({ name: 1 });
    await practitionersCollection.createIndex({ location: 1 });
    await practitionersCollection.createIndex({ 'availabilitySlots.date': 1 });
    
    await consultationsCollection.createIndex({ practitionerId: 1 });
    await consultationsCollection.createIndex({ date: 1 });
    
    await assignmentsCollection.createIndex({ practitionerId: 1 });
    
    console.log('Created indexes for all collections');

    await client.close();
  } catch (error) {
    console.error('Error seeding practitioners data:', error);
    process.exit(1);
  }
}

seedPractitioners();
