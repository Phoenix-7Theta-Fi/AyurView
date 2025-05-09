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
    description: 'Finds Ayurvedic products based on health concerns, category, or keywords. Use this if the user is looking for remedies, supplements, or wellness items. If the user asks generally for products, this tool can provide a general selection.',
    inputSchema: z.object({
      query: z.string().optional().describe('The user query for products (e.g., "for stress", "immunity booster", "triphala"). If omitted, a general selection of products will be considered.'),
      category: z.string().optional().describe('The product category (e.g., "Supplements", "Herbal Powders").'),
    }),
    outputSchema: ProductArraySchema,
  },
  async (input) => {
    let filteredProducts = mockProducts;
    const queryLower = input.query?.toLowerCase();

    if (queryLower) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower) ||
        (input.category && p.category.toLowerCase().includes(input.category.toLowerCase()))
      );
    } else if (input.category) {
      // If no query, but category is provided, filter by category
      filteredProducts = filteredProducts.filter(p => p.category.toLowerCase().includes(input.category!.toLowerCase()));
    }
    // If neither query nor category is provided, all products (mockProducts) are considered initially.
    
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
  output: { schema: AyurvedicGuidanceLLMOutputSchema }, // LLM's direct text output should conform to this
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
- If the user is looking for products (e.g., "show products", for a health concern, or a specific product type):
  - Use 'findProducts' tool. If the user provides a specific query (like "for stress" or "turmeric"), pass it to the tool. If they ask generally (like "show me some products" or "what products do you have?"), you can call the tool without a specific query string to get general recommendations.
  - Present the found products in the 'answer' field.
- If they want to add a product to the cart, ask for the product ID (if multiple were found) and quantity in the 'answer' field.
  - Use 'addProductToCartClientProxy' tool. The client application will handle the actual cart update. Inform the user that the item will be added and they can see it in their cart in the 'answer' field.
- For multi-turn interactions (like booking or choosing a product), guide the user step-by-step via the 'answer' field.
- When a tool is used, summarize its result in your textual 'answer'. For example, if practitioners are found, list their names. If a booking is made, confirm it. If a product is to be added to cart, confirm that action.
- Be conversational and helpful in the 'answer' field.

IMPORTANT: Your entire response MUST be a single JSON object that strictly adheres to the output schema.
Do NOT include any text, explanations, or Markdown formatting (like \`\`\`json ... \`\`\` around the JSON object.
The JSON object must have a single key: "answer", which contains your textual response.
Example: {"answer": "Here is some advice..."}
If you use a tool, the tool's output should inform the content of the "answer" field.
If no tool is used, your direct advice or question to the user should be in the "answer" field.
`,
});


// Wrapper function for client-side usage.
// It calls the prompt directly and processes the full GenerateResponse.
export async function getAyurvedicGuidance(input: AyurvedicGuidanceInput): Promise<AyurvedicGuidanceAIFullResponse> {
  // Call the prompt directly to get the full GenerateResponse object
  const response: GenerateResponse<AyurvedicGuidanceInternalOutput | null> = await ayurvedicGuidancePrompt(input);

  let aiTextOutput: string;
  
  // Try to get the answer from the parsed output first
  if (response.output && response.output.answer) {
    aiTextOutput = response.output.answer;
  } 
  // If parsing failed (e.g. LLM wrapped JSON in markdown), try to parse from raw text
  else if (response.text) { 
    try {
      // Remove markdown and parse
      const cleanedText = response.text.replace(/```json\n?|\n?```/g, '').trim();
      const parsedJson = JSON.parse(cleanedText);
      // Validate against the schema (Genkit does this for response.output, we do it here for fallback)
      const validatedOutput = AyurvedicGuidanceLLMOutputSchema.parse(parsedJson);
      aiTextOutput = validatedOutput.answer;
    } catch (e) {
      console.warn("AI response was not in expected JSON object format, attempting to extract from raw text. Error:", e, "Response.text:", response.text);
      // As a further fallback, try to find any JSON structure in the text
      const jsonMatch = response.text.match(/{[\s\S]*}/);
      if (jsonMatch && jsonMatch[0]) {
        try {
            console.warn("Attempting to parse extracted JSON from raw text for aiTextOutput.");
            const parsedJsonFromMatch = JSON.parse(jsonMatch[0]);
            const validatedOutputFromMatch = AyurvedicGuidanceLLMOutputSchema.parse(parsedJsonFromMatch);
            aiTextOutput = validatedOutputFromMatch.answer;
        } catch (e2) {
            console.error("Failed to parse extracted JSON for aiTextOutput:", e2, "Extracted text:", jsonMatch[0]);
            aiTextOutput = response.text; // Ultimate fallback to the raw text
        }
      } else {
        aiTextOutput = response.text; // Ultimate fallback to the raw text if no JSON structure found
      }
      // If we fell back to raw text, one last check: perhaps the raw text *is* the JSON string {"answer": "..."}
      // that the schema expected, but it was wrapped, and initial parsing failed somewhere.
      if (aiTextOutput === response.text) {
          try {
              const attemptDirectParse = JSON.parse(aiTextOutput);
              if(attemptDirectParse.answer && typeof attemptDirectParse.answer === 'string') {
                  aiTextOutput = attemptDirectParse.answer;
                  console.warn("Successfully parsed aiTextOutput as direct JSON with 'answer' key after primary parsing failed.");
              } else {
                  console.warn("Raw text fallback was JSON but not in the {answer: ...} format or answer not string.");
              }
          } catch (jsonError) {
              // Not JSON, aiTextOutput remains the raw text.
              console.warn("Raw text fallback is not JSON.");
          }
      }
    }
  } 
  // If both response.output and response.text are missing or problematic
  else {
    const candidateMessage = response.candidates?.[0]?.message;
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'TOOL_CALLS' && candidateMessage) {
        aiTextOutput = `Error from AI: ${candidateMessage} (Reason: ${finishReason})`;
    } else if (candidateMessage) {
        aiTextOutput = `Received an unusual response: ${candidateMessage}`;
    }
    else {
        aiTextOutput = 'Sorry, I received an empty or unparsable response from the AI.';
    }
    console.error("AI response output and text are both missing/empty or unparsable. Full response:", JSON.stringify(response, null, 2));
  }


  // Process the full response to a simpler structure for the client
  const toolResults = response.toolRequests?.map((toolRequest, index) => {
    const toolResponsePart = response.toolResponses?.[index];
    if (!toolResponsePart) return null; // Should not happen if toolRequests exists
    return {
        call: { ref: toolRequest.ref, name: toolRequest.name, input: toolRequest.input }, // Reconstruct ToolCall like structure
        result: toolResponsePart
    };
  }).filter(Boolean) as AyurvedicGuidanceAIFullResponse['toolResults'] || undefined;


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
  
  return {
    text: aiTextOutput,
    toolCalls: response.toolRequests?.map(tr => ({ ref: tr.ref, name: tr.name, input: tr.input })), 
    toolResults: toolResults,
    customData: Object.keys(customData).length > 0 ? customData : undefined,
    error: (response.candidates?.[0]?.finishReason !== 'STOP' && response.candidates?.[0]?.finishReason !== 'TOOL_CALLS') 
            ? (response.candidates?.[0]?.message || 'Unknown error or non-STOP/TOOL_CALLS finish reason from AI model') 
            : undefined,
  };
}
