import { GoogleGenAI, type Chat } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/utils';

interface AssessmentContext {
  stage: string;
  identifiedSymptoms: string[];
  assessmentFocus: string;
}

// Initialize Google GenAI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const DEFAULT_RESPONSE = "I'll help you with your health assessment.";

// Session storage
const chatSessions = new Map<string, ChatSessionManager>();

// Session cleanup (30 minutes timeout)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

class ChatSessionManager {
  private chatInstance: Chat;
  private context: AssessmentContext;
  private lastAccessed: number;

  constructor() {
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    this.chatInstance = genAI.chats.create({
      model: 'gemini-2.0-flash-001',
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });
    this.context = {
      stage: 'initial',
      identifiedSymptoms: [],
      assessmentFocus: 'general'
    };
    this.lastAccessed = Date.now();
  }

  private constructPrompt(message: string): string {
    return `You are AyurAid's Health Assessment specialist, an expert in Ayurvedic health evaluation.
Your role is to conduct a thorough health assessment through a conversational approach.

Guidelines for the assessment:
1. Ask relevant follow-up questions based on user responses
2. Focus on understanding:
   - Primary health concerns
   - Current symptoms
   - Lifestyle factors
   - Daily routines
   - Diet patterns
   - Sleep quality
   - Stress levels
   - Exercise habits
3. Use Ayurvedic principles to guide your questions
4. Be empathetic and professional
5. Don't provide medical diagnosis
6. Suggest consulting qualified practitioners when appropriate

Current Context:
Stage: ${this.context.stage}
Previously Identified Symptoms: ${this.context.identifiedSymptoms.join(', ')}
Current Focus: ${this.context.assessmentFocus}

User's message: ${message}`;
  }

  async sendMessage(message: string) {
    this.lastAccessed = Date.now();
    
    const promptWithContext = this.constructPrompt(message);
    const response = await this.chatInstance.sendMessage({
      message: promptWithContext || DEFAULT_RESPONSE
    });

    // Extract response text and handle undefined case
    const responseText = response.text || DEFAULT_RESPONSE;
    
    // Update context based on the response
    this.updateContext(responseText);

    return {
      text: responseText,
      context: this.context
    };
  }

  private updateContext(response: string) {
    // Update assessment focus
    if (response.toLowerCase().includes('sleep')) {
      this.context.assessmentFocus = 'sleep';
    } else if (response.toLowerCase().includes('diet') || response.toLowerCase().includes('food')) {
      this.context.assessmentFocus = 'diet';
    } else if (response.toLowerCase().includes('stress')) {
      this.context.assessmentFocus = 'stress';
    }

    // Progress the stage
    if (this.context.stage === 'initial') {
      this.context.stage = 'detailed_assessment';
    } else if (this.context.stage === 'detailed_assessment' && this.context.identifiedSymptoms.length > 2) {
      this.context.stage = 'lifestyle_assessment';
    }
  }

  getLastAccessTime(): number {
    return this.lastAccessed;
  }
}

// Cleanup inactive sessions
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of chatSessions) {
    if (now - session.getLastAccessTime() > SESSION_TIMEOUT) {
      chatSessions.delete(token);
    }
  }
}, SESSION_TIMEOUT);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const verified = await verifyJwtToken(token);
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    let chatSession = chatSessions.get(token);
    if (!chatSession) {
      chatSession = new ChatSessionManager();
      chatSessions.set(token, chatSession);
    }

    // Send message and get response
    const result = await chatSession.sendMessage(message);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in health assessment API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json(
      { error: errorMessage, text: `Sorry, I encountered an error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
