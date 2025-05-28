
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
  Maximize2, 
  Minimize2, 
  Bot, 
  User,
  Loader2,
  X
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
}

export function EnhancedAIFlowerChat({ onAddToCart }: EnhancedAIFlowerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🌸 Hello! I\'m your AI flower expert. I can help you find the perfect flowers, create custom arrangements, and even generate unique flower images based on your preferences. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const callPerplexityAPI = async (prompt: string, imageData?: string) => {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageData ? 'sonar-pro' : 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI flower assistant for Happy Flower shop. You help customers:
            1. Find perfect flowers for any occasion
            2. Create custom flower arrangements
            3. Provide flower care tips
            4. Generate flower images based on descriptions
            5. Recommend products from our store
            
            Always be helpful, enthusiastic, and use flower emojis. If users want specific products, suggest they can add items to cart. For image generation requests, create detailed, beautiful descriptions.
            
            Our available categories: bouquet, arrangement, plant, gift
            Price range: $25-150
            
            Respond in a friendly, professional manner with markdown formatting for better readability.`
          },
          {
            role: 'user',
            content: imageData ? [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageData } }
            ] : prompt
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

  const generateImage = async (prompt: string) => {
    // In a real implementation, you would call an image generation API
    // For demo purposes, we'll simulate this
    const imagePrompt = `Beautiful flower arrangement: ${prompt}`;
    
    // Save to database
    if (user) {
      try {
        await supabase.from('generated_images').insert({
          user_id: user.id,
          prompt: imagePrompt,
          image_url: `https://picsum.photos/400/400?random=${Date.now()}`, // Demo URL
          status: 'pending'
        });
      } catch (error) {
        console.error('Error saving generated image:', error);
      }
    }

    return `https://picsum.photos/400/400?random=${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: imagePreview || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response: string;
      let generatedImageUrl: string | null = null;

      if (imageMode && !selectedImage) {
        // Generate image mode
        generatedImageUrl = await generateImage(input);
        response = `🎨 I've generated a beautiful flower image based on your request: "${input}". The image shows a stunning arrangement that would be perfect for your needs! 

Would you like me to help you find similar flowers in our store or create a custom arrangement based on this design?`;
      } else {
        // Regular chat or image analysis
        const imageData = selectedImage ? await convertImageToBase64(selectedImage) : undefined;
        response = await callPerplexityAPI(input, imageData);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        image: generatedImageUrl || undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Reset image state
      removeImage();
      setImageMode(false);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'max-w-4xl mx-auto'} transition-all duration-300`}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-coral-500" />
            <CardTitle className="text-coral-600">🌸 AI Flower Expert</CardTitle>
            {imageMode && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                🎨 Image Generation Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImageMode(!imageMode)}
              className={imageMode ? 'bg-purple-100 text-purple-700' : ''}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`${isFullscreen ? 'flex-1 flex flex-col' : ''} p-0`}>
        <div className={`${isFullscreen ? 'flex-1' : 'h-96'} overflow-y-auto p-4 space-y-4`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
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
                    <img
                      src={message.image}
                      alt="Chat image"
                      className="max-w-full h-auto rounded-lg mb-2"
                    />
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
                <Avatar className="h-8 w-8">
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

        <div className="border-t p-4">
          {imagePreview && (
            <div className="relative mb-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-20 h-20 object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            {!imageMode && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            )}

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                imageMode 
                  ? "Describe the flower image you want to generate..."
                  : "Ask about flowers, arrangements, or upload an image..."
              }
              className="flex-1"
              disabled={isLoading}
            />
            
            <Button 
              type="submit" 
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="bg-coral-500 hover:bg-coral-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {imageMode && (
            <div className="mt-2 text-sm text-purple-600 bg-purple-50 p-2 rounded-lg">
              🎨 Image Generation Mode: Describe the flower arrangement you want me to create!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
