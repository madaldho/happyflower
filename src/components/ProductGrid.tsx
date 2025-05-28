
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: 'bouquet' | 'arrangement' | 'plant' | 'gift';
  rating: number;
  isPopular?: boolean;
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Spring Sunrise Bouquet',
    price: 45,
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400',
    description: 'Vibrant orange and yellow flowers to brighten any day',
    category: 'bouquet',
    rating: 4.8,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Garden Fresh Arrangement',
    price: 65,
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400',
    description: 'Mixed seasonal flowers in a beautiful vase',
    category: 'arrangement',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Peaceful Pine Collection',
    price: 35,
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400',
    description: 'Elegant pine arrangements for a serene atmosphere',
    category: 'arrangement',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Sunset Romance Bouquet',
    price: 55,
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    description: 'Perfect for romantic occasions with warm tones',
    category: 'bouquet',
    rating: 4.9,
    isPopular: true,
  },
  {
    id: '5',
    name: 'Tranquil Waters Arrangement',
    price: 75,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
    description: 'Calming blue and white flowers with greenery',
    category: 'arrangement',
    rating: 4.6,
  },
  {
    id: '6',
    name: 'Happy Flower Special',
    price: 85,
    image: '/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png',
    description: 'Our signature arrangement inspired by our logo',
    category: 'gift',
    rating: 5.0,
    isPopular: true,
  },
];

const categories = ['all', 'bouquet', 'arrangement', 'plant', 'gift'];

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredProducts = products.filter(
    product => selectedCategory === 'all' || product.category === selectedCategory
  );

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  return (
    <section id="flowers" className="py-16 bg-gradient-sage">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            Our Beautiful Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handcrafted arrangements made with the freshest flowers, designed to bring joy to every occasion.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`capitalize ${
                selectedCategory === category 
                  ? 'bg-coral-400 hover:bg-coral-500' 
                  : 'border-coral-300 text-coral-600 hover:bg-coral-50'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="group overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {product.isPopular && (
                  <Badge className="absolute top-3 left-3 bg-coral-400 text-white">
                    Popular
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(product.id)}
                  className={`absolute top-3 right-3 ${
                    favorites.has(product.id) 
                      ? 'text-red-500 bg-white/80' 
                      : 'text-gray-600 bg-white/80'
                  } hover:bg-white`}
                >
                  <Heart 
                    className={`h-5 w-5 ${favorites.has(product.id) ? 'fill-current' : ''}`} 
                  />
                </Button>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-coral-500 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">{product.rating}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-coral-500">
                    ${product.price}
                  </span>
                  <Button 
                    onClick={() => onAddToCart(product)}
                    className="bg-coral-400 hover:bg-coral-500 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
