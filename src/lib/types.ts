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
