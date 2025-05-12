const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}

const uri = process.env.MONGODB_URI;

// Common conditions and their treatments in Ayurveda
const conditions = [
  {
    title: "Chronic Stress & Digestive Imbalance (Vata Aggravation)",
    description: "Patient reports persistent stress, anxiety, irregular digestion, and sleep disturbances. Symptoms align with aggravated Vata dosha.",
    summary: "Holistic plan focusing on Vata pacification through diet, lifestyle modifications, herbs, yoga, and meditation.",
    goals: [
      "Reduce stress and anxiety levels by 50% in 8 weeks",
      "Improve sleep quality to 7-8 hours per night",
      "Regulate digestion and eliminate bloating within 4 weeks",
      "Enhance overall energy levels and mental clarity"
    ],
    biomarkers: [
      { name: "Cortisol (Morning)", currentValue: "25", targetValue: "<15", unit: "µg/dL" },
      { name: "Sleep Duration", currentValue: "5.5", targetValue: "7-8", unit: "hours/night" },
      { name: "Digestive Discomfort Score", currentValue: "7", targetValue: "<3", unit: "scale 1-10" }
    ]
  },
  {
    title: "Metabolic Imbalance & Weight Management (Kapha Predominant)",
    description: "Patient presents with slow metabolism, weight gain, lethargy, and congestion. Classic Kapha imbalance symptoms.",
    summary: "Comprehensive plan to stimulate metabolism, reduce Kapha, and establish healthy weight through diet and exercise.",
    goals: [
      "Achieve healthy weight loss of 5-6 kg in 12 weeks",
      "Improve metabolic markers through Ayurvedic diet",
      "Establish consistent exercise routine",
      "Reduce congestion and improve respiratory function"
    ],
    biomarkers: [
      { name: "BMI", currentValue: "28.5", targetValue: "23-25", unit: "kg/m²" },
      { name: "Fasting Blood Sugar", currentValue: "110", targetValue: "<100", unit: "mg/dL" },
      { name: "Respiratory Rate", currentValue: "20", targetValue: "12-16", unit: "breaths/min" }
    ]
  },
  {
    title: "Skin & Joint Inflammation (Pitta Imbalance)",
    description: "Patient exhibits skin inflammation, joint pain, and heat-related symptoms indicating Pitta aggravation.",
    summary: "Treatment focuses on Pitta pacification through cooling herbs, diet modifications, and stress management.",
    goals: [
      "Reduce inflammation markers within 6 weeks",
      "Improve skin condition and reduce flare-ups",
      "Manage joint pain and improve mobility",
      "Balance Pitta through lifestyle adjustments"
    ],
    biomarkers: [
      { name: "CRP Level", currentValue: "4.2", targetValue: "<1.0", unit: "mg/L" },
      { name: "Skin Inflammation Score", currentValue: "8", targetValue: "<3", unit: "scale 1-10" },
      { name: "Joint Pain Index", currentValue: "6", targetValue: "<2", unit: "scale 1-10" }
    ]
  },
  {
    title: "Respiratory Health & Immunity (Kapha-Vata Imbalance)",
    description: "Patient shows recurring respiratory issues, weak immunity, and seasonal allergies.",
    summary: "Immunity-boosting protocol with respiratory strengthening practices and herbal support.",
    goals: [
      "Strengthen respiratory system in 8 weeks",
      "Boost immune function naturally",
      "Reduce frequency of seasonal allergies",
      "Improve energy and vitality"
    ],
    biomarkers: [
      { name: "Immune Cell Count", currentValue: "1200", targetValue: ">1500", unit: "cells/µL" },
      { name: "Peak Flow Rate", currentValue: "350", targetValue: ">450", unit: "L/min" },
      { name: "Allergy Symptom Score", currentValue: "7", targetValue: "<3", unit: "scale 1-10" }
    ]
  },
  {
    title: "Women's Health & Hormonal Balance (Vata-Pitta Imbalance)",
    description: "Patient experiences menstrual irregularities, mood fluctuations, and hormonal imbalances.",
    summary: "Holistic women's health plan incorporating herbs, diet, and lifestyle practices for hormonal balance.",
    goals: [
      "Regulate menstrual cycle within 3 months",
      "Balance hormonal levels naturally",
      "Improve emotional well-being",
      "Enhance reproductive health"
    ],
    biomarkers: [
      { name: "Estrogen Level", currentValue: "180", targetValue: "120-160", unit: "pg/mL" },
      { name: "Progesterone", currentValue: "8", targetValue: "10-20", unit: "ng/mL" },
      { name: "Thyroid TSH", currentValue: "4.5", targetValue: "1.5-3.5", unit: "mIU/L" }
    ]
  }
];

// Generate realistic treatment timeline based on condition
function generateTimeline(condition) {
  const startDate = new Date();
  const timeline = [];
  let currentId = 1;

  // Initial consultation and assessment
  timeline.push({
    id: `tt${currentId++}`,
    name: 'Initial Consultation & Assessment',
    startDate: startDate.toISOString().split('T')[0],
    endDate: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Wellness',
    status: 'completed'
  });

  // Diet plan
  const dietStart = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  timeline.push({
    id: `tt${currentId++}`,
    name: `${condition.title.includes('Vata') ? 'Vata-Pacifying' : condition.title.includes('Pitta') ? 'Pitta-Balancing' : 'Kapha-Reducing'} Diet Plan`,
    startDate: dietStart.toISOString().split('T')[0],
    endDate: new Date(dietStart.getTime() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Diet',
    status: 'in-progress'
  });

  // Herbal supplement course
  const herbStart = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  timeline.push({
    id: `tt${currentId++}`,
    name: 'Herbal Supplement Protocol',
    startDate: herbStart.toISOString().split('T')[0],
    endDate: new Date(herbStart.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Medication',
    status: 'pending'
  });

  // Therapeutic practices
  const therapyStart = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);
  timeline.push({
    id: `tt${currentId++}`,
    name: condition.title.includes('Respiratory') ? 'Pranayama & Respiratory Therapy' : 'Therapeutic Practices',
    startDate: therapyStart.toISOString().split('T')[0],
    endDate: new Date(therapyStart.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Therapy',
    status: 'in-progress'
  });

  return timeline;
}

// Generate milestones based on condition
function generateMilestones(condition) {
  const startDate = new Date();
  const milestones = [];
  let currentId = 1;

  milestones.push({
    id: `m${currentId++}`,
    title: "Initial Consultation & Assessment",
    status: 'completed',
    dueDate: startDate.toISOString().split('T')[0]
  });

  milestones.push({
    id: `m${currentId++}`,
    title: `${condition.title.includes('Vata') ? 'Vata-Pacifying' : condition.title.includes('Pitta') ? 'Pitta-Balancing' : 'Kapha-Reducing'} Protocol Implementation`,
    status: 'in-progress',
    dueDate: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  milestones.push({
    id: `m${currentId++}`,
    title: "Herbal Supplement Integration",
    status: 'pending',
    dueDate: new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  milestones.push({
    id: `m${currentId++}`,
    title: "Progress Assessment",
    status: 'pending',
    dueDate: new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  return milestones;
}

async function seedTreatmentPlans() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    const db = client.db('ayurview');

    // Get collections
    const treatmentPlansCollection = db.collection('treatmentPlans');
    const usersCollection = db.collection('users');
    const practitionersCollection = db.collection('practitioners');

    // Check for existing data
    const existingPlans = await treatmentPlansCollection.countDocuments();
    if (existingPlans > 0) {
      console.log('Treatment plans data already seeded. Skipping...');
      await client.close();
      return;
    }

    // Get all practitioners and users
    const practitioners = await practitionersCollection.find({}).toArray();
    const users = await usersCollection.find({}).toArray();

    if (practitioners.length === 0 || users.length === 0) {
      throw new Error('Required practitioners or users not found. Please run seed-practitioners.js and seed-users.js first.');
    }

    const treatmentPlans = [];

    // Create treatment plans for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const condition = conditions[i % conditions.length]; // Cycle through conditions
      const assignedPractitioner = practitioners[i % practitioners.length]; // Cycle through practitioners

      const treatmentPlan = {
        _id: new ObjectId(),
        userId: user._id,
        problemOverview: {
          problemTitle: condition.title,
          problemDescription: condition.description,
          treatmentPlanSummary: condition.summary,
          goals: condition.goals
        },
        milestones: generateMilestones(condition),
        biomarkers: condition.biomarkers.map((biomarker, index) => ({
          id: `bio${index + 1}`,
          ...biomarker,
          lastChecked: new Date().toISOString().split('T')[0]
        })),
        treatmentTimeline: generateTimeline(condition),
        assignedPractitioner: {
          _id: assignedPractitioner._id,
          id: assignedPractitioner.id,
          name: assignedPractitioner.name,
          specialization: assignedPractitioner.specialization,
          bio: assignedPractitioner.bio,
          imageUrl: assignedPractitioner.imageUrl,
          rating: assignedPractitioner.rating,
          availability: assignedPractitioner.availability,
          location: assignedPractitioner.location
        },
        upcomingConsultations: [
          {
            id: `uc${user._id}1`,
            practitionerName: assignedPractitioner.name,
            specialization: assignedPractitioner.specialization,
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "10:00 AM",
            mode: 'online'
          }
        ],
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      treatmentPlans.push(treatmentPlan);
    }

    // Insert treatment plans
    await treatmentPlansCollection.insertMany(treatmentPlans);
    console.log('Successfully seeded treatment plans');

    // Create indexes
    await treatmentPlansCollection.createIndex({ userId: 1 }, { unique: true });
    await treatmentPlansCollection.createIndex({ 'assignedPractitioner._id': 1 });
    await treatmentPlansCollection.createIndex({ lastUpdated: 1 });
    
    console.log('Created indexes for treatment plans collection');

    await client.close();
  } catch (error) {
    console.error('Error seeding treatment plans data:', error);
    process.exit(1);
  }
}

seedTreatmentPlans();
