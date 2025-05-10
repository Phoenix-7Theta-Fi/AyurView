import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { mockProducts, mockPractitioners } from '@/lib/mockData';
import type { Product, Practitioner } from '@/lib/types';

// Initialize the Google GenAI client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const getProductsForPurchaseDeclaration = {
  name: 'getProductsForPurchase',
  description: 'Get a list of 1 to 3 products for purchase based on user interest or keywords.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      keywords: {
        type: Type.STRING,
        description: 'Keywords or product type the user is interested in (e.g., ashwagandha, soap, tea, supplement, etc.)',
      },
      count: {
        type: Type.NUMBER,
        description: 'Number of products to return (between 1 and 3).',
      },
    },
    required: ['keywords', 'count'],
  },
};

const getPractitionersForBookingDeclaration = {
  name: 'getPractitionersForBooking',
  description: 'Get a list of 1 to 3 practitioners for booking based on user interest, specialization, or keywords.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      keywords: {
        type: Type.STRING,
        description: 'Keywords or specialization the user is interested in (e.g., yoga, panchakarma, nutrition, etc.)',
      },
      count: {
        type: Type.NUMBER,
        description: 'Number of practitioners to return (between 1 and 3).',
      },
    },
    required: ['keywords', 'count'],
  },
};

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
- If the user asks to buy, purchase, or shop for a product, call the getProductsForPurchase function with relevant keywords and count (1-3).
- Otherwise, your primary goal is to understand the user's question and provide direct Ayurvedic advice or information.
- Be conversational, empathetic, and helpful in your response.
- Ensure your advice is general and does not constitute medical diagnosis or treatment prescription.
- If the user asks for something beyond general advice (e.g., specific medical diagnosis, booking), gently guide them back to seeking advice or information within your scope, or suggest they consult a qualified practitioner or use the relevant sections of the application for such actions.`;

    // Use the gemini-2.0-flash-001 model for faster responses
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: ['getProductsForPurchase', 'getPractitionersForBooking'],
          },
        },
        tools: [{ functionDeclarations: [getProductsForPurchaseDeclaration, getPractitionersForBookingDeclaration] }],
      },
    });

    let text = result.text || '';
    let products: Product[] = [];
    let practitioners: Practitioner[] = [];

    // Check for function calls in the response
    if (result.functionCalls && Array.isArray(result.functionCalls)) {
      for (const fnCall of result.functionCalls) {
        if (fnCall.name === 'getProductsForPurchase' && fnCall.args) {
          const { keywords, count } = fnCall.args as { keywords?: string; count?: number };
          const filtered = mockProducts.filter(
            (p: Product) =>
              p.stock > 0 &&
              (typeof keywords === 'string' &&
                (p.name.toLowerCase().includes(keywords.toLowerCase()) ||
                  p.category.toLowerCase().includes(keywords.toLowerCase()) ||
                  p.description.toLowerCase().includes(keywords.toLowerCase())))
          );
          const selected =
            filtered.length > 0
              ? filtered.slice(0, Math.max(1, Math.min(3, Number(count) || 1)))
              : mockProducts.filter((p: Product) => p.stock > 0).slice(0, Math.max(1, Math.min(3, Number(count) || 1)));
          products = selected;
          if (!text) {
            text = 'Here are some products you might like:';
          }
        }
        if (fnCall.name === 'getPractitionersForBooking' && fnCall.args) {
          const { keywords, count } = fnCall.args as { keywords?: string; count?: number };
          const filtered = mockPractitioners.filter(
            (p: Practitioner) =>
              typeof keywords === 'string' &&
              (p.name.toLowerCase().includes(keywords.toLowerCase()) ||
                p.specialization.toLowerCase().includes(keywords.toLowerCase()) ||
                p.bio.toLowerCase().includes(keywords.toLowerCase()))
          );
          const selected =
            filtered.length > 0
              ? filtered.slice(0, Math.max(1, Math.min(3, Number(count) || 1)))
              : mockPractitioners.slice(0, Math.max(1, Math.min(3, Number(count) || 1)));
          practitioners = selected;
          if (!text) {
            text = 'Here are some practitioners you might like to book:';
          }
        }
      }
    }

    return NextResponse.json({ text, products, practitioners });
  } catch (error) {
    console.error('Error in chatbot API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json(
      { error: errorMessage, text: `Sorry, I encountered an error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
