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

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  description: string;
  category: string;
  quantity?: number;
}

interface AIFlowerChatProps {
  onFlowerRecommendation?: (recommendation: string) => void;
  onAddToCart?: (item: Product) => void;
}

export function AIFlowerChat({ onFlowerRecommendation, onAddToCart }: AIFlowerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🌸 Halo! Saya CS Happy Flower Shop. Saya siap membantu Anda menemukan bunga sempurna untuk setiap momen spesial! Saya bisa:\n\n• Merekomendasikan bunga untuk berbagai acara\n• Menyarankan rangkaian bunga yang indah\n• Membuat gambar bunga kustom\n• Menjawab pertanyaan tentang perawatan bunga\n\nAnda juga bisa upload gambar sebagai referensi!\n\nBunga apa yang Anda cari hari ini?",
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
              content: `Anda adalah CS profesional Happy Flower Shop, ahli bunga yang ramah. Gaya bahasa Anda santai, profesional, dan manusiawi - seperti CS toko bunga sungguhan. Gunakan bahasa yang sama dengan pelanggan (Indonesia/Inggris/lainnya).

Saat merekomendasikan bunga, SELALU format respons Anda dengan struktur data yang jelas seperti ini:

nama: [Nama Bunga]
deskripsi: [Deskripsi detail]
harga: Rp [Harga]
warna: [Deskripsi warna]
ukuran: [Ukuran seperti Kecil/Sedang/Besar]
gaya: [Gaya seperti Modern/Klasik/Rustic]

Untuk beberapa bunga, ulangi format ini untuk masing-masing. Berikan harga dalam format Rupiah (Rp). Buat respons mudah dibaca dengan paragraf yang jelas. Jawaban harus ringkas tapi informatif.

Jika pelanggan menunjukkan gambar, berikan analisis detail tentang bunga dalam gambar (jenis bunga, warna, gaya rangkaian) dan berikan rekomendasi serupa.

Jangan pernah menyebut diri Anda sebagai AI - Anda adalah CS toko bunga yang sesungguhnya.`
            },
            {
              role: 'user',
              content: currentPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'Maaf, saya kesulitan memahami permintaan Anda. Bisa tolong dijelaskan kembali?';

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
        text: 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Kesalahan Koneksi",
        description: "Tidak dapat terhubung ke layanan AI. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCustomImage = async () => {
    if (!inputMessage.trim()) {
      toast({
        title: "Masukkan deskripsi",
        description: "Deskripsikan rangkaian bunga yang ingin Anda lihat.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: `🎨 Buat gambar bunga kustom: ${inputMessage}`,
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
        text: `Saya telah membuat rangkaian bunga sesuai deskripsi Anda! Berikut hasilnya:\n\n${data.prompt}\n\nApakah Anda ingin menambahkan rangkaian bunga kustom ini ke keranjang seharga Rp 750.000?`,
        isUser: false,
        timestamp: new Date(),
        imageUrl: data.image_url
      };

      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "Gambar Kustom Dibuat!",
        description: "Rangkaian bunga personal Anda telah dibuat.",
      });
    } catch (error) {
      console.error('Image generation error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, saya kesulitan membuat gambar kustom. Silakan coba lagi.',
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
          <h3 className="font-semibold text-coral-700">CS Happy Flower Shop</h3>
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
            📌 Gambar dasar dipilih untuk referensi
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
                        alt="Rangkaian bunga yang dibuat" 
                        className="w-full max-w-xs rounded-lg shadow-md"
                      />
                      <Button 
                        size="sm" 
                        className="mt-2 bg-coral-400 hover:bg-coral-500 text-white"
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart({
                              id: `custom-${Date.now()}`,
                              name: 'Rangkaian Bunga Kustom AI',
                              price: 750000,
                              image_url: message.imageUrl,
                              image: message.imageUrl,
                              description: 'Rangkaian bunga kustom yang dibuat dengan AI',
                              category: 'Custom',
                              quantity: 1
                            });
                          }
                          toast({
                            title: "Ditambahkan ke Keranjang!",
                            description: "Rangkaian kustom ditambahkan ke keranjang Anda seharga Rp 750.000.",
                          });
                        }}
                      >
                        Tambahkan ke Keranjang - Rp 750.000
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
            placeholder="Tanya tentang bunga, acara, atau deskripsikan rangkaian kustom..."
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
            title="Buat Gambar Bunga Kustom"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Coba tanyakan: "Bunga romantis untuk anniversary" atau upload gambar untuk referensi
        </p>
      </div>
    </Card>
  );
}
