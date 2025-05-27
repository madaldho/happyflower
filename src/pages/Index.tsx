
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid, type Product } from '@/components/ProductGrid';
import { AIChat } from '@/components/AIChat';
import { CartDrawer, type CartItem } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
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
      return [...prev, { ...product, quantity: 1 }];
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

  const handleExploreClick = () => {
    document.getElementById('flowers')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMenuClick = () => {
    // Could implement mobile menu here
    console.log('Menu clicked');
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    toast({
      title: "Order placed successfully!",
      description: "Thank you for your order. We'll send you a confirmation email soon.",
    });
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItems={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={handleMenuClick}
      />
      
      <main>
        <Hero onExploreClick={handleExploreClick} />
        <ProductGrid onAddToCart={addToCart} />
        
        <section id="ai-expert" className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                AI Flower Expert
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get personalized flower recommendations from our AI expert. 
                Ask about occasions, flower meanings, care tips, and more!
              </p>
            </div>
            <AIChat />
          </div>
        </section>

        <About />
        <Contact />
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        total={cartTotal}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
};

export default Index;
