
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export function Hero({ onExploreClick }: HeroProps) {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-coral">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-coral-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-peach-200/30 rounded-full blur-xl animate-float animate-delay-200"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-sage-200/30 rounded-full blur-xl animate-float animate-delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-coral-300/20 rounded-full blur-xl animate-float animate-delay-300"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png" 
                alt="Happy Flower Logo" 
                className="h-24 w-24 animate-pulse-soft"
              />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
              <span className="text-gradient">Beautiful Flowers</span>
              <br />
              <span className="text-sage-700">Powered by AI</span>
            </h1>
          </div>
          
          <div className="animate-slide-up animate-delay-200">
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover the perfect flowers for every moment with our AI-powered recommendations. 
              Fresh, beautiful, and delivered with love.
            </p>
          </div>

          <div className="animate-slide-up animate-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={onExploreClick}
              className="bg-coral-400 hover:bg-coral-500 text-white font-semibold px-8 py-4 rounded-full shadow-soft transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Explore Flowers
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('ai-expert')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-coral-300 text-coral-600 hover:bg-coral-50 font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              AI Expert
            </Button>
          </div>

          <div className="animate-slide-up animate-delay-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-coral-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">Personalized flower suggestions</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-sage-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Fresh & Beautiful</h3>
                <p className="text-sm text-muted-foreground">Hand-picked daily arrangements</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-peach-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowRight className="h-6 w-6 text-peach-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Same-day delivery available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-coral-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-coral-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
