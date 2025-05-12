import { Type } from '@google/genai';
import type { Practitioner } from '@/lib/types';
import { mockPractitioners } from '@/lib/mockData';

// Function declaration for practitioner recommendations
export const getPractitionersForBookingDeclaration = {
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

// Function implementation for practitioner recommendations
export const handlePractitionerRecommendations = (
  fnCall: { args: { keywords?: string; count?: number } }
): { practitioners: Practitioner[]; text: string } => {
  const { keywords, count } = fnCall.args;

  // Filter practitioners based on keywords
  const filtered = mockPractitioners.filter(
    (p: Practitioner) =>
      typeof keywords === 'string' &&
      (p.name.toLowerCase().includes(keywords.toLowerCase()) ||
        p.specialization.toLowerCase().includes(keywords.toLowerCase()) ||
        p.bio.toLowerCase().includes(keywords.toLowerCase()))
  );

  // Select appropriate number of practitioners
  const selected =
    filtered.length > 0
      ? filtered.slice(0, Math.max(1, Math.min(3, Number(count) || 1)))
      : mockPractitioners.slice(0, Math.max(1, Math.min(3, Number(count) || 1)));

  return {
    practitioners: selected,
    text: 'Here are some practitioners you might like to book:'
  };
};
