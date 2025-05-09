import ChatInterface from '@/components/chatbot/ChatInterface';

export default function ChatbotPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[calc(100vh-120px)]"> 
      {/* Adjust height based on header/footer or use fixed height */}
      <ChatInterface />
    </div>
  );
}
