import { Type } from '@google/genai';
import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Function declaration for analytics data
export const getAnalyticsDataDeclaration = {
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

// Helper function to get related metrics
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

// Function implementation for analytics data
export const handleAnalyticsData = async (
  fnCall: { args: { metric: string; timeframe: string; includeRelated?: boolean } },
  request: NextRequest,
  GEMINI_API_KEY: string
): Promise<{ analyticsData: { type: string; timeframe: string }[]; text: string }> => {
  const { metric, timeframe, includeRelated } = fnCall.args;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      analyticsData: [],
      text: 'Please log in to view your analytics data.'
    };
  }

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
    const analyticsData = [
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

    // Initialize GenAI with the API key
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
    const introduction = Object.keys(relatedData).length > 0 
      ? `Let me look at how your ${metric.replace('-', ' ')} connects with ${Object.keys(relatedData).map(m => m.replace('-', ' ')).join(' and ')}. I'll reference the data as we discuss the patterns.\n\n`
      : `Looking at your ${metric.replace('-', ' ')} data for the last ${timeframe}, let me share what I observe. I'll reference the chart as we discuss the patterns.\n\n`;
    
    const text = introduction + (analysisResult.text || 'Unable to analyze data at this time. Please try again.');

    return {
      analyticsData,
      text
    };

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      analyticsData: [],
      text: 'I apologize, but I encountered an error while analyzing your data. Please try again in a moment.'
    };
  }
};
