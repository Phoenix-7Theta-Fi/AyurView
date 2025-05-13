'use client';

import type { FormEvent } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send, User, Activity, Loader2 } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface AssessmentContext {
  stage: string;
  identifiedSymptoms: string[];
  assessmentFocus: string;
}

interface HealthAssessmentMessage extends ChatMessage {
  context?: AssessmentContext;
}

export default function HealthAssessmentInterface() {
  const [messages, setMessages] = useState<HealthAssessmentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentContext, setAssessmentContext] = useState<AssessmentContext | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  useEffect(() => {
    const welcomeMessage: HealthAssessmentMessage = {
      id: 'initial-assessment',
      role: 'assistant',
      content: "Welcome to your Ayurvedic Health Assessment. I'll guide you through a series of questions to better understand your health and well-being. Please feel free to share what brings you here today.",
      timestamp: new Date(),
      context: {
        stage: 'initial',
        identifiedSymptoms: [],
        assessmentFocus: 'general'
      }
    };
    // Initialize messages and context
    setMessages([welcomeMessage]);
    if (welcomeMessage.context) {
      setAssessmentContext(welcomeMessage.context);
    }
    
    // Cleanup function to handle component unmount
    return () => {
      setMessages([]);
      setAssessmentContext(null);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: HealthAssessmentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/health-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          message: currentInput,
          context: assessmentContext
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: HealthAssessmentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text,
        timestamp: new Date(),
        context: data.context
      };

      setMessages((prev) => [...prev, assistantMessage]);
      // Update context only if we receive a new one
      if (data.context) {
        setAssessmentContext(data.context);
      }

    } catch (error) {
      console.error('Error in health assessment:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date()
      }]);

      toast({
        title: "Error",
        description: "Failed to get response. Please check your connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-full bg-card rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col h-full w-full">
          <div className="border-b p-2 flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            <span className="font-medium text-primary">Health Assessment</span>
          </div>
          <ScrollArea className="flex-grow p-4 sm:p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-2 ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className={`flex items-end gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shadow-sm self-start">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Activity size={20} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Card
                      className={`${message.role === 'user' 
                        ? 'max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl bg-accent text-accent-foreground rounded-br-none ml-auto'
                        : 'w-full bg-background border-border text-foreground rounded-bl-none'
                      } p-3 sm:p-4 rounded-2xl shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-300`}
                    >
                      <CardContent className="p-0 text-sm sm:text-base leading-relaxed">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-accent-foreground/70' : 'text-muted-foreground/70'}`}>
                          {format(new Date(message.timestamp), 'p')}
                        </p>
                      </CardContent>
                    </Card>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shadow-sm self-start">
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          <User size={20} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-3 justify-start">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Activity size={20} />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="w-full p-3 sm:p-4 rounded-2xl shadow-md bg-background border-border text-foreground rounded-bl-none">
                    <CardContent className="p-0 flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Thinking...</span>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 border-t bg-card/50 flex items-center gap-2 sm:gap-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your health concerns or respond to the questions..."
              className="flex-grow text-base rounded-full px-4 py-3 focus-visible:ring-primary bg-background"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground aspect-square w-12 h-12"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={20} />}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
