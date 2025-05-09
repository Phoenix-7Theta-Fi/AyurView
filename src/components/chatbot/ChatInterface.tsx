
'use client';

import type { FormEvent } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send, User, Sparkles, Loader2 } from 'lucide-react';
import type { ChatMessage, AyurvedicGuidanceAIFullResponse } from '@/lib/types';
import { getAyurvedicGuidance } from '@/ai/flows/ayurvedic-guidance';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    setMessages([
      {
        id: 'initial-greeting',
        role: 'assistant',
        content: "Namaste! I am AyurAid. I can help you with Ayurvedic guidance and information. How can I assist you today?",
        timestamp: new Date(),
      }
    ]);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
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
      const aiFullResponse: AyurvedicGuidanceAIFullResponse = await getAyurvedicGuidance({ question: currentInput });
      
      let assistantContent = aiFullResponse.text || 'I received a response, but it was empty.';
      
      if (aiFullResponse.error) {
        assistantContent = `Sorry, I encountered an error: ${aiFullResponse.error}. Please try again.`;
        toast({
            title: "AI Error",
            description: aiFullResponse.error,
            variant: "destructive",
        });
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error getting AI guidance:', error);
      const errorMessageContent = error instanceof Error ? error.message : 'An unknown error occurred.';
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessageContent}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please check your connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-full bg-card rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col h-full w-full"> {/* Single column layout */}
          <ScrollArea className="flex-grow p-4 sm:p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shadow-sm self-start">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Sparkles size={20} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <Card
                    className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl p-3 sm:p-4 rounded-2xl shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ${
                      message.role === 'user'
                        ? 'bg-accent text-accent-foreground rounded-br-none'
                        : 'bg-background border-border text-foreground rounded-bl-none'
                    }`}
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
              ))}
              {isLoading && (
                <div className="flex items-end gap-3 justify-start">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles size={20} />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="max-w-xs sm:max-w-md p-3 sm:p-4 rounded-2xl shadow-md bg-background border-border text-foreground rounded-bl-none">
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
              placeholder="Ask AyurAid for Ayurvedic advice..."
              className="flex-grow text-base rounded-full px-4 py-3 focus-visible:ring-primary bg-background"
              disabled={isLoading}
            />
            <Button
              id="chat-submit-button"
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
