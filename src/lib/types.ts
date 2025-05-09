export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MedicationAdherenceData {
  date: Date;
  adherence: number; // 0 to 1, representing percentage
}

export interface Practitioner {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  // imageUrl is now generated, but kept optional in case of specific overrides in future.
  imageUrl?: string; 
  gender: 'male' | 'female'; // Added for randomuser.me API
  rating: number; // 1 to 5
  availability: string;
  location: string;
  dataAiHint?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
