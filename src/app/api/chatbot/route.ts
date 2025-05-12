import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { mockProducts, mockPractitioners } from '@/lib/mockData';
import type { Product, Practitioner, TreatmentPlanActivity } from '@/lib/types';
import { subDays, parseISO, isSameDay } from 'date-fns';
import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

// Helper function to determine related metrics
const getRelatedMetrics = (primaryMetric: string): string[] => {
  const metricRelationships: Record<string, string[]> = {
    'sleep-wellness': ['meditation-practices', 'workout-overview'],
    'meditation-practices': ['sleep-wellness', 'biomarkers'],
    'workout-overview': ['diet-analytics', 'cardio-performance'],
    'diet-analytics': ['biomarkers', 'workout-overview'],
    'biomarkers': ['diet-analytics', 'sleep-wellness'],
    'cardio-performance': ['workout-overview', 'meditation-practices'],
    'yoga-practices': ['meditation-practices', 'cardio-performance']
  };

  return metricRelationships[primaryMetric] || [];
};

// Initialize the Google GenAI client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const getScheduleActivitiesDeclaration = {
  name: 'getScheduleActivities',
  description: 'Get user\'s schedule activities based on timing and filters',
  parameters: {
    type: Type.OBJECT,
    properties: {
      timing: {
        type: Type.STRING,
        enum: ['next', 'today', 'remaining', 'upcoming', 'pending'],
        description: 'When to fetch activities for (next = immediate next activity, today = all today\'s activities, remaining = remaining activities for today, upcoming = next few activities, pending = all pending activities regardless of date)'
      },
      category: {
        type: Type.STRING,
        enum: ['wellness', 'fitness', 'nutrition', 'medical', 'productivity', 'lifestyle'],
        description: 'Optional filter for specific activity category'
      }
    },
    required: ['timing']
  }
};

const getAnalyticsDataDeclaration = {
  name: 'getAnalyticsData',
  description: 'Get analytics data and provide insights for various health and wellness metrics.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      metric: {
        type: Type.STRING,
        description: 'The type of analytics data requested (e.g., sleep-wellness, diet-analytics, biomarkers, cardio-performance, meditation-practices, workout-overview, yoga-practices)',
      },
      timeframe: {
        type: Type.STRING,
        description: 'Timeframe for the data (e.g., week, month)',
      },
      includeRelated: {
        type: Type.BOOLEAN,
        description: 'Whether to include related metrics data for holistic analysis',
      }
    },
    required: ['metric', 'timeframe'],
  },
};

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

    // Create the prompt with Ayurvedic context and data analysis capabilities
    const prompt = `You are AyurAid, an expert Ayurvedic health analyst and advisor with deep knowledge of holistic wellness.
You analyze health data and provide insightful, personalized observations based on Ayurvedic principles.

User's question: ${question}

Follow these guidelines:
For health analytics inquiries:
1. First, determine if the question asks about relationships between metrics. If it does:
   - Set includeRelated=true
   - Use the most relevant metric as primary
   - Related metrics will be automatically included

2. If analyzing a single metric, determine which one to analyze:
   - Sleep patterns/quality -> metric='sleep-wellness'
   - Diet/nutrition/food intake -> metric='diet-analytics'
   - Health markers/biomarkers -> metric='biomarkers'
   - Heart rate/cardio/fitness -> metric='cardio-performance'
   - Meditation/mindfulness -> metric='meditation-practices'
   - Exercise/workout progress -> metric='workout-overview'
   - Yoga practice/asanas -> metric='yoga-practices'

2. Consider the appropriate timeframe:
   - Use 'week' for recent patterns and immediate insights
   - Use 'month' for longer-term trends and established patterns
   - Default to 'month' if not specified

3. For comprehensive analysis:
   - Set includeRelated=true to analyze connections between different health aspects
   - Look for patterns across related metrics (e.g., sleep affecting meditation, diet impacting workouts)
   - Consider Ayurvedic principles like doshas and daily rhythms in your analysis

4. When providing insights:
   - First, give a high-level summary of what you observe in the data
   - Point out any notable patterns or trends, using specific examples
   - If includeRelated is true, discuss correlations with other health metrics
     (e.g., how sleep quality affects meditation performance)
   - Provide context from an Ayurvedic perspective, referencing concepts like:
     * Doshas (Vata, Pitta, Kapha) and their influence
     * Daily rhythms (dinacharya) and seasonal changes (ritucharya)
     * Balance between different aspects of health
   - Offer 2-3 specific, actionable recommendations based on Ayurvedic principles
   - Structure your response in a clear, conversational way
   - Reference the charts/data when discussing specific metrics
- If the user asks to buy, purchase, or shop for a product, call the getProductsForPurchase function with relevant keywords and count (1-3).
- For schedule-related queries:
  * "What's next" or "next activity" -> timing='next'
  * "Today's activities" or "schedule today" -> timing='today'
  * "Remaining activities today" -> timing='remaining'
  * "Upcoming activities" -> timing='upcoming'
  * "Pending activities" or "incomplete activities" or "what's left to do" -> timing='pending'
  * If a specific category is mentioned (wellness, fitness, etc.), include it as the category parameter
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
            allowedFunctionNames: ['getProductsForPurchase', 'getPractitionersForBooking', 'getAnalyticsData', 'getScheduleActivities'],
          },
        },
        tools: [{ functionDeclarations: [getProductsForPurchaseDeclaration, getPractitionersForBookingDeclaration, getAnalyticsDataDeclaration, getScheduleActivitiesDeclaration] }],
      },
    });

    let text = result.text || '';
    let products: Product[] = [];
    let practitioners: Practitioner[] = [];
    type AnalyticsDataType = {
      type: string;
      timeframe: string;
    };
    let analyticsData: AnalyticsDataType[] = [];
    let scheduleActivities: TreatmentPlanActivity[] = [];

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
        else if (fnCall.name === 'getPractitionersForBooking' && fnCall.args) {
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
        else if (fnCall.name === 'getScheduleActivities' && fnCall.args) {
          const { timing, category } = fnCall.args as {
            timing: 'next' | 'today' | 'remaining' | 'upcoming' | 'pending';
            category?: string;
          };
          
          const authHeader = request.headers.get('Authorization');
          if (!authHeader?.startsWith('Bearer ')) {
            text = 'Please log in to view your schedule.';
          } else {
            try {
              // Get userId from token
              const decoded = verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: string };
              const userId = new ObjectId(decoded.userId);

              // Fetch activities from the daily-schedule API
              const scheduleResponse = await fetch(`${request.nextUrl.origin}/api/daily-schedule`, {
                headers: { 'Authorization': authHeader }
              });

              if (!scheduleResponse.ok) {
                throw new Error('Failed to fetch schedule data');
              }

              const { data } = await scheduleResponse.json();
              const now = new Date();
              
              // Filter and sort activities based on timing and category
              let filteredActivities = data
                .filter((activity: TreatmentPlanActivity) => {
                  const activityTime = parseISO(activity.time);
                  const isToday = isSameDay(activityTime, now);
                  const isFuture = activityTime > now;

                  switch (timing) {
                    case 'next':
                      return isFuture;
                    case 'today':
                      return isToday;
                    case 'remaining':
                      return isToday && isFuture;
                    case 'upcoming':
                      return isFuture;
                    case 'pending':
                      // Show all pending activities regardless of date
                      return activity.status === 'pending';
                    default:
                      return true;
                  }
                })
                .sort((a: TreatmentPlanActivity, b: TreatmentPlanActivity) => 
                  new Date(a.time).getTime() - new Date(b.time).getTime()
                );

              // Apply category filter if specified
              if (category) {
                filteredActivities = filteredActivities.filter(
                  (activity: TreatmentPlanActivity) => 
                    activity.category.toLowerCase() === category.toLowerCase()
                );
              }

              // Limit results based on timing
              if (timing === 'next') {
                filteredActivities = filteredActivities.slice(0, 1);
              } else if (timing === 'upcoming') {
                filteredActivities = filteredActivities.slice(0, 3);
              }

              scheduleActivities = filteredActivities;

              // Generate appropriate response text
              if (scheduleActivities.length === 0) {
                text = timing === 'today' || timing === 'remaining'
                  ? 'You have no more activities scheduled for today.'
                  : timing === 'pending'
                  ? 'You have no pending activities.'
                  : 'You have no upcoming activities scheduled.';
              } else {
                const activityText = timing === 'next'
                  ? 'Here is your next activity:'
                  : timing === 'today'
                  ? 'Here are your activities for today:'
                  : timing === 'remaining'
                  ? 'Here are your remaining activities for today:'
                  : timing === 'pending'
                  ? 'Here are your pending activities:'
                  : 'Here are your upcoming activities:';
                
                text = `${activityText}\n\n`;
              }

            } catch (error) {
              console.error('Error fetching schedule data:', error);
              text = 'I apologize, but I encountered an error while fetching your schedule. Please try again in a moment.';
            }
          }
        }
        else if (fnCall.name === 'getAnalyticsData' && fnCall.args) {
          const { metric, timeframe, includeRelated } = fnCall.args as { 
            metric: string; 
            timeframe: string; 
            includeRelated?: boolean 
          };
          const authHeader = request.headers.get('Authorization');
          
          if (!authHeader?.startsWith('Bearer ')) {
            text = 'Please log in to view your analytics data.';
          } else {
            try {
              // Fetch real data from the appropriate API endpoint
              const dataResponse = await fetch(`${request.nextUrl.origin}/api/${metric}`, {
                headers: {
                  'Authorization': authHeader
                }
              });

              if (!dataResponse.ok) {
                throw new Error('Failed to fetch analytics data');
              }

              const metricsData = await dataResponse.json();

              // Handle multi-metric analysis for relational queries
              let relatedData: Record<string, any> = {};
              if (includeRelated) {
                // Determine related metrics based on primary metric
                const relatedMetrics = getRelatedMetrics(metric);
                
                // Fetch data for related metrics
                for (const relatedMetric of relatedMetrics) {
                  const relatedResponse = await fetch(`${request.nextUrl.origin}/api/${relatedMetric}`, {
                    headers: { 'Authorization': authHeader }
                  });
                  
                  if (relatedResponse.ok) {
                    relatedData[relatedMetric] = await relatedResponse.json();
                  }
                }
              }

              // Set up visualization data for primary and related metrics
              analyticsData = [
                // Primary metric
                {
                  type: metric,
                  timeframe
                },
                // Related metrics
                ...Object.keys(relatedData).map(relatedMetric => ({
                  type: relatedMetric,
                  timeframe
                }))
              ];

              // Create analytics prompt with enhanced relationship analysis
              const analyticsPrompt = `As an expert Ayurvedic health consultant analyzing my patient's ${metric.replace('-', ' ')} data${Object.keys(relatedData).length > 0 ? ' and related metrics' : ''}, help me understand their health patterns.

Primary data (${metric}):
${JSON.stringify(metricsData, null, 2)}

${Object.keys(relatedData).length > 0 ? `Related data:\n${JSON.stringify(relatedData, null, 2)}` : ''}

Analyze this data as a holistic health advisor would. Consider:
1. What are the key patterns in the ${metric.replace('-', ' ')} data? Reference specific numbers and trends.
2. ${Object.keys(relatedData).length > 0 ? 'How do these metrics influence each other? Look for correlations and patterns between them.' : 'How might this affect other aspects of health?'}
3. From an Ayurvedic perspective:
   - How do these patterns reflect dosha balance?
   - Are they aligned with natural rhythms (dinacharya)?
   - What broader wellness implications do you see?

Be conversational and friendly, like explaining to a friend, but support all insights with specific data points. Point out both positive patterns and areas needing attention.

End with 2-3 practical suggestions based on the identified patterns.`;

              // Get a new analysis from Gemini based on the actual data
              const analysisResult = await genAI.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: [{ role: 'user', parts: [{ text: analyticsPrompt }] }],
                config: {
                  temperature: 0.7,
                  maxOutputTokens: 1000,
                },
              });

              // Format the response with a proper introduction
              if (!text) {
                const introduction = Object.keys(relatedData).length > 0 
                  ? `Let me look at how your ${metric.replace('-', ' ')} connects with ${Object.keys(relatedData).map(m => m.replace('-', ' ')).join(' and ')}. I'll reference the data as we discuss the patterns.\n\n`
                  : `Looking at your ${metric.replace('-', ' ')} data for the last ${timeframe}, let me share what I observe. I'll reference the chart as we discuss the patterns.\n\n`;
                text = introduction + (analysisResult.text || 'Unable to analyze data at this time. Please try again.');
              }
            } catch (error) {
              console.error('Error fetching analytics data:', error);
              text = 'I apologize, but I encountered an error while analyzing your data. Please try again in a moment.';
            }
          }
        }
      }
    }

    return NextResponse.json({ text, products, practitioners, analyticsData, scheduleActivities });
  } catch (error) {
    console.error('Error in chatbot API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json(
      { error: errorMessage, text: `Sorry, I encountered an error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
