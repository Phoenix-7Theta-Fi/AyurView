
'use client';

import type { FormEvent } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Sparkles, Loader2, Briefcase, ShoppingBag, ExternalLink, PlusCircle, CalendarClock } from 'lucide-react';
import type { ChatMessage, Practitioner, Product, AyurvedicGuidanceAIFullResponse } from '@/lib/types';
import { getAyurvedicGuidance } from '@/ai/flows/ayurvedic-guidance';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/contexts/CartContext'; // For adding products to cart
import BookAppointmentModal from '@/components/practitioners/BookAppointmentModal'; // For booking
import PractitionerInfoModal from '../practitioners/PractitionerInfoModal';


export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();

  // State for modals
  const [selectedPractitionerForBooking, setSelectedPractitionerForBooking] = useState<Practitioner | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPractitionerForInfo, setSelectedPractitionerForInfo] = useState<Practitioner | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [initialBookingDate, setInitialBookingDate] = useState<Date | undefined>(undefined);
  const [initialBookingTime, setInitialBookingTime] = useState<string | undefined>(undefined);


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

  const handleOpenBookingModal = (practitioner: Practitioner, dateStr?: string, timeStr?: string) => {
    setSelectedPractitionerForBooking(practitioner);
    // Basic date/time parsing if provided by AI. For robustness, AI should provide structured date/time.
    if (dateStr) {
        // This is a simplistic approach. Robust date parsing would be needed.
        // For now, we'll assume AI provides a parseable string or we let user pick.
        // setInitialBookingDate(new Date(dateStr)); 
    }
    if (timeStr) {
        // setInitialBookingTime(timeStr);
    }
    setIsBookingModalOpen(true);
  };

  const handleOpenInfoModal = (practitioner: Practitioner) => {
    setSelectedPractitionerForInfo(practitioner);
    setIsInfoModalOpen(true);
  }


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
      // The getAyurvedicGuidance function now returns a more complex object
      const aiFullResponse: AyurvedicGuidanceAIFullResponse = await getAyurvedicGuidance({ question: currentInput });
      
      let assistantContent = aiFullResponse.text || 'I received a response, but it was empty.';
      let practitionersToShow: Practitioner[] | undefined = undefined;
      let productsToShow: Product[] | undefined = undefined;

      // Check for tool results and process them
      if (aiFullResponse.customData?.productAddedToCartStatus?.success && aiFullResponse.customData.productAddedToCartStatus.product) {
        const { product, quantity } = aiFullResponse.customData.productAddedToCartStatus;
        if (product && quantity) {
          addToCart(product as Product, quantity); // Cast ProductType to Product
          // AI's text response should already confirm this, but we could add more here.
        }
      }
      
      if (aiFullResponse.customData?.practitioners) {
        practitionersToShow = aiFullResponse.customData.practitioners;
      }
      if (aiFullResponse.customData?.products) {
        productsToShow = aiFullResponse.customData.products;
      }


      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        practitioners: practitionersToShow,
        products: productsToShow,
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
      <div className="flex flex-col h-full bg-card rounded-lg shadow-xl overflow-hidden">
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
                      : 'bg-background border-border text-foreground rounded-bl-none' // Changed AI bubble style for clarity
                  }`}
                >
                  <CardContent className="p-0 text-sm sm:text-base leading-relaxed">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Render Practitioners */}
                    {message.practitioners && message.practitioners.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Practitioners Found:</h4>
                        {message.practitioners.map(p => (
                          <div key={p.id} className="p-2.5 bg-muted/30 rounded-md shadow-sm">
                            <p className="font-semibold text-primary">{p.name} <span className="text-xs text-muted-foreground font-normal">- {p.specialization}</span></p>
                            <p className="text-xs text-foreground/80 mt-0.5">{p.bio.substring(0,70)}...</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" onClick={() => handleOpenInfoModal(p)} className="text-xs h-7">
                                <ExternalLink size={12} className="mr-1.5"/> Info
                              </Button>
                              <Button size="sm" onClick={() => handleOpenBookingModal(p)} className="text-xs h-7 bg-primary hover:bg-primary/90">
                                <CalendarClock size={12} className="mr-1.5"/> Book
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Products */}
                    {message.products && message.products.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Products Found:</h4>
                        {message.products.map(prod => (
                          <div key={prod.id} className="p-2.5 bg-muted/30 rounded-md shadow-sm">
                            <p className="font-semibold text-primary">{prod.name} <span className="text-xs text-muted-foreground font-normal">- ${prod.price.toFixed(2)}</span></p>
                             <p className="text-xs text-foreground/80 mt-0.5">{prod.description.substring(0,70)}...</p>
                            <div className="flex gap-2 mt-2">
                               <Button size="sm" variant="outline" onClick={() => {setInput(`Tell me more about ${prod.name}`); setTimeout(() => document.getElementById('chat-submit-button')?.click(),0);}} className="text-xs h-7">
                                <ExternalLink size={12} className="mr-1.5"/> Details
                              </Button>
                              <Button size="sm" onClick={() => addToCart(prod, 1)} className="text-xs h-7 bg-primary hover:bg-primary/90" disabled={prod.stock === 0}>
                                <PlusCircle size={12} className="mr-1.5"/> Add to Cart
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

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
      {selectedPractitionerForBooking && (
        <BookAppointmentModal
          practitioner={selectedPractitionerForBooking}
          open={isBookingModalOpen}
          onOpenChange={setIsBookingModalOpen}
          initialDate={initialBookingDate}
          initialTime={initialBookingTime}
        />
      )}
      {selectedPractitionerForInfo && (
        <PractitionerInfoModal
            practitioner={selectedPractitionerForInfo}
            generatedImageUrl={selectedPractitionerForInfo.imageUrl || `https://randomuser.me/api/portraits/${selectedPractitionerForInfo.gender === 'male' ? 'men' : 'women'}/${parseInt(selectedPractitionerForInfo.id) % 100}.jpg`}
            open={isInfoModalOpen}
            onOpenChange={setIsInfoModalOpen}
        />
      )}
    </>
  );
}
