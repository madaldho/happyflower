
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { EnhancedAIFlowerChat } from '@/components/EnhancedAIFlowerChat';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [imageGenerationMode, setImageGenerationMode] = useState(false);

  const addToCart = (product: Product) => {
    // This would typically update a global cart state
    console.log('Adding to cart:', product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-serif font-bold text-coral-600">
                🤖 AI Flower Expert
              </h1>
            </div>
            
            <Button
              variant={imageGenerationMode ? "default" : "outline"}
              onClick={() => setImageGenerationMode(!imageGenerationMode)}
              className={imageGenerationMode ? "bg-purple-500 hover:bg-purple-600" : "border-purple-300 text-purple-600 hover:bg-purple-50"}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {imageGenerationMode ? 'Exit Image Mode' : 'Generate Images'}
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-120px)]">
        <div className="h-full">
          <EnhancedAIFlowerChat 
            onAddToCart={addToCart}
            imageGenerationMode={imageGenerationMode}
            onImageModeToggle={setImageGenerationMode}
          />
        </div>
      </div>

      {/* Fixed bottom button for image generation mode */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          variant={imageGenerationMode ? "default" : "outline"}
          onClick={() => setImageGenerationMode(!imageGenerationMode)}
          className={`rounded-full w-14 h-14 shadow-lg ${
            imageGenerationMode 
              ? "bg-purple-500 hover:bg-purple-600 text-white" 
              : "bg-white border-purple-300 text-purple-600 hover:bg-purple-50"
          }`}
        >
          <ImageIcon className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
