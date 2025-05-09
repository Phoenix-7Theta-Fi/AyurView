
import PractitionerCard from '@/components/practitioners/PractitionerCard';
import type { Practitioner } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const mockPractitioners: Practitioner[] = [
  {
    id: '1',
    name: 'Dr. Ananya Sharma',
    specialization: 'Ayurvedic General Practice',
    bio: 'Dr. Sharma is a renowned Ayurvedic practitioner with over 15 years of experience in treating chronic ailments and promoting holistic wellness through personalized diet and lifestyle plans.',
    imageUrl: 'https://picsum.photos/seed/ananya/300/200',
    rating: 4.8,
    availability: 'Mon, Wed, Fri (9 AM - 5 PM)',
    location: 'Online & New Delhi Clinic',
    dataAiHint: 'indian doctor woman'
  },
  {
    id: '2',
    name: 'Yogi Rajendra Desai',
    specialization: 'Yoga Therapy & Meditation',
    bio: 'Yogi Desai specializes in therapeutic yoga for stress management, physical rehabilitation, and spiritual growth. He conducts personalized sessions and group workshops.',
    imageUrl: 'https://picsum.photos/seed/rajendra/300/200',
    rating: 4.9,
    availability: 'Tue, Thu, Sat (7 AM - 11 AM)',
    location: 'Online',
    dataAiHint: 'yoga instructor male'
  },
  {
    id: '3',
    name: 'Ms. Priya Kulkarni',
    specialization: 'Naturopathy & Herbal Medicine',
    bio: 'Priya focuses on natural healing methods, including hydrotherapy, mud therapy, and herbal remedies to detoxify the body and restore natural balance. She is passionate about preventive healthcare.',
    imageUrl: 'https://picsum.photos/seed/priya/300/200',
    rating: 4.7,
    availability: 'Flexible (By Appointment)',
    location: 'Pune Wellness Center',
    dataAiHint: 'wellness coach woman'
  },
  {
    id: '4',
    name: 'Dr. Vikram Singh',
    specialization: 'Panchakarma Specialist',
    bio: 'With expertise in traditional Panchakarma therapies, Dr. Singh helps clients achieve deep detoxification and rejuvenation. He has successfully treated various complex health issues.',
    imageUrl: 'https://picsum.photos/seed/vikram/300/200',
    rating: 4.6,
    availability: 'Mon - Sat (10 AM - 6 PM)',
    location: 'Jaipur Ayurveda Hospital',
    dataAiHint: 'doctor male traditional'
  },
  {
    id: '5',
    name: 'Dr. Meera Chavan',
    specialization: 'Ayurvedic Nutrition & Dietetics',
    bio: 'Dr. Chavan provides personalized dietary consultations based on Ayurvedic principles to manage weight, improve digestion, and enhance overall vitality. She believes food is medicine.',
    imageUrl: 'https://picsum.photos/seed/meera/300/200',
    rating: 4.8,
    availability: 'Mon, Tue, Thu (2 PM - 7 PM)',
    location: 'Online',
    dataAiHint: 'nutritionist woman'
  },
  {
    id: '6',
    name: 'Acharya Advait Sharma',
    specialization: 'Vedic Astrology & Wellness',
    bio: 'Acharya Advait combines Vedic astrology with Ayurvedic wellness principles to offer guidance for life path, health, and relationships. Holistic consultations for mind-body-spirit harmony.',
    imageUrl: 'https://picsum.photos/seed/advait/300/200',
    rating: 4.5,
    availability: 'Wed, Fri (11 AM - 4 PM)',
    location: 'Online & Rishikesh Ashram',
    dataAiHint: 'spiritual guide india'
  },
];

export default function PractitionersPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary tracking-tight sm:text-4xl">
          Connect with Our Experts
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse our curated list of experienced Ayurvedic practitioners, yoga therapists, and wellness coaches. Find the right guide for your journey to holistic health.
        </p>
      </div>
      
      {/* Placeholder for Filters and Search - Future Enhancement */}
      {/* 
      <div className="py-4 px-2 bg-card rounded-lg shadow-sm border border-border">
        <p className="text-center text-muted-foreground">Filters and Search Functionality (Coming Soon)</p>
      </div> 
      */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
        {mockPractitioners.map(practitioner => (
          <PractitionerCard key={practitioner.id} practitioner={practitioner} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Badge variant="secondary" className="text-sm p-2">
          More practitioners coming soon!
        </Badge>
      </div>
    </div>
  );
}
