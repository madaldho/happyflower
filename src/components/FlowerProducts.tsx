import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCache } from '@/hooks/useCache';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface FlowerProductsProps {
  onAddToCart: (product: Product) => void;
  cartItems: CartItem[];
}

export function FlowerProducts({ onAddToCart, cartItems }: FlowerProductsProps) {
  const { toast } = useToast();

  // Gunakan useCallback untuk mencegah fetchProducts dibuat ulang pada setiap render
  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    try {
      console.log('Fetching products from API...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Gagal memuat produk",
          variant: "destructive"
        });
        return [];
      } else {
        console.log('Products fetched successfully:', data?.length || 0);
        return data || [];
      }
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }, [toast]);

  // Menggunakan hook useCache untuk menyimpan data produk selama 30 menit
  const { data: products, isLoading: loading, refreshData } = useCache<Product[]>(
    'flower-products', // key untuk cache
    [], // initial data
    fetchProducts // fungsi untuk fetch data
  );

  const getCartItemCount = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData}
          className="text-xs flex items-center gap-1 text-coral-500"
        >
          <RefreshCw className="h-3 w-3" />
          Perbarui Produk
        </Button>
      </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products && products.length > 0 ? (
          products.map((product) => {
        const cartCount = getCartItemCount(product.id);
        return (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative overflow-hidden">
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy" 
              />
              {product.category === 'gift' && (
                <Badge className="absolute top-3 left-3 bg-coral-400 text-white">
                  Special
                </Badge>
              )}
              {cartCount > 0 && (
                <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                  {cartCount} in cart
                </Badge>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-coral-500 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">4.8</span>
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
        );
          })
        ) : (
          <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Tidak ada produk yang ditemukan</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              className="mt-4 text-coral-500"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Coba Muat Ulang
            </Button>
          </div>
        )}
    </div>
    </>
  );
}
