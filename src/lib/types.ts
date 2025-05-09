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
  imageUrl: string;
  rating: number; // 1 to 5
  availability: string;
  location: string;
  dataAiHint?: string;
}
