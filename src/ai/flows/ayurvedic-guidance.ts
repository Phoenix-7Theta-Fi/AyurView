
'use server';
/**
 * @fileOverview Provides Ayurvedic guidance, finds practitioners, books appointments,
 * recommends products, and assists with adding products to the cart.
 *
 * - getAyurvedicGuidance - A function that handles the comprehensive Ayurvedic guidance process.
 * - AyurvedicGuidanceInput - The input type for the getAyurvedicGuidance function.
 * - AyurvedicGuidanceInternalOutput - The LLM's direct text output. The flow returns a richer object.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {GenerateResponse} from 'genkit/generate';
import type {Practitioner as PractitionerType, Product as ProductType, TimeSlot as TimeSlotType, AyurvedicGuidanceAIFullResponse} from '@/lib/types';
import { mockPractitioners, mockProducts, MOCK_TIME_SLOTS } from '@/lib/mockData';

// Schemas for tools
const PractitionerSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialization: z.string(),
  bio: z.string(),
  gender: z.enum(['male', 'female']),
  rating: z.number(),
  availability: z.string(),
  location: z.string(),
});
const PractitionerArraySchema = z.array(PractitionerSchema);

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string(),
  category: z.string(),
  stock: z.number(),
});
const ProductArraySchema = z.array(ProductSchema);

const TimeSlotSchema = z.object({
  time: z.string(),
  available: z.boolean(),
});
const TimeSlotArraySchema = z.array(TimeSlotSchema);


// Input for the main flow
const AyurvedicGuidanceInputSchema = z.object({
  question: z.string().describe('The user question about Ayurvedic medicine, practitioners, products, or booking/cart actions.'),
  // Include conversation history if needed for context, simplified for now
  // history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
});
export type AyurvedicGuidanceInput = z.infer<typeof AyurvedicGuidanceInputSchema>;

// Output schema for the LLM's textual response part
const AyurvedicGuidanceLLMOutputSchema = z.object({
  answer: z.string().describe('The AI answer to the user question, incorporating Ayurvedic principles and results from any tools called. This text should guide the user or confirm actions.'),
});
export type AyurvedicGuidanceInternalOutput = z.infer<typeof AyurvedicGuidanceLLMOutputSchema>;


// Tools Definition

const findPractitionersTool = ai.defineTool(
  {
    name: 'findPractitioners',
    description: 'Finds Ayurvedic practitioners based on specialization, name, or general queries for assistance. Use this if the user is looking for a doctor, therapist, or expert.',
    inputSchema: z.object({
      specialization: z.string().optional().describe('The specialization to filter by (e.g., "Yoga Therapy", "Panchakarma Specialist").'),
      name: z.string().optional().describe('The name of the practitioner to search for.'),
    }),
    outputSchema: PractitionerArraySchema,
  },
  async (input) => {
    let filteredPractitioners = mockPractitioners;
    if (input.specialization) {
      filteredPractitioners = filteredPractitioners.filter(p => p.specialization.toLowerCase().includes(input.specialization!.toLowerCase()));
    }
    if (input.name) {
      filteredPractitioners = filteredPractitioners.filter(p => p.name.toLowerCase().includes(input.name!.toLowerCase()));
    }
    return filteredPractitioners.slice(0, 3); // Return a limited number for chat
  }
);

const getPractitionerAvailabilityTool = ai.defineTool(
  {
    name: 'getPractitionerAvailability',
    description: 'Gets available appointment time slots for a specific practitioner on a given date. Ask for practitioner ID and date if not provided.',
    inputSchema: z.object({
      practitionerId: z.string().describe('The ID of the practitioner.'),
      // date: z.string().describe('The date for which to check availability (YYYY-MM-DD). Optional for now.'),
    }),
    outputSchema: TimeSlotArraySchema,
  },
  async ({ practitionerId }) => {
    // In a real app, fetch availability for practitionerId and date
    // For now, return all mock slots, assuming they apply to any queried practitioner for any valid date
    const practitioner = mockPractitioners.find(p => p.id === practitionerId);
    if (!practitioner) throw new Error('Practitioner not found');
    return MOCK_TIME_SLOTS.filter(slot => slot.available);
  }
);

const bookAppointmentTool = ai.defineTool(
  {
    name: 'bookAppointment',
    description: 'Books an appointment with a specified practitioner for a given date, time, and mode. Confirm all details with the user before calling this tool.',
    inputSchema: z.object({
      practitionerId: z.string().describe('The ID of the practitioner.'),
      date: z.string().describe('The appointment date (e.g., "next Monday", "July 20th"). The AI should clarify to a specific date if ambiguous before calling.'),
      time: z.string().describe('The appointment time (e.g., "10:00 AM").'),
      bookingMode: z.enum(['online', 'in-person']).describe('The mode of appointment.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      practitionerName: z.string().optional(),
      bookedDate: z.string().optional(),
      bookedTime: z.string().optional(),
    }),
  },
  async (input) => {
    const practitioner = mockPractitioners.find(p => p.id === input.practitionerId);
    if (!practitioner) {
      return { success: false, message: 'Practitioner not found.' };
    }
    // Simulate booking
    console.log('Booking appointment:', input);
    return {
      success: true,
      message: `Appointment confirmed with ${practitioner.name} for ${input.date} at ${input.time} (${input.bookingMode}).`,
      practitionerName: practitioner.name,
      bookedDate: input.date,
      bookedTime: input.time,
    };
  }
);

const findProductsTool = ai.defineTool(
  {
    name: 'findProducts',
    description: 'Finds Ayurvedic products based on health concerns, category, or keywords. Use this if the user is looking for remedies, supplements, or wellness items.',
    inputSchema: z.object({
      query: z.string().describe('The user query for products (e.g., "for stress", "immunity booster", "triphala").'),
      category: z.string().optional().describe('The product category (e.g., "Supplements", "Herbal Powders").'),
    }),
    outputSchema: ProductArraySchema,
  },
  async (input) => {
    let filteredProducts = mockProducts;
    const queryLower = input.query.toLowerCase();

    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(queryLower) ||
      p.description.toLowerCase().includes(queryLower) ||
      (input.category && p.category.toLowerCase().includes(input.category.toLowerCase()))
    );
    return filteredProducts.filter(p => p.stock > 0).slice(0, 3); // Return a limited number, in stock
  }
);

// This tool doesn't *actually* add to cart on server. It prepares data for client to do so.
const addProductToCartClientProxyTool = ai.defineTool(
  {
    name: 'addProductToCartClientProxy',
    description: 'When a user confirms they want to add a specific product to their cart, use this tool. Provide the product ID and quantity.',
    inputSchema: z.object({
      productId: z.string().describe('The ID of the product to add to the cart.'),
      quantity: z.number().min(1).describe('The quantity of the product to add.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(), // Message for AI to relay
      product: ProductSchema.optional(), // Product details for client to use
      quantity: z.number().optional(),   // Quantity for client
    }),
  },
  async (input) => {
    const product = mockProducts.find(p => p.id === input.productId);
    if (!product) {
      return { success: false, message: "Sorry, I couldn't find that product." };
    }
    if (product.stock === 0) {
      return { success: false, message: `Sorry, ${product.name} is out of stock.` };
    }
    if (input.quantity > product.stock) {
      return {
        success: false,
        message: `Sorry, we only have ${product.stock} of ${product.name} in stock. I can add that many if you'd like.`,
        product: product,
        quantity: product.stock // Suggest adding max available stock
      };
    }
    // This tool signals the client to perform the action.
    return {
      success: true,
      message: `Okay, I've noted to add ${input.quantity} of ${product.name} to your cart. The cart icon in the header will update.`,
      product: product,
      quantity: input.quantity,
    };
  }
);


// Main Prompt
const ayurvedicGuidancePrompt = ai.definePrompt({
  name: 'ayurvedicGuidancePrompt',
  input: { schema: AyurvedicGuidanceInputSchema },
  output: { schema: AyurvedicGuidanceLLMOutputSchema }, // LLM's direct text output
  tools: [
    findPractitionersTool,
    getPractitionerAvailabilityTool,
    bookAppointmentTool,
    findProductsTool,
    addProductToCartClientProxyTool,
  ],
  prompt: `You are AyurAid, an AI expert in Ayurvedic medicine, wellness, and holistic health.
You can provide information, find practitioners, help book appointments, recommend products, and assist with adding products to the cart.

User's question: {{question}}

Follow these guidelines:
- If the user asks for general Ayurvedic advice, provide it in the 'answer' field of the JSON response.
- If the user is looking for a practitioner:
  - Use 'findPractitioners' tool. Present the found practitioners clearly in the 'answer' field.
  - If they want to book, ask for the practitioner's ID (if multiple were found and not specified), preferred date, and time in the 'answer' field.
  - Use 'getPractitionerAvailability' if needed to confirm slots for a specific practitioner. The result should inform your 'answer'.
  - Once all details are gathered (Practitioner ID, Date, Time, Mode - default to 'online' if not specified), use 'bookAppointment' tool to confirm. The booking confirmation should be in the 'answer' field.
- If the user is looking for products (e.g., for a health concern, or a specific product type):
  - Use 'findProducts' tool. Present the found products in the 'answer' field.
  - If they want to add a product to the cart, ask for the product ID (if multiple were found) and quantity in the 'answer' field.
  - Use 'addProductToCartClientProxy' tool. The client application will handle the actual cart update. Inform the user that the item will be added and they can see it in their cart in the 'answer' field.
- For multi-turn interactions (like booking or choosing a product), guide the user step-by-step via the 'answer' field.
- When a tool is used, summarize its result in your textual 'answer'. For example, if practitioners are found, list their names. If a booking is made, confirm it. If a product is to be added to cart, confirm that action.
- Be conversational and helpful in the 'answer' field.

IMPORTANT: Your entire response MUST be a single JSON object that strictly adheres to the output schema.
Do NOT include any text, explanations, or Markdown formatting (like \`\`\`json ... \`\`\`) around the JSON object.
The JSON object must have a single key: "answer", which contains your textual response.
Example: {"answer": "Here is some advice..."}
If you use a tool, the tool's output should inform the content of the "answer" field.
If no tool is used, your direct advice or question to the user should be in the "answer" field.
`,
});


// The flow returns the full GenerateResponse object from the prompt
const ayurvedicGuidanceFlow = ai.defineFlow(
  {
    name: 'ayurvedicGuidanceFlow',
    inputSchema: AyurvedicGuidanceInputSchema,
    // The flow's defined output schema is for documentation/type-hinting of the LLM's direct output part.
    // However, the flow actually returns the entire GenerateResponse object.
    outputSchema: AyurvedicGuidanceLLMOutputSchema,
  },
  async (input): Promise<GenerateResponse<AyurvedicGuidanceInternalOutput>> => {
    const genResponse = await ayurvedicGuidancePrompt(input);
    return genResponse;
  }
);

// Wrapper function for client-side usage.
// It's typed to return a simplified version of GenerateResponse structure for client convenience.
export async function getAyurvedicGuidance(input: AyurvedicGuidanceInput): Promise<AyurvedicGuidanceAIFullResponse> {
  const response = await ayurvedicGuidanceFlow(input) as GenerateResponse<AyurvedicGuidanceInternalOutput>;

  // Process the full response to a simpler structure for the client
  const toolResults = response.toolRequests?.map((toolRequest, index) => {
    const toolResponsePart = response.toolResponses?.[index];
    if (!toolResponsePart) return null; // Should not happen if toolRequests exists
    return {
        call: { ref: toolRequest.ref, name: toolRequest.name, input: toolRequest.input }, // Reconstruct ToolCall like structure
        result: toolResponsePart
    };
  }).filter(Boolean) as AyurvedicGuidanceAIFullResponse['toolResults'] || undefined;


  // Example of extracting specific data if a tool was called and successful
  // This part can be expanded based on how you want to structure customData
  let customData: AyurvedicGuidanceAIFullResponse['customData'] = {};

  if (toolResults) {
    for (const tr of toolResults) {
      if (tr.result.name === 'findPractitioners' && tr.result.output) {
        customData.practitioners = tr.result.output as PractitionerType[];
      }
      if (tr.result.name === 'findProducts' && tr.result.output) {
        customData.products = tr.result.output as ProductType[];
      }
      if (tr.result.name === 'bookAppointment' && tr.result.output) {
        customData.appointmentBookingStatus = tr.result.output as any;
      }
      if (tr.result.name === 'addProductToCartClientProxy' && tr.result.output) {
        const output = tr.result.output as any;
        customData.productAddedToCartStatus = {
          success: output.success,
          message: output.message,
          product: output.product,
          quantity: output.quantity,
        };
      }
    }
  }
  
  // Ensure 'text' property exists and is derived from the 'answer' field of the LLM's output
  // If the LLM response is valid JSON matching AyurvedicGuidanceLLMOutputSchema, response.output should exist.
  let aiTextOutput = 'Sorry, I could not understand the response.'; // Default error message
  if (response.output && response.output.answer) {
    aiTextOutput = response.output.answer;
  } else if (response.text) { 
    // Fallback if .output is not structured as expected, but .text is available (might be the wrapped JSON)
    // Attempt to parse it if it looks like the wrapped JSON
    try {
        const parsedText = JSON.parse(response.text.replace(/```json\n?|\n?```/g, ''));
        if (parsedText.answer) {
            aiTextOutput = parsedText.answer;
        }
    } catch (e) {
        // If parsing fails, use the raw text or keep the default error.
        // This might indicate the model still isn't conforming perfectly.
        aiTextOutput = response.text || aiTextOutput; 
        console.warn("AI response was not in expected JSON object format, used raw text. Response.text:", response.text);
    }
  }


  return {
    text: aiTextOutput,
    toolCalls: response.toolRequests?.map(tr => ({ ref: tr.ref, name: tr.name, input: tr.input })), // Map ToolRequestPart to ToolCall like structure
    toolResults: toolResults,
    customData: Object.keys(customData).length > 0 ? customData : undefined,
    error: response.candidates?.[0]?.finishReason === 'ERROR' ? (response.candidates[0].message || 'Unknown error from AI model') : undefined,
  };
}

