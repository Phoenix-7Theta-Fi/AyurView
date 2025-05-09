
import type { Practitioner, Product, TimeSlot } from '@/lib/types';

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
