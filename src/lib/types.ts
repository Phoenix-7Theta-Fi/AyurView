
import type { ToolCall, ToolRequestPart, ToolResponsePart } from "genkit"; // Ensure genkit types are available
import type { GenerateResponse } from "genkit/generate";

export interface Practitioner {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  imageUrl?: string;
  gender: 'male' | 'female';
  rating: number;
  availability: string;
  location: string;
  dataAiHint?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  dataAiHint?: string;
  category: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// Extended ChatMessage type
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string; // The main textual content
  timestamp: Date;
  isLoading?: boolean; // For AI thinking state
  // Optional fields for rendering structured data from AI/tool responses
  practitioners?: Practitioner[];
  products?: Product[];
  // Information about tool calls, if the UI needs to react specifically
  toolCalls?: ToolCall[]; 
  toolResponses?: ToolResponsePart[];
  // Data for specific actions triggered by chat
  actionableData?: {
    type: 'book_appointment';
    practitioner: Practitioner;
  } | {
    type: 'add_to_cart';
    product: Product;
  };
}


export interface MedicationAdherenceData {
  date: Date;
  adherence: number; // 0 to 1, representing percentage
}


// Wrapper type for the entire AI response from getAyurvedicGuidance
// This mirrors parts of Genkit's GenerateResponse structure
export interface AyurvedicGuidanceAIFullResponse {
  text?: string | null; // The primary textual answer from the LLM
  toolCalls?: ToolCall[];
  toolResults?: { call: ToolCall; result: ToolResponsePart }[]; // Simplified structure for tool results
  // custom fields if needed
  customData?: {
    practitioners?: Practitioner[];
    products?: Product[];
    appointmentBookingStatus?: { success: boolean; message: string; details?: any };
    productAddedToCartStatus?: { success: boolean; message: string; product?: Product; quantity?: number };
  };
  error?: string; // If an error occurred
}
