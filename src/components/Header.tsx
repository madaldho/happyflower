
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Menu, User } from 'lucide-react';

interface HeaderProps {
  cartItems: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

export function Header({ cartItems, onCartClick, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png" 
                alt="Happy Flower Logo" 
                className="h-8 w-8"
              />
              <span className="font-serif text-xl font-semibold text-foreground hidden sm:inline">
                Happy Flower
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-sm font-medium hover:text-coral-500 transition-colors">
              Home
            </a>
            <a href="#flowers" className="text-sm font-medium hover:text-coral-500 transition-colors">
              Flowers
            </a>
            <a href="#ai-expert" className="text-sm font-medium hover:text-coral-500 transition-colors">
              AI Expert
            </a>
            <a href="#about" className="text-sm font-medium hover:text-coral-500 transition-colors">
              About
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-coral-500 transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-coral-400"
                >
                  {cartItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
