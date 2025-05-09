'use server';
/**
 * @fileOverview Provides Ayurvedic guidance.
 *
 * - getAyurvedicGuidance - A function that handles the Ayurvedic guidance process.
 * - AyurvedicGuidanceInput - The input type for the getAyurvedicGuidance function.
 * - AyurvedicGuidanceOutput - The return type for the getAyurvedicGuidance function, containing the AI's textual answer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {GenerateResponse} from 'genkit/generate';
import type { AyurvedicGuidanceAIFullResponse } from '@/lib/types';

// Input for the main flow
const AyurvedicGuidanceInputSchema = z.object({
  question: z.string().describe('The user question about Ayurvedic medicine or wellness.'),
});
export type AyurvedicGuidanceInput = z.infer<typeof AyurvedicGuidanceInputSchema>;

// Output schema for the LLM’s textual response part
const AyurvedicGuidanceLLMOutputSchema = z.object({
  answer: z.string().describe('The AI answer to the user question, incorporating Ayurvedic principles.'),
});
export type AyurvedicGuidanceOutput = z.infer<typeof AyurvedicGuidanceLLMOutputSchema>;


// Main Prompt
const ayurvedicGuidancePrompt = ai.definePrompt({
  name: 'ayurvedicGuidancePrompt',
  input: { schema: AyurvedicGuidanceInputSchema },
  output: { schema: AyurvedicGuidanceLLMOutputSchema },
  prompt: `You are AyurAid, an AI expert in Ayurvedic medicine, wellness, and holistic health.
You provide informative and helpful advice based on Ayurvedic principles.

User's question: {{question}}

Follow these guidelines:
- Your primary goal is to understand the user's question and provide direct Ayurvedic advice or information.
- Be conversational, empathetic, and helpful in your 'answer'.
- Ensure your advice is general and does not constitute medical diagnosis or treatment prescription.
- If the user asks for something beyond general advice (e.g., specific medical diagnosis, booking, purchasing), gently guide them back to seeking advice or information within your scope, or suggest they consult a qualified practitioner or use the relevant sections of the application for such actions.

IMPORTANT: Your entire response MUST be a single JSON object that strictly adheres to the output schema: {"answer": "Your textual response here"}.
Do NOT include any text, explanations, or Markdown formatting (like \`\`\`json ... \`\`\`) around the JSON object.
Example of a valid response: {"answer": "Ayurveda emphasizes balancing your doshas. For stress, Vata-pacifying practices like warm oil massage and regular routines can be very beneficial."}
Example of a valid response if asked to book an appointment: {"answer": "I can provide general Ayurvedic advice. For booking appointments, please use the 'Practitioners' section of the app."}
`,
});

// Flow that calls the prompt.
const ayurvedicGuidanceFlow = ai.defineFlow(
  {
    name: 'ayurvedicGuidanceFlow',
    inputSchema: AyurvedicGuidanceInputSchema,
    outputSchema: AyurvedicGuidanceLLMOutputSchema, // The flow directly outputs what the LLM produces according to the schema.
  },
  async (input) => {
    const llmResponse = await ayurvedicGuidancePrompt(input);
    // Genkit v1.x: The prompt call already gives you the structured output if the schema is met.
    // The `output` field of `llmResponse` will be `AyurvedicGuidanceLLMOutputSchema` if successful.
    if (!llmResponse.output) {
      // Handle cases where the LLM response might not conform or an error occurred
      // Log the raw response for debugging if necessary
      console.error("LLM response did not conform to schema or was empty. Raw response:", llmResponse.text);
      // Fallback or error handling strategy:
      // Option 1: Try to parse from raw text if it seems like it's just wrapped in markdown
      let parsedAnswer = "Sorry, I encountered an issue processing your request. Please try again.";
      if (llmResponse.text) {
        try {
          const cleanedText = llmResponse.text.replace(/```json\n?|\n?```/g, '').trim();
          const parsedJson = JSON.parse(cleanedText);
          const validatedOutput = AyurvedicGuidanceLLMOutputSchema.parse(parsedJson);
          parsedAnswer = validatedOutput.answer;
        } catch (e) {
          // Parsing failed, stick with generic error or the raw text if it's a simple string
          parsedAnswer = `I received a response that I couldn't fully understand: ${llmResponse.text}`;
        }
      }
      return { answer: parsedAnswer };
    }
    return llmResponse.output;
  }
);


// Wrapper function for client-side usage.
export async function getAyurvedicGuidance(input: AyurvedicGuidanceInput): Promise<AyurvedicGuidanceAIFullResponse> {
  try {
    const flowOutput = await ayurvedicGuidanceFlow(input);
    return {
      text: flowOutput.answer,
      // No tool calls, tool results, or custom data in this simplified version
    };
  } catch (error) {
    console.error('Error in getAyurvedicGuidance flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while getting Ayurvedic guidance.';
    return {
      text: `Sorry, I encountered an error: ${errorMessage}`,
      error: errorMessage,
    };
  }
}
