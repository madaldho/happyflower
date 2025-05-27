import { useState } from 'react';
import { Header } from '@/components/Header';
import { AIFlowerChat } from '@/components/AIFlowerChat';
import { FlowerProducts } from '@/components/FlowerProducts';
import { CartDrawer, type CartItem } from '@/components/CartDrawer';
import { SimpleCheckout } from '@/components/SimpleCheckout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Flower2, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        ...product, 
        image: product.image_url,
        rating: 4.8,
        quantity: 1 
      }];
    });

    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    toast({
      title: "Order placed successfully!",
      description: "Thank you for your order. We'll contact you soon for delivery confirmation.",
    });
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50">
      <Header 
        cartItems={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => console.log('Menu clicked')}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png" 
              alt="Happy Flower" 
              className="h-16 w-16"
            />
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-800">
              Happy Flower
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Beautiful flowers for every occasion. Ask our AI expert for personalized recommendations!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setShowAIChat(!showAIChat)}
              className="bg-coral-400 hover:bg-coral-500 text-white px-8 py-3 text-lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {showAIChat ? 'Hide AI Expert' : 'Ask AI Expert'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-coral-300 text-coral-600 hover:bg-coral-50 px-8 py-3 text-lg"
            >
              <Flower2 className="h-5 w-5 mr-2" />
              Browse Flowers
            </Button>
          </div>
        </section>

        {/* AI Chat Section */}
        {showAIChat && (
          <section className="mb-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-serif font-bold text-center mb-6">
                AI Flower Expert
              </h2>
              <AIFlowerChat />
            </div>
          </section>
        )}

        {/* Products Section */}
        <section id="products" className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">
            Our Beautiful Collection
          </h2>
          <FlowerProducts onAddToCart={addToCart} cartItems={cartItems} />
        </section>

        {/* Simple Footer */}
        <footer className="text-center py-8 border-t border-coral-200 mt-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png" 
              alt="Happy Flower" 
              className="h-8 w-8"
            />
            <span className="font-serif text-xl font-semibold text-coral-600">Happy Flower</span>
          </div>
          <p className="text-gray-600">
            Beautiful flowers delivered with love • Payment on delivery
          </p>
        </footer>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <SimpleCheckout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
      />

      {/* Floating Cart Button for Mobile */}
      {cartItemCount > 0 && (
        <Button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-coral-500 hover:bg-coral-600 text-white rounded-full p-4 shadow-lg md:hidden"
          size="lg"
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {cartItemCount}
          </span>
        </Button>
      )}
    </div>
  );
};

export default Index;
