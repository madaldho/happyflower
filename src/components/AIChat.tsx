import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, User, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  products?: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

// API key yang sudah disediakan
const PERPLEXITY_API_KEY = "pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Ganti dengan API key yang benar

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! Welcome to Happy Flower Shop! 🌸\n\nHow can I help you find special flowers or arrangements today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Ambil data produk dari Supabase
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
        } else if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

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
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a professional customer service representative for Happy Flower Shop. Provide personalized flower recommendations based on occasion, color, meaning, and care tips. Use a friendly yet professional tone, keep responses concise but clear, like a shop assistant chatting with customers. Avoid lengthy or verbose answers. Match the customer\'s language (English/other). If customers ask about specific products, refer to our popular collection (roses, lilies, tulips, orchids, sunflowers, etc.) with prices ranging from $150-$500. Give only relevant and brief information. Don\'t identify yourself as AI. You are a human flower shop CS representative.',
            },
            {
              role: 'user',
              content: input,
            },
          ],
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 500,
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
      const aiResponse = data.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';

      // Cek apakah respons AI menyebutkan produk tertentu
      const matchingProducts = findRelevantProducts(input, aiResponse);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        products: matchingProducts.length > 0 ? matchingProducts : undefined,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, terjadi kesalahan. Mohon coba lagi nanti.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const findRelevantProducts = (userQuery: string, aiResponse: string): Product[] => {
    // Gabungkan query pengguna dan respons AI untuk pencarian yang lebih baik
    const combinedText = (userQuery + ' ' + aiResponse).toLowerCase();
    
    // Filter produk berdasarkan kemunculan nama produk dalam teks
    return products.filter(product => {
      const productName = product.name.toLowerCase();
      return combinedText.includes(productName);
    }).slice(0, 3); // Batasi hanya 3 produk
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCheckout = () => {
    // Implementasi checkout dapat ditambahkan di sini
    alert(`Checkout untuk ${selectedProduct?.name}`);
    setSelectedProduct(null);
  };

  if (selectedProduct) {
    return (
      <Card className="flex flex-col h-[500px] max-w-2xl mx-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-coral-400" />
            <h3 className="font-semibold">Detail Produk</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedProduct(null)}
            className="text-xs"
          >
            Kembali ke Chat
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <img 
              src={selectedProduct.image_url || '/placeholder.svg'} 
              alt={selectedProduct.name}
              className="w-full md:w-1/2 rounded-lg h-64 object-cover" 
            />
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-coral-500">{selectedProduct.name}</h2>
              <p className="text-muted-foreground">{selectedProduct.description}</p>
              <p className="text-2xl font-bold">Rp {selectedProduct.price.toLocaleString()}</p>
              <Button 
                onClick={handleCheckout}
                className="w-full bg-coral-400 hover:bg-coral-500"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Checkout Sekarang
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px] max-w-2xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-coral-400" />
          <h3 className="font-semibold">CS Happy Flower Shop</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
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
              
              {/* Tampilkan produk terkait jika ada */}
              {message.products && message.products.length > 0 && (
                <div className="mt-2 ml-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {message.products.map((product) => (
                    <div 
                      key={product.id} 
                      className="border rounded-lg p-2 cursor-pointer hover:border-coral-400"
                      onClick={() => handleProductSelect(product)}
                    >
                      <img 
                        src={product.image_url || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-full h-24 object-cover rounded-md mb-2" 
                      />
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-coral-500 text-sm font-bold">Rp {product.price.toLocaleString()}</p>
                    </div>
                  ))}
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
                <p className="text-sm text-muted-foreground">Mengetik...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about flowers, events, care tips..."
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
