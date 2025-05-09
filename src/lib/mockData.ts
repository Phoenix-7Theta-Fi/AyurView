
import type { Practitioner, Product, TimeSlot, Milestone, ConcerningBiomarker, UpcomingConsultation, TreatmentPlanActivity } from '@/lib/types';
import { Pill, Zap, Sprout, Apple, Brain, Coffee, Dumbbell, CheckCircle, XCircle, AlertCircle, ListChecks, Activity } from 'lucide-react';


export const mockPractitioners: Practitioner[] = [
  {
    id: '1',
    name: 'Dr. Ananya Sharma',
    gender: 'female',
    specialization: 'Ayurvedic General Practice',
    bio: 'Dr. Sharma is a renowned Ayurvedic practitioner with over 15 years of experience in treating chronic ailments and promoting holistic wellness through personalized diet and lifestyle plans.',
    rating: 4.8,
    availability: 'Mon, Wed, Fri (9 AM - 5 PM)',
    location: 'Online & New Delhi Clinic',
    dataAiHint: 'indian doctor woman'
  },
  {
    id: '2',
    name: 'Yogi Rajendra Desai',
    gender: 'male',
    specialization: 'Yoga Therapy & Meditation',
    bio: 'Yogi Desai specializes in therapeutic yoga for stress management, physical rehabilitation, and spiritual growth. He conducts personalized sessions and group workshops.',
    rating: 4.9,
    availability: 'Tue, Thu, Sat (7 AM - 11 AM)',
    location: 'Online',
    dataAiHint: 'yoga instructor male'
  },
  {
    id: '3',
    name: 'Ms. Priya Kulkarni',
    gender: 'female',
    specialization: 'Naturopathy & Herbal Medicine',
    bio: 'Priya focuses on natural healing methods, including hydrotherapy, mud therapy, and herbal remedies to detoxify the body and restore natural balance. She is passionate about preventive healthcare.',
    rating: 4.7,
    availability: 'Flexible (By Appointment)',
    location: 'Pune Wellness Center',
    dataAiHint: 'wellness coach woman'
  },
  {
    id: '4',
    name: 'Dr. Vikram Singh',
    gender: 'male',
    specialization: 'Panchakarma Specialist',
    bio: 'With expertise in traditional Panchakarma therapies, Dr. Singh helps clients achieve deep detoxification and rejuvenation. He has successfully treated various complex health issues.',
    rating: 4.6,
    availability: 'Mon - Sat (10 AM - 6 PM)',
    location: 'Jaipur Ayurveda Hospital',
    dataAiHint: 'doctor male traditional'
  },
  {
    id: '5',
    name: 'Dr. Meera Chavan',
    gender: 'female',
    specialization: 'Ayurvedic Nutrition & Dietetics',
    bio: 'Dr. Chavan provides personalized dietary consultations based on Ayurvedic principles to manage weight, improve digestion, and enhance overall vitality. She believes food is medicine.',
    rating: 4.8,
    availability: 'Mon, Tue, Thu (2 PM - 7 PM)',
    location: 'Online',
    dataAiHint: 'nutritionist woman'
  },
  {
    id: '6',
    name: 'Acharya Advait Sharma',
    gender: 'male',
    specialization: 'Vedic Astrology & Wellness',
    bio: 'Acharya Advait combines Vedic astrology with Ayurvedic wellness principles to offer guidance for life path, health, and relationships. Holistic consultations for mind-body-spirit harmony.',
    rating: 4.5,
    availability: 'Wed, Fri (11 AM - 4 PM)',
    location: 'Online & Rishikesh Ashram',
    dataAiHint: 'spiritual guide india'
  },
];

export const MOCK_TIME_SLOTS: TimeSlot[] = [
  { time: '09:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: false },
  { time: '02:00 PM', available: true },
  { time: '03:00 PM', available: true },
  { time: '04:00 PM', available: false },
];

export const mockProducts: Product[] = [
  {
    id: 'prod1',
    name: 'Ashwagandha Capsules',
    description: 'Powerful adaptogen for stress relief, vitality, and cognitive function. Organic and sustainably sourced.',
    price: 15.99,
    imageUrl: 'https://picsum.photos/seed/ashwagandha_capsules/400/400',
    dataAiHint: 'herbal supplement bottle',
    category: 'Supplements',
    stock: 50,
  },
  {
    id: 'prod2',
    name: 'Triphala Churna',
    description: 'Traditional Ayurvedic blend for digestion, detoxification, and colon health. Made from three potent fruits.',
    price: 12.50,
    imageUrl: 'https://picsum.photos/seed/triphala_powder/400/400',
    dataAiHint: 'ayurvedic powder',
    category: 'Herbal Powders',
    stock: 30,
  },
  {
    id: 'prod3',
    name: 'Organic Turmeric Latte Mix',
    description: 'Delicious and healthy golden milk mix with turmeric, ginger, cinnamon, and black pepper. Boosts immunity.',
    price: 18.75,
    imageUrl: 'https://picsum.photos/seed/turmeric_latte/400/400',
    dataAiHint: 'golden milk spice',
    category: 'Wellness Drinks',
    stock: 25,
  },
  {
    id: 'prod4',
    name: 'Neem & Tulsi Soap',
    description: 'Handmade Ayurvedic soap with neem and tulsi extracts for clear, healthy skin. Antiseptic properties.',
    price: 7.99,
    imageUrl: 'https://picsum.photos/seed/neem_soap/400/400',
    dataAiHint: 'herbal soap bar',
    category: 'Personal Care',
    stock: 75,
  },
  {
    id: 'prod5',
    name: 'Brahmi Oil for Hair',
    description: 'Nourishing hair oil infused with Brahmi to promote hair growth, reduce dandruff, and calm the mind.',
    price: 22.00,
    imageUrl: 'https://picsum.photos/seed/brahmi_oil/400/400',
    dataAiHint: 'hair oil bottle',
    category: 'Hair Care',
    stock: 15,
  },
  {
    id: 'prod6',
    name: 'Chyawanprash - Ayurvedic Jam',
    description: 'A rich, herbal jam known for its rejuvenating and immune-boosting properties. A blend of over 40 herbs.',
    price: 25.50,
    imageUrl: 'https://picsum.photos/seed/chyawanprash_jar/400/400',
    dataAiHint: 'ayurvedic jam jar',
    category: 'Herbal Jams',
    stock: 40,
  },
   {
    id: 'prod7',
    name: 'Herbal Teatox Blend',
    description: 'A detoxifying tea blend with ginger, lemon, and Ayurvedic herbs to cleanse and rejuvenate the system.',
    price: 14.99,
    imageUrl: 'https://picsum.photos/seed/herbal_tea/400/400',
    dataAiHint: 'tea box herbs',
    category: 'Wellness Teas',
    stock: 60,
  },
  {
    id: 'prod8',
    name: 'Shatavari Root Powder',
    description: 'Known as a female reproductive tonic, Shatavari supports hormonal balance and overall wellness for women.',
    price: 16.50,
    imageUrl: 'https://picsum.photos/seed/shatavari_powder/400/400',
    dataAiHint: 'herbal powder bag',
    category: 'Herbal Powders',
    stock: 0, // Out of stock example
  },
];

// Mock data for Treatment Plan page
export const mockProblemOverview = {
  problemTitle: "Chronic Stress & Digestive Imbalance (Vata Aggravation)",
  problemDescription: "Patient reports persistent stress, anxiety, irregular digestion, bloating, and sleep disturbances over the past 6 months. Symptoms align with aggravated Vata dosha.",
  treatmentPlanSummary: "A holistic plan focusing on Vata pacification through diet, lifestyle modifications, herbal supplements, yoga, and meditation. Aim is to restore doshic balance, improve digestion, and reduce stress.",
  goals: [
    "Reduce stress and anxiety levels by 50% in 8 weeks.",
    "Improve sleep quality to 7-8 hours of restful sleep per night.",
    "Regulate digestion and eliminate bloating within 4 weeks.",
    "Enhance overall energy levels and mental clarity."
  ],
};

export const mockMilestones: Milestone[] = [
  { id: 'm1', title: "Initial Consultation & Dosha Assessment", status: 'completed', dueDate: "2024-07-01" },
  { id: 'm2', title: "Dietary Adjustments Implementation (Vata Pacifying Diet)", status: 'in-progress', dueDate: "2024-07-15" },
  { id: 'm3', title: "Daily Meditation Practice (15 mins)", status: 'in-progress', dueDate: "2024-07-30" },
  { id: 'm4', title: "Introduction of Herbal Supplements", status: 'pending', dueDate: "2024-08-01" },
  { id: 'm5', title: "Follow-up Consultation", status: 'pending', dueDate: "2024-08-15" },
];

export const mockConcerningBiomarkers: ConcerningBiomarker[] = [
  { id: 'bio1', name: "Cortisol (Morning)", currentValue: "25", targetValue: "<15", unit: "µg/dL", lastChecked: "2024-07-01" },
  { id: 'bio2', name: "Sleep Duration", currentValue: "5.5", targetValue: "7-8", unit: "hours/night", lastChecked: "2024-07-10" },
  { id: 'bio3', name: "Digestive Discomfort Score (1-10)", currentValue: "7", targetValue: "<3", unit: "", lastChecked: "2024-07-10" },
  { id: 'bio4', name: "Heart Rate Variability (HRV)", currentValue: "45", targetValue: ">60", unit: "ms", lastChecked: "2024-07-01" },
];

export const mockAssignedPractitioner: Practitioner = mockPractitioners[0]; // Dr. Ananya Sharma

export const mockUpcomingConsultations: UpcomingConsultation[] = [
  { id: 'uc1', practitionerName: "Dr. Ananya Sharma", specialization: "Ayurvedic General Practice", date: "2024-08-15", time: "10:00 AM", mode: 'online' },
  { id: 'uc2', practitionerName: "Yogi Rajendra Desai", specialization: "Yoga Therapy", date: "2024-07-25", time: "08:00 AM", mode: 'online' },
];

export const mockDailySchedule: TreatmentPlanActivity[] = [
  {
    id: 'act1', time: "06:30 AM", title: "Wake Up & Hydrate", category: "Lifestyle",
    description: "Drink a glass of warm water with lemon.",
    details: "Upon waking, drink a glass of warm water (approx. 250ml) with the juice of half a lemon. This helps kickstart metabolism, aids digestion, and cleanses the system. Avoid cold water.",
    icon: Coffee, status: 'pending'
  },
  {
    id: 'act2', time: "07:00 AM", title: "Gentle Yoga & Pranayama", category: "Wellness",
    description: "30 minutes of Vata-pacifying yoga and breathing exercises.",
    details: "Focus on slow, grounding yoga asanas like Pawanmuktasana, Marjaryasana-Bitilasana, and Balasana. Follow with Nadi Shodhana (Alternate Nostril Breathing) for 10 minutes to calm the nervous system. Find a quiet space and use a comfortable mat.",
    icon: Sprout, status: 'pending'
  },
  {
    id: 'act3', time: "08:00 AM", title: "Ayurvedic Breakfast", category: "Nutrition",
    description: "Warm, nourishing, and easy-to-digest meal.",
    details: "Example: Cooked oatmeal with ghee, cinnamon, and stewed apples. Or, moong dal kitchari. Avoid dry, cold, or raw foods. Eat mindfully in a calm environment.",
    icon: Apple, status: 'pending'
  },
  {
    id: 'act4', time: "09:00 AM", title: "Herbal Supplements", category: "Medical",
    description: "Take prescribed Ashwagandha and Brahmi.",
    details: "Take 1 capsule of Ashwagandha and 1 capsule of Brahmi with warm water or as directed by Dr. Sharma. These herbs help manage stress and support mental clarity.",
    icon: Pill, status: 'pending'
  },
  {
    id: 'act5', time: "10:00 AM", title: "Focused Work Block", category: "Productivity",
    description: "90 minutes of focused work, minimize distractions.",
    details: "Engage in your most important tasks. Turn off notifications, close unnecessary tabs. Take short breaks if needed but maintain focus. This structured approach can reduce Vata aggravation from scattered attention.",
    icon: Brain, status: 'pending'
  },
  {
    id: 'act6', time: "01:00 PM", title: "Lunch & Mindful Eating", category: "Nutrition",
    description: "Warm, cooked lunch. Eat without distractions.",
    details: "Example: Basmati rice with cooked vegetables (e.g., carrots, zucchini, green beans) and a small portion of well-cooked lentils. Include a teaspoon of ghee. Chew food thoroughly.",
    icon: Apple, status: 'pending'
  },
  {
    id: 'act7', time: "03:00 PM", title: "Short Walk & Nature", category: "Wellness",
    description: "15-20 minute gentle walk, preferably in nature.",
    details: "A gentle walk aids digestion and calms the mind. If possible, walk in a park or green space. Avoid strenuous exercise during this time if feeling depleted.",
    icon: Zap, status: 'pending'
  },
  {
    id: 'act8', time: "06:00 PM", title: "Light Dinner", category: "Nutrition",
    description: "Easy-to-digest dinner, at least 2 hours before bed.",
    details: "Example: Vegetable soup or a small bowl of kitchari. Avoid heavy, oily, or spicy foods in the evening. Eating early allows for better digestion before sleep.",
    icon: Apple, status: 'pending'
  },
  {
    id: 'act9', time: "08:00 PM", title: "Evening Relaxation", category: "Lifestyle",
    description: "Wind-down routine: Reading, journaling, no screens.",
    details: "Engage in calming activities like reading a book (non-stimulating), journaling your thoughts, or listening to soothing music. Dim the lights. Avoid electronic screens (TV, phone, computer) for at least one hour before bed.",
    icon: Activity, status: 'pending'
  },
  {
    id: 'act10', time: "09:30 PM", title: "Bedtime Routine & Sleep", category: "Lifestyle",
    description: "Prepare for bed, aim for 7-8 hours of sleep.",
    details: "Practice good sleep hygiene: ensure your bedroom is dark, quiet, and cool. Consider a warm (non-caffeinated) herbal tea like chamomile. Try to go to bed and wake up around the same time each day.",
    icon: CheckCircle, status: 'pending'
  }
];

