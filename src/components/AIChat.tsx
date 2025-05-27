
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI flower expert. I can help you find the perfect flowers for any occasion. What are you looking for today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);

  const sendMessage = async () => {
    if (!input.trim() || !apiKey.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful flower expert assistant for Happy Flower shop. Provide personalized flower recommendations based on occasions, colors, meanings, and care tips. Be friendly, knowledgeable, and concise. Always suggest specific flowers available in a typical flower shop.',
            },
            {
              role: 'user',
              content: input,
            },
          ],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000,
          return_images: false,
          return_related_questions: false,
          frequency_penalty: 1,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not process your request.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please check your API key and try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (showApiInput) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-coral-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">AI Flower Expert</h3>
            <p className="text-sm text-muted-foreground">Enter your Perplexity API key to get started</p>
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your Perplexity API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button 
              onClick={() => setShowApiInput(false)} 
              className="w-full bg-coral-400 hover:bg-coral-500"
              disabled={!apiKey.trim()}
            >
              Start Chatting
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Get your API key from{' '}
            <a 
              href="https://docs.perplexity.ai/guides/getting-started" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-coral-400 hover:underline"
            >
              Perplexity AI
            </a>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px] max-w-2xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-coral-400" />
          <h3 className="font-semibold">AI Flower Expert</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowApiInput(true)}
          className="text-xs"
        >
          Change API Key
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-coral-500" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-coral-400 text-white'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-sage-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-coral-500 animate-spin" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about flowers, occasions, care tips..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-coral-400 hover:bg-coral-500"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
