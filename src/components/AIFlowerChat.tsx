
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Image, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/ImageUploader';
import { AIResponseFormatter } from '@/components/AIResponseFormatter';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

interface AIFlowerChatProps {
  onFlowerRecommendation?: (recommendation: string) => void;
  onAddToCart?: (item: any) => void;
}

export function AIFlowerChat({ onFlowerRecommendation, onAddToCart }: AIFlowerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Happy Flower AI, your personal flower expert! 🌸 I can help you:\n\n• Find perfect flowers for any occasion\n• Recommend beautiful arrangements\n• Generate custom flower images\n• Answer questions about flower care\n\nYou can also upload images for image-to-image generation!\n\nWhat kind of flowers are you looking for today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageUUID, setSelectedImageUUID] = useState<string>('');
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `You are Happy Flower AI, an expert florist assistant. When recommending flowers, ALWAYS format your response with clear data structure like this:

nama: [Flower Name]
deskripsi: [Detailed description]
harga: $[Price]
warna: [Color description]
ukuran: [Size like Small/Medium/Large]
style: [Style like Modern/Classic/Rustic]

For multiple flowers, repeat this format for each one. Be specific about prices, colors, and sizes. Make responses easy to read with clear paragraphs.`
            },
            {
              role: 'user',
              content: currentPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I had trouble understanding that. Could you please rephrase your question?';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      onFlowerRecommendation?.(aiResponse);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCustomImage = async () => {
    if (!inputMessage.trim()) {
      toast({
        title: "Please enter a description",
        description: "Describe the flower arrangement you'd like to see generated.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: `🎨 Generate custom flower image: ${inputMessage}`,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const imagePrompt = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call Runware image generation
      const response = await fetch('/api/generate-image-runware', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `beautiful flower arrangement, ${imagePrompt}, high quality, detailed, professional photography, vibrant colors`,
          useImageToImage: selectedImageUUID ? true : false,
          baseImageUUID: selectedImageUUID
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I've created a custom flower arrangement based on your description! Here's what I generated:\n\n${data.prompt}\n\nWould you like to add this custom arrangement to your cart for $75?`,
        isUser: false,
        timestamp: new Date(),
        imageUrl: data.image_url
      };

      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "Custom Image Generated!",
        description: "Your personalized flower arrangement has been created.",
      });
    } catch (error) {
      console.error('Image generation error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I had trouble generating the custom image. Please try again.',
        isUser: false,
        timestamp: new Date()
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

  return (
    <Card className="w-full h-96 flex flex-col shadow-lg border-coral-200">
      <div className="p-4 border-b bg-gradient-to-r from-coral-50 to-pink-50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-coral-500" />
          <h3 className="font-semibold text-coral-700">Happy Flower AI Expert</h3>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="p-3 border-b bg-gray-50">
        <ImageUploader
          onImageUpload={() => {}}
          showPinIcon={true}
          onImageSelect={setSelectedImageUUID}
          className="h-20"
        />
        {selectedImageUUID && (
          <p className="text-xs text-blue-600 mt-1">
            📌 Base image selected for image-to-image generation
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-coral-25">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-coral-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-md border border-coral-100 rounded-bl-sm'
              }`}
            >
              <div className="flex items-start gap-2">
                {!message.isUser && <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-coral-500" />}
                {message.isUser && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                <div className="flex-1">
                  {message.isUser ? (
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  ) : (
                    <AIResponseFormatter text={message.text} onAddToCart={onAddToCart} />
                  )}
                  {message.imageUrl && (
                    <div className="mt-3">
                      <img 
                        src={message.imageUrl} 
                        alt="Generated flower arrangement" 
                        className="w-full max-w-xs rounded-lg shadow-md"
                      />
                      <Button 
                        size="sm" 
                        className="mt-2 bg-coral-400 hover:bg-coral-500 text-white"
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart({
                              id: `custom-${Date.now()}`,
                              name: 'Custom AI Arrangement',
                              price: 75,
                              image_url: message.imageUrl,
                              image: message.imageUrl,
                              description: 'AI-generated custom flower arrangement',
                              category: 'Custom',
                              quantity: 1
                            });
                          }
                          toast({
                            title: "Added to Cart!",
                            description: "Custom arrangement added to your cart for $75.",
                          });
                        }}
                      >
                        Add Custom Arrangement to Cart - $75
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg shadow-md border border-coral-100">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-coral-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-coral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about flowers, occasions, or describe a custom arrangement..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            className="bg-coral-400 hover:bg-coral-500"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button 
            onClick={generateCustomImage} 
            disabled={isLoading || !inputMessage.trim()}
            className="bg-purple-500 hover:bg-purple-600"
            title="Generate Custom Flower Image"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Try asking: "Romantic anniversary flowers" or upload an image for manipulation
        </p>
      </div>
    </Card>
  );
}
