
'use client';

import type { FormEvent } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send, User, Sparkles, Loader2, X } from 'lucide-react';
import type { ChatMessage, Practitioner, Product, AyurvedicGuidanceAIFullResponse } from '@/lib/types';
import { getAyurvedicGuidance } from '@/ai/flows/ayurvedic-guidance';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/contexts/CartContext';
import BookAppointmentModal from '@/components/practitioners/BookAppointmentModal';
import PractitionerInfoModal from '../practitioners/PractitionerInfoModal';
import PractitionerArtifactDisplay from './PractitionerArtifactDisplay';
import ProductArtifactDisplay from './ProductArtifactDisplay';


export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const [selectedPractitionerForBooking, setSelectedPractitionerForBooking] = useState<Practitioner | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPractitionerForInfo, setSelectedPractitionerForInfo] = useState<Practitioner | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  const [artifactContent, setArtifactContent] = useState<React.ReactNode | null>(null);
  const [artifactTitle, setArtifactTitle] = useState<string>("Details");


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
        content: "Namaste! I am AyurAid. I can help you with Ayurvedic guidance, find practitioners, book appointments, or recommend products from our shop. How can I assist you today?",
        timestamp: new Date(),
      }
    ]);
  }, []);

  // These functions are now potentially triggered by PractitionerCard/ProductCard instances
  // which might be rendered inside PractitionerArtifactDisplay or ProductArtifactDisplay.
  // PractitionerCard and ProductCard already manage their own modals/actions using context or internal state.
  // So these specific handlers might not be directly called from the artifact display components
  // unless those components are simplified to not use cards.
  // For now, we'll assume PractitionerCard and ProductCard handle their interactions.

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
    setArtifactContent(null); // Clear artifact view on new message

    try {
      const aiFullResponse: AyurvedicGuidanceAIFullResponse = await getAyurvedicGuidance({ question: currentInput });
      
      let assistantContent = aiFullResponse.text || 'I received a response, but it was empty.';
      
      // Process customData for artifact view
      if (aiFullResponse.customData?.practitioners && aiFullResponse.customData.practitioners.length > 0) {
        setArtifactContent(
          <PractitionerArtifactDisplay practitioners={aiFullResponse.customData.practitioners} />
        );
        setArtifactTitle("Practitioners Found");
      } else if (aiFullResponse.customData?.products && aiFullResponse.customData.products.length > 0) {
        setArtifactContent(
          <ProductArtifactDisplay products={aiFullResponse.customData.products} />
        );
        setArtifactTitle("Products Found");
      } else {
        setArtifactContent(null); // Ensure artifact view is cleared if no relevant data
      }

      // Handle cart additions confirmed by AI
      if (aiFullResponse.customData?.productAddedToCartStatus?.success && aiFullResponse.customData.productAddedToCartStatus.product) {
        const { product, quantity } = aiFullResponse.customData.productAddedToCartStatus;
        if (product && quantity) {
          addToCart(product as Product, quantity);
        }
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        toolCalls: aiFullResponse.toolCalls,
        toolResponses: aiFullResponse.toolResults?.map(tr => tr.result)
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
      setArtifactContent(null); // Clear artifact view on error
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
        <div className={`flex flex-col h-full transition-all duration-300 ease-in-out ${artifactContent ? 'w-3/5 xl:w-2/3' : 'w-full'}`}>
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
                        {format(message.timestamp, 'p')}
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
              placeholder="Ask AyurAid..."
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

        {artifactContent && (
          <div className="w-2/5 xl:w-1/3 h-full border-l border-border bg-background/30 p-4 flex flex-col shadow-lg">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
              <h3 className="text-lg font-semibold text-primary">{artifactTitle}</h3>
              <Button variant="ghost" size="icon" onClick={() => setArtifactContent(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
                <span className="sr-only">Close details</span>
              </Button>
            </div>
            <ScrollArea className="flex-grow pr-1"> {/* Added pr-1 to prevent scrollbar overlap if content is tight */}
              {artifactContent}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Modals are kept here as they are global to the interface actions,
          PractitionerCard and ProductCard will trigger them via their internal logic or context.
          If selectedPractitionerForBooking/Info is set by ChatInterface itself based on AI response for booking,
          this logic would need slight adjustment, but current setup relies on cards to trigger.
      */}
      {selectedPractitionerForBooking && (
        <BookAppointmentModal
          practitioner={selectedPractitionerForBooking}
          open={isBookingModalOpen}
          onOpenChange={(isOpen) => {
            setIsBookingModalOpen(isOpen);
            if (!isOpen) setSelectedPractitionerForBooking(null);
          }}
        />
      )}
      {selectedPractitionerForInfo && (
        <PractitionerInfoModal
            practitioner={selectedPractitionerForInfo}
            generatedImageUrl={selectedPractitionerForInfo.imageUrl || `https://randomuser.me/api/portraits/${selectedPractitionerForInfo.gender === 'male' ? 'men' : 'women'}/${parseInt(selectedPractitionerForInfo.id) % 100}.jpg`}
            open={isInfoModalOpen}
            onOpenChange={(isOpen) => {
              setIsInfoModalOpen(isOpen);
              if(!isOpen) setSelectedPractitionerForInfo(null);
            }}
        />
      )}
    </>
  );
}
