
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Image as ImageIcon, 
  Bot, 
  User,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

interface EnhancedAIFlowerChatProps {
  onAddToCart?: (product: any) => void;
  imageGenerationMode?: boolean;
  onImageModeToggle?: (mode: boolean) => void;
}

export function EnhancedAIFlowerChat({ 
  onAddToCart, 
  imageGenerationMode = false,
  onImageModeToggle 
}: EnhancedAIFlowerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: imageGenerationMode 
        ? '🎨 Hello! I\'m in **Image Generation Mode**. Describe the flower arrangement you\'d like me to create for you, and I\'ll generate a beautiful custom image based on your description!'
        : '🌸 Hello! I\'m your **AI Flower Expert**. I can help you find the perfect flowers, create custom arrangements, and provide expert advice. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Update initial message when mode changes
    setMessages([{
      id: '1',
      role: 'assistant',
      content: imageGenerationMode 
        ? '🎨 Hello! I\'m in **Image Generation Mode**. Describe the flower arrangement you\'d like me to create for you, and I\'ll generate a beautiful custom image based on your description!'
        : '🌸 Hello! I\'m your **AI Flower Expert**. I can help you find the perfect flowers, create custom arrangements, and provide expert advice. How can I help you today?',
      timestamp: new Date()
    }]);
  }, [imageGenerationMode]);

  const callPerplexityAPI = async (prompt: string) => {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `You are a professional AI flower expert and customer service agent for Happy Flower shop. You are knowledgeable, helpful, and enthusiastic about flowers.

Your expertise includes:
- Flower types, meanings, and occasions
- Care instructions and tips
- Color combinations and arrangements
- Seasonal availability
- Wedding and event flowers
- Gift recommendations

Always respond in a friendly, professional manner using markdown formatting for better readability. Use flower emojis appropriately. Provide specific, actionable advice and recommendations.

Our available products include fresh flower bouquets, arrangements, plants, and custom designs with prices ranging from $25-150.

Be conversational but professional, like talking to a friend who's also a flower expert.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const generateImageWithRunway = async (prompt: string) => {
    try {
      // Call Runway API for image generation
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Beautiful flower arrangement: ${prompt}. Professional photography, high quality, vibrant colors, artistic composition.`,
          api_key: 'runwayGFbl7Zq056QP4dvJfmFCarSPcUVWdDkT'
        })
      });

      if (!response.ok) {
        throw new Error('Image generation failed');
      }

      const data = await response.json();
      
      // Save to database if user is logged in
      if (user) {
        try {
          await supabase.from('generated_images').insert({
            user_id: user.id,
            prompt: prompt,
            image_url: data.image_url,
            status: 'pending'
          });
        } catch (error) {
          console.error('Error saving generated image:', error);
        }
      }

      return data.image_url;
    } catch (error) {
      console.error('Image generation error:', error);
      // Fallback to a placeholder image
      return `https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&q=80&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response: string;
      let generatedImageUrl: string | null = null;

      if (imageGenerationMode) {
        // Generate image mode
        generatedImageUrl = await generateImageWithRunway(input);
        
        // Get AI description of the generated arrangement
        response = await callPerplexityAPI(
          `I've generated a custom flower arrangement image based on the request: "${input}". Please provide a detailed, enthusiastic description of this beautiful arrangement as if you're a professional florist. Include suggestions for occasions, care tips, and mention that customers can order this custom arrangement for approximately $75-95. Make it engaging and professional.`
        );
      } else {
        // Regular chat mode
        response = await callPerplexityAPI(input);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        image: generatedImageUrl || undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-coral-500" />
            <CardTitle className="text-coral-600">🌸 AI Flower Expert</CardTitle>
            {imageGenerationMode && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                🎨 Image Generation Mode
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png" />
                  <AvatarFallback className="bg-coral-100 text-coral-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`rounded-2xl p-3 ${
                    message.role === 'user'
                      ? 'bg-coral-500 text-white ml-auto'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.image && (
                    <div className="mb-3">
                      <img
                        src={message.image}
                        alt="Generated flower arrangement"
                        className="max-w-full h-auto rounded-lg"
                      />
                      {imageGenerationMode && message.role === 'assistant' && (
                        <Button 
                          size="sm" 
                          className="mt-2 w-full bg-coral-400 hover:bg-coral-500 text-white"
                          onClick={() => {
                            toast({
                              title: "Custom arrangement inquiry sent!",
                              description: "Our team will contact you with pricing and availability.",
                            });
                          }}
                        >
                          Order This Custom Arrangement
                        </Button>
                      )}
                    </div>
                  )}
                  <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 px-3">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png" />
                <AvatarFallback className="bg-coral-100 text-coral-600">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-2xl p-3">
                <Loader2 className="h-4 w-4 animate-spin text-coral-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                imageGenerationMode 
                  ? "Describe the flower arrangement you want me to generate..."
                  : "Ask about flowers, arrangements, or get recommendations..."
              }
              className="flex-1"
              disabled={isLoading}
            />
            
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-coral-500 hover:bg-coral-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {imageGenerationMode && (
            <div className="mt-2 text-sm text-purple-600 bg-purple-50 p-2 rounded-lg">
              🎨 **Image Generation Mode**: Describe your ideal flower arrangement and I'll create it for you!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
