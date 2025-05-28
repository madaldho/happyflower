
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '@/components/ImageUploader';
import { 
  Send, 
  Image as ImageIcon, 
  Bot, 
  User,
  Loader2,
  LogIn,
  ShoppingCart,
  Pin
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
  estimatedPrice?: number;
  canOrder?: boolean;
  flowerData?: {
    name: string;
    description: string;
    price: number;
    color: string;
    size: string;
    style: string;
  };
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [internalImageMode, setInternalImageMode] = useState(imageGenerationMode);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (user) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: internalImageMode 
          ? '🎨 Hello! I\'m in **Image Generation Mode**. Upload an image or describe the flower arrangement you\'d like me to create for you, and I\'ll generate a beautiful custom image with detailed pricing information!'
          : '🌸 Hello! I\'m your **AI Flower Expert**. I can help you find the perfect flowers, create custom arrangements, and provide expert advice. How can I help you today?',
        timestamp: new Date()
      }]);
    } else {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '🔒 Please log in to chat with our AI Flower Expert and access personalized recommendations.',
        timestamp: new Date()
      }]);
    }
  }, [internalImageMode, user]);

  const calculateEstimatedPrice = (prompt: string, imageGenerated: boolean = false) => {
    const basePrice = 45;
    let multiplier = 1;

    if (prompt.toLowerCase().includes('premium') || prompt.toLowerCase().includes('luxury')) multiplier += 0.5;
    if (prompt.toLowerCase().includes('large') || prompt.toLowerCase().includes('big')) multiplier += 0.3;
    if (prompt.toLowerCase().includes('wedding') || prompt.toLowerCase().includes('special')) multiplier += 0.4;
    
    const flowerTypes = ['rose', 'lily', 'tulip', 'orchid', 'sunflower', 'carnation', 'peony'];
    const mentionedFlowers = flowerTypes.filter(flower => 
      prompt.toLowerCase().includes(flower)
    ).length;
    
    if (mentionedFlowers > 2) multiplier += 0.2 * mentionedFlowers;
    if (imageGenerated) multiplier += 0.3;

    return Math.round(basePrice * multiplier);
  };

  const extractFlowerData = (prompt: string, price: number) => {
    const flowerTypes = ['rose', 'lily', 'tulip', 'orchid', 'sunflower', 'carnation', 'peony'];
    const colors = ['red', 'white', 'pink', 'yellow', 'purple', 'blue', 'orange', 'mixed'];
    const sizes = ['small', 'medium', 'large', 'extra large'];
    const styles = ['bouquet', 'arrangement', 'centerpiece', 'bridal', 'romantic', 'modern', 'classic'];

    const foundFlower = flowerTypes.find(flower => prompt.toLowerCase().includes(flower)) || 'Mixed Flowers';
    const foundColor = colors.find(color => prompt.toLowerCase().includes(color)) || 'Colorful';
    const foundSize = sizes.find(size => prompt.toLowerCase().includes(size)) || 'Medium';
    const foundStyle = styles.find(style => prompt.toLowerCase().includes(style)) || 'Bouquet';

    return {
      name: `Custom ${foundFlower.charAt(0).toUpperCase() + foundFlower.slice(1)} ${foundStyle.charAt(0).toUpperCase() + foundStyle.slice(1)}`,
      description: prompt,
      price: price,
      color: foundColor.charAt(0).toUpperCase() + foundColor.slice(1),
      size: foundSize.charAt(0).toUpperCase() + foundSize.slice(1),
      style: foundStyle.charAt(0).toUpperCase() + foundStyle.slice(1)
    };
  };

  const toggleImageMode = () => {
    const newMode = !internalImageMode;
    setInternalImageMode(newMode);
    if (onImageModeToggle) {
      onImageModeToggle(newMode);
    }
  };

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
- Professional marketing and customer service

Always respond in a friendly, professional manner using markdown formatting for better readability. Use flower emojis appropriately. Provide specific, actionable advice and recommendations.

When describing flowers or arrangements, format your response with clear sections including:
- **Name**: Clear product name
- **Description**: Detailed description with care tips
- **Recommended Price**: Based on complexity and materials
- **Colors Available**: List color options
- **Size Options**: Small, Medium, Large descriptions
- **Style**: Bouquet, Arrangement, Centerpiece, etc.
- **Best For**: Occasions and recipients

Our available products include fresh flower bouquets, arrangements, plants, and custom designs with prices ranging from $25-150.

Be conversational but professional, like talking to a friend who's also a flower expert. Act as a professional marketing customer service agent.`
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

  const generateImageWithRunware = async (prompt: string, baseImage?: string) => {
    try {
      const requestBody: any = {
        prompt,
        useImageToImage: !!baseImage
      };

      if (baseImage && baseImage.startsWith('runware://')) {
        requestBody.baseImageUUID = baseImage.replace('runware://', '');
      }

      const response = await supabase.functions.invoke('generate-image-runware', {
        body: requestBody
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      
      if (user && data.image_url) {
        try {
          await supabase.from('generated_images').insert({
            user_id: user.id,
            prompt: prompt,
            image_url: data.image_url,
            status: 'completed'
          });
        } catch (error) {
          console.error('Error saving generated image:', error);
        }
      }

      return data.image_url;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  };

  const handleOrder = async (message: Message) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: user.email?.split('@')[0] || 'Customer',
          customer_email: user.email,
          delivery_address: 'To be filled during checkout',
          total_amount: message.estimatedPrice || 0,
          estimated_price: message.estimatedPrice,
          status: 'waiting_admin_confirmation',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order Created!",
        description: `Order #${order.id.slice(0, 8)} created. You'll be notified when admin confirms the price.`,
      });

      navigate('/checkout', { 
        state: { 
          orderInfo: {
            ...order,
            items: [{
              name: message.flowerData?.name || 'Custom Flower Arrangement',
              description: message.content,
              image: message.image,
              price: message.estimatedPrice,
              quantity: 1
            }]
          }
        } 
      });

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !uploadedImageUrl) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to chat with our AI expert.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: uploadedImageUrl ? `${input}\n[Image uploaded for reference]` : input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = input;
    setInput('');
    setIsLoading(true);

    try {
      let response: string;
      let generatedImageUrl: string | null = null;
      let estimatedPrice: number | undefined;
      let flowerData: any;

      if (internalImageMode) {
        generatedImageUrl = await generateImageWithRunware(currentPrompt, uploadedImageUrl);
        estimatedPrice = calculateEstimatedPrice(currentPrompt, true);
        flowerData = extractFlowerData(currentPrompt, estimatedPrice);
        
        response = await callPerplexityAPI(
          `I've generated a custom flower arrangement image based on the request: "${currentPrompt}". Please provide a detailed, enthusiastic description of this beautiful arrangement as if you're a professional florist. Format your response with clear sections for Name, Description, Price, Colors, Size, and Style. Include suggestions for occasions, care tips, and mention that customers can order this exact arrangement. Make it engaging and professional like a marketing customer service agent. Keep it concise but informative.`
        );
      } else {
        response = await callPerplexityAPI(currentPrompt);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        image: generatedImageUrl || undefined,
        timestamp: new Date(),
        estimatedPrice: estimatedPrice,
        canOrder: !!generatedImageUrl,
        flowerData: flowerData
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

  if (!user) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-coral-500" />
              <CardTitle className="text-coral-600">🌸 AI Flower Expert</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <LogIn className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-6">
            Please log in to chat with our AI Flower Expert and get personalized recommendations.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-coral-500 hover:bg-coral-600"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-coral-500" />
            <CardTitle className="text-coral-600">🌸 AI Flower Expert</CardTitle>
            {internalImageMode && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                🎨 Image Mode
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
                      
                      {message.estimatedPrice && message.flowerData && (
                        <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="space-y-2 mb-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><strong>Name:</strong> {message.flowerData.name}</div>
                              <div><strong>Price:</strong> ${message.estimatedPrice}</div>
                              <div><strong>Color:</strong> {message.flowerData.color}</div>
                              <div><strong>Size:</strong> {message.flowerData.size}</div>
                              <div className="col-span-2"><strong>Style:</strong> {message.flowerData.style}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-coral-500 hover:bg-coral-600 text-white"
                              onClick={() => handleOrder(message)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Order Now
                            </Button>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            *Final price may be adjusted by admin based on complexity
                          </p>
                        </div>
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

        <div className="border-t p-4 flex-shrink-0 space-y-3">
          {internalImageMode && (
            <ImageUploader 
              onImageUpload={setUploadedImageUrl}
              currentImage={uploadedImageUrl}
            />
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Button
              type="button"
              onClick={toggleImageMode}
              variant={internalImageMode ? "default" : "outline"}
              className={`flex-shrink-0 ${internalImageMode ? "bg-purple-500 hover:bg-purple-600" : "border-purple-300 text-purple-600 hover:bg-purple-50"}`}
              size="sm"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  internalImageMode 
                    ? "Describe the flower arrangement you want me to generate..."
                    : "Ask about flowers, arrangements, or get recommendations..."
                }
                className="pr-10"
                disabled={isLoading}
              />
              {uploadedImageUrl && (
                <Pin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500" />
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || (!input.trim() && !uploadedImageUrl)}
              className="bg-coral-500 hover:bg-coral-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {internalImageMode && (
            <div className="text-sm text-purple-600 bg-purple-50 p-2 rounded-lg">
              🎨 **Image Generation Mode**: Upload an image and/or describe your ideal flower arrangement for AI-powered creation with detailed pricing!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
