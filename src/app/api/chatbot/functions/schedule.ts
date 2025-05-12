import { Type } from '@google/genai';
import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { NextRequest } from 'next/server';
import { parseISO, isSameDay } from 'date-fns';
import type { TreatmentPlanActivity } from '@/lib/types';

// Function declaration for schedule activities
export const getScheduleActivitiesDeclaration = {
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

// Function implementation for schedule activities
export const handleScheduleActivities = async (
  fnCall: { args: { timing: string; category?: string } },
  request: NextRequest,
  JWT_SECRET: string
): Promise<{ scheduleActivities: TreatmentPlanActivity[]; text: string }> => {
  const { timing, category } = fnCall.args;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      scheduleActivities: [],
      text: 'Please log in to view your schedule.'
    };
  }

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

    // Generate appropriate response text
    let responseText = '';
    if (filteredActivities.length === 0) {
      responseText = timing === 'today' || timing === 'remaining'
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
      
      responseText = `${activityText}\n\n`;
    }

    return {
      scheduleActivities: filteredActivities,
      text: responseText
    };

  } catch (error) {
    console.error('Error fetching schedule data:', error);
    return {
      scheduleActivities: [],
      text: 'I apologize, but I encountered an error while fetching your schedule. Please try again in a moment.'
    };
  }
};
