import { useState } from 'react';
import { Header } from '@/components/Header';
import { EnhancedAIFlowerChat } from '@/components/EnhancedAIFlowerChat';
import { FlowerProducts } from '@/components/FlowerProducts';
import { CartDrawer } from '@/components/CartDrawer';
import { AuthModal } from '@/components/AuthModal';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, Flower2, ShoppingBag, User, Sparkles, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { CartItem } from '@/types/cart';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const { user, profile, isAdmin, isSeller, signOut } = useAuth();
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
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        image: product.image_url,
        description: product.description,
        category: product.category,
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
    if (quantity === 0) {
      removeItem(productId);
      return;
    }
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
    navigate('/checkout', { 
      state: { 
        cartItems, 
        onOrderComplete: () => {
          setCartItems([]);
          toast({
            title: "Order placed successfully!",
            description: "Thank you for your order. We'll contact you soon!",
          });
        }
      } 
    });
  };

  const handleLogin = (userData: any) => {
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50">
      {/* Header with user info */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png" 
                alt="Happy Flower" 
                className="h-10 w-10"
              />
              <h1 className="text-2xl font-serif font-bold text-coral-600">
                Happy Flower
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {(isAdmin || isSeller) && (
                    <Link to="/admin">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-coral-600 hover:bg-coral-50"
                        aria-label="Admin Panel"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{profile?.full_name || user.email}</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-coral-300 text-coral-600 hover:bg-coral-50"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
              
              <CartDrawer
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </header>
      
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
            <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            🌸 Beautiful flowers for every occasion with AI-powered recommendations! 
            Chat with our smart assistant, get custom arrangements, and enjoy same-day delivery.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate('/chat')}
              className="bg-gradient-to-r from-coral-400 to-pink-500 hover:from-coral-500 hover:to-pink-600 text-white px-8 py-3 text-lg shadow-lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              🤖 Chat with AI Expert
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
          
          {user && (
            <div className="mt-4 text-coral-600">
              Welcome back, {profile?.full_name || user.email}! 👋
            </div>
          )}
        </section>
        
        {/* AI Chat Section */}
        {showAIChat && (
          <section className="mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-serif font-bold text-coral-600 mb-2">
                  🤖 AI Flower Expert
                </h2>
                <p className="text-gray-600">
                  Get personalized recommendations, generate custom arrangements, and ask any flower-related questions!
                </p>
              </div>
              <EnhancedAIFlowerChat onAddToCart={addToCart} />
            </div>
          </section>
        )}

        {/* Products Section */}
        <section id="products" className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-center mb-2">
            🌺 Our Beautiful Collection
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Handcrafted with love, delivered fresh to your door
          </p>
          <FlowerProducts onAddToCart={addToCart} cartItems={cartItems} />
        </section>

        {/* Features Section */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg border border-coral-100">
          <h2 className="text-2xl font-serif font-bold text-center mb-8 text-coral-600">
            Why Choose Happy Flower? 🌸
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-coral-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-coral-600" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered Recommendations</h3>
              <p className="text-gray-600 text-sm">Our smart assistant helps you find the perfect flowers for any occasion</p>
            </div>
            <div className="text-center">
              <div className="bg-coral-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-coral-600" />
              </div>
              <h3 className="font-semibold mb-2">Custom Arrangements</h3>
              <p className="text-gray-600 text-sm">Generate and order personalized flower arrangements with AI</p>
            </div>
            <div className="text-center">
              <div className="bg-coral-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-coral-600" />
              </div>
              <h3 className="font-semibold mb-2">Easy Checkout</h3>
              <p className="text-gray-600 text-sm">Simple ordering with secure payment options for your convenience</p>
            </div>
          </div>
        </section>

        {/* Footer */}
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
            🌸 Beautiful flowers delivered with love • Secure payment • AI-powered recommendations 🤖
          </p>
        </footer>
      </main>

      {/* Modals and Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={() => {}}
      />

      {/* Floating Cart Button for Mobile */}
      {cartItemCount > 0 && (
        <Button
          onClick={() => {
            const cartTrigger = document.querySelector('[data-cart-trigger]') as HTMLElement;
            if (cartTrigger) cartTrigger.click();
          }}
          className="fixed bottom-6 right-6 bg-coral-500 hover:bg-coral-600 text-white rounded-full p-4 shadow-lg md:hidden z-50"
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
