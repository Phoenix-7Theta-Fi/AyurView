'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chatbot/ChatInterface';
import HealthAssessmentInterface from '@/components/chatbot/HealthAssessmentInterface';
import HealthAssessmentToggle from '@/components/chatbot/HealthAssessmentToggle';

export default function ChatbotPage() {
  const [isHealthMode, setIsHealthMode] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[calc(100vh-120px)]">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4">
          <HealthAssessmentToggle
            isActive={isHealthMode}
            onToggle={setIsHealthMode}
          />
        </div>
      </div>
      <div className="flex-1 container mx-auto px-4 py-4">
        {isHealthMode ? <HealthAssessmentInterface /> : <ChatInterface />}
      </div>
    </div>
  );
}
