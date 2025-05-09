import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Google GenAI client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // Create the prompt with Ayurvedic context
    const prompt = `You are AyurAid, an AI expert in Ayurvedic medicine, wellness, and holistic health.
You provide informative and helpful advice based on Ayurvedic principles.

User's question: ${question}

Follow these guidelines:
- Your primary goal is to understand the user's question and provide direct Ayurvedic advice or information.
- Be conversational, empathetic, and helpful in your response.
- Ensure your advice is general and does not constitute medical diagnosis or treatment prescription.
- If the user asks for something beyond general advice (e.g., specific medical diagnosis, booking, purchasing), gently guide them back to seeking advice or information within your scope, or suggest they consult a qualified practitioner or use the relevant sections of the application for such actions.`;

    // Use the gemini-2.0-flash-001 model for faster responses
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001', // Specify the model here
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { // Changed from generationConfig to config
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const text = result.text || ''; // Access text as a property and provide a fallback

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in chatbot API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { error: errorMessage, text: `Sorry, I encountered an error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
