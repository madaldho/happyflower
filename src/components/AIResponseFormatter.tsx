
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flower2, Palette, DollarSign, Ruler, Star } from 'lucide-react';

interface FlowerData {
  name?: string;
  description?: string;
  price?: string;
  color?: string;
  size?: string;
  style?: string;
  rating?: string;
  category?: string;
}

interface AIResponseFormatterProps {
  text: string;
  onAddToCart?: (item: any) => void;
}

export function AIResponseFormatter({ text, onAddToCart }: AIResponseFormatterProps) {
  // Check if text contains flower data that should be formatted as a table
  const shouldFormatAsTable = text.includes('nama:') || text.includes('harga:') || text.includes('warna:');
  
  if (!shouldFormatAsTable) {
    // Format regular text with better paragraph breaks
    const formattedText = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');
    
    return (
      <div className="whitespace-pre-line text-sm leading-relaxed">
        {formattedText}
      </div>
    );
  }

  // Extract flower data from text
  const extractFlowerData = (text: string): FlowerData[] => {
    const flowers: FlowerData[] = [];
    const sections = text.split(/(?=nama:|Name:|NAMA:)/i);
    
    sections.forEach(section => {
      if (section.trim()) {
        const flower: FlowerData = {};
        
        // Extract name
        const nameMatch = section.match(/(?:nama|name):\s*([^\n]+)/i);
        if (nameMatch) flower.name = nameMatch[1].trim();
        
        // Extract description
        const descMatch = section.match(/(?:deskripsi|description|desc):\s*([^\n]+)/i);
        if (descMatch) flower.description = descMatch[1].trim();
        
        // Extract price
        const priceMatch = section.match(/(?:harga|price):\s*([^\n]+)/i);
        if (priceMatch) flower.price = priceMatch[1].trim();
        
        // Extract color
        const colorMatch = section.match(/(?:warna|color):\s*([^\n]+)/i);
        if (colorMatch) flower.color = colorMatch[1].trim();
        
        // Extract size
        const sizeMatch = section.match(/(?:ukuran|size):\s*([^\n]+)/i);
        if (sizeMatch) flower.size = sizeMatch[1].trim();
        
        // Extract style
        const styleMatch = section.match(/(?:style|gaya):\s*([^\n]+)/i);
        if (styleMatch) flower.style = styleMatch[1].trim();
        
        // Extract rating
        const ratingMatch = section.match(/(?:rating|nilai):\s*([^\n]+)/i);
        if (ratingMatch) flower.rating = ratingMatch[1].trim();
        
        // Extract category
        const categoryMatch = section.match(/(?:kategori|category):\s*([^\n]+)/i);
        if (categoryMatch) flower.category = categoryMatch[1].trim();
        
        if (flower.name) {
          flowers.push(flower);
        }
      }
    });
    
    return flowers;
  };

  const flowerData = extractFlowerData(text);
  
  if (flowerData.length === 0) {
    // Fallback to regular formatting
    return (
      <div className="whitespace-pre-line text-sm leading-relaxed">
        {text.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n\n')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Introduction text before flower cards */}
      <div className="text-sm leading-relaxed mb-4">
        <p className="font-medium text-coral-700 mb-2">🌸 Here are some beautiful flower recommendations for you:</p>
      </div>
      
      {/* Flower cards */}
      {flowerData.map((flower, index) => (
        <Card key={index} className="border-coral-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flower2 className="h-5 w-5 text-coral-500" />
                <h3 className="font-semibold text-gray-800">{flower.name}</h3>
              </div>
              {flower.rating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {flower.rating}
                </Badge>
              )}
            </div>
            
            {flower.description && (
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {flower.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              {flower.price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span className="font-medium">Price:</span>
                  <span className="text-green-600 font-semibold">{flower.price}</span>
                </div>
              )}
              
              {flower.color && (
                <div className="flex items-center gap-2">
                  <Palette className="h-3 w-3 text-purple-600" />
                  <span className="font-medium">Color:</span>
                  <span>{flower.color}</span>
                </div>
              )}
              
              {flower.size && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-3 w-3 text-blue-600" />
                  <span className="font-medium">Size:</span>
                  <span>{flower.size}</span>
                </div>
              )}
              
              {flower.style && (
                <div className="flex items-center gap-2">
                  <Flower2 className="h-3 w-3 text-pink-600" />
                  <span className="font-medium">Style:</span>
                  <span>{flower.style}</span>
                </div>
              )}
              
              {flower.category && (
                <div className="col-span-2">
                  <Badge variant="outline" className="text-xs">
                    {flower.category}
                  </Badge>
                </div>
              )}
            </div>
            
            {onAddToCart && flower.price && (
              <div className="mt-4 pt-3 border-t">
                <Button
                  onClick={() => onAddToCart({
                    id: `ai-${Date.now()}-${index}`,
                    name: flower.name || 'Custom Arrangement',
                    price: parseFloat(flower.price?.replace(/[^0-9.]/g, '') || '75'),
                    image_url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&q=80',
                    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&q=80',
                    description: flower.description || '',
                    category: flower.category || 'AI Recommendation',
                    quantity: 1
                  })}
                  size="sm"
                  className="w-full bg-coral-400 hover:bg-coral-500 text-white"
                >
                  Add to Cart - {flower.price}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      <div className="text-xs text-gray-500 mt-4 p-3 bg-coral-50 rounded-lg">
        💡 These AI recommendations are based on your preferences. Prices and availability may vary.
      </div>
    </div>
  );
}
