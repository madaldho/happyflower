
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Leaf, Award, Clock } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Every arrangement is crafted with passion and attention to detail by our expert florists.',
    },
    {
      icon: Leaf,
      title: 'Fresh & Sustainable',
      description: 'We source our flowers from local growers and practice sustainable farming methods.',
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized for our exceptional quality and innovative AI-powered recommendation system.',
    },
    {
      icon: Clock,
      title: 'Same Day Delivery',
      description: 'Order before 2 PM for same-day delivery in our service areas.',
    },
  ];

  return (
    <section id="about" className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            About Happy Flower
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing the flower industry by combining traditional craftsmanship 
            with cutting-edge AI technology to help you find the perfect flowers for every moment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-coral-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-coral-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-coral rounded-2xl p-8 md:p-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png" 
                alt="Happy Flower Logo" 
                className="h-16 w-16"
              />
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-sage-800 mb-4">
              Our Story
            </h3>
            <p className="text-sage-700 text-lg leading-relaxed mb-6">
              Founded with a simple mission: to make beautiful flowers accessible to everyone. 
              Our AI-powered platform learns your preferences and suggests the perfect arrangements 
              for your unique style and occasions. Whether it's a birthday, anniversary, or just because, 
              we're here to help you express your feelings through the timeless beauty of flowers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-coral-600 mb-2">10K+</div>
                <div className="text-sage-700">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-coral-600 mb-2">50+</div>
                <div className="text-sage-700">Flower Varieties</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-coral-600 mb-2">24/7</div>
                <div className="text-sage-700">AI Assistant</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
