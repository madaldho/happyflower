import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Check, X, Image, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Product, GeneratedImage, AITrainingData, Order } from '@/types';

export function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [trainingData, setTrainingData] = useState<AITrainingData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'flowers',
    image_url: ''
  });

  const [newTraining, setNewTraining] = useState({
    question: '',
    answer: '',
    category: 'general'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Load generated images
      const { data: imagesData } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      // Load training data
      const { data: trainingDataRes } = await supabase
        .from('ai_training_data')
        .select('*')
        .order('created_at', { ascending: false });

      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
      setGeneratedImages((imagesData || []).map(img => ({
        ...img,
        status: img.status as 'pending' | 'approved' | 'rejected'
      })));
      setTrainingData(trainingDataRes || []);
      // Fix the orders type casting
      setOrders((ordersData || []).map(order => ({
        ...order,
        status: order.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation'
      })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data, ...prev]);
      setNewProduct({
        name: '',
        price: 0,
        description: '',
        category: 'flowers',
        image_url: ''
      });

      toast({
        title: "Success",
        description: "Product added successfully"
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const addTrainingData = async () => {
    if (!newTraining.question || !newTraining.answer) return;

    try {
      const { data, error } = await supabase
        .from('ai_training_data')
        .insert([newTraining])
        .select()
        .single();

      if (error) throw error;

      setTrainingData(prev => [data, ...prev]);
      setNewTraining({
        question: '',
        answer: '',
        category: 'general'
      });

      toast({
        title: "Success",
        description: "Training data added successfully"
      });
    } catch (error) {
      console.error('Error adding training data:', error);
      toast({
        title: "Error",
        description: "Failed to add training data",
        variant: "destructive"
      });
    }
  };

  const updateImageStatus = async (imageId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ status })
        .eq('id', imageId);

      if (error) throw error;

      setGeneratedImages(prev =>
        prev.map(img =>
          img.id === imageId ? { ...img, status } : img
        )
      );

      toast({
        title: "Success",
        description: `Image ${status} successfully`
      });
    } catch (error) {
      console.error('Error updating image status:', error);
      toast({
        title: "Error",
        description: "Failed to update image status",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const updateOrderPrice = async (orderId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          final_price: newPrice,
          is_price_overridden: true,
          status: 'confirmed'
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId 
            ? { 
                ...order, 
                final_price: newPrice, 
                is_price_overridden: true,
                status: 'confirmed' as const
              } 
            : order
        )
      );

      toast({
        title: "Success",
        description: "Order price updated successfully"
      });
    } catch (error) {
      console.error('Error updating order price:', error);
      toast({
        title: "Error",
        description: "Failed to update order price",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="images">Generated Images</TabsTrigger>
          <TabsTrigger value="training">AI Training</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{order.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                    <Badge variant={
                      order.status === 'waiting_admin_confirmation' ? 'secondary' :
                      order.status === 'confirmed' ? 'default' :
                      order.status === 'completed' ? 'default' : 'destructive'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{order.delivery_address}</p>
                  
                  {order.estimated_price && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-medium">Estimated Price: Rp {order.estimated_price.toLocaleString()}</p>
                      {order.status === 'waiting_admin_confirmation' && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="number"
                            placeholder="Set final price"
                            className="w-40"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                updateOrderPrice(order.id, Number(target.value));
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                              if (input?.value) {
                                updateOrderPrice(order.id, Number(input.value));
                              }
                            }}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Set Price
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="font-semibold text-coral-600">
                    {order.final_price ? `Final: Rp ${order.final_price.toLocaleString()}` : 
                     order.estimated_price ? `Estimated: Rp ${order.estimated_price.toLocaleString()}` :
                     `Rp ${order.total_amount.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                />
              </div>
              <Button onClick={addProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-coral-600 font-bold">${product.price}</p>
                  <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image) => (
              <Card key={image.id}>
                <CardContent className="p-4">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-48 object-cover rounded-md mb-3"
                  />
                  <p className="text-sm mb-2">{image.prompt}</p>
                  <Badge 
                    variant={
                      image.status === 'approved' ? 'default' : 
                      image.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {image.status}
                  </Badge>
                  {image.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        onClick={() => updateImageStatus(image.id, 'approved')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateImageStatus(image.id, 'rejected')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Training Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={newTraining.question}
                  onChange={(e) => setNewTraining(prev => ({ ...prev, question: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={newTraining.answer}
                  onChange={(e) => setNewTraining(prev => ({ ...prev, answer: e.target.value }))}
                />
              </div>
              <Button onClick={addTrainingData}>
                <Plus className="h-4 w-4 mr-2" />
                Add Training Data
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {trainingData.map((data) => (
              <Card key={data.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Q: {data.question}</h3>
                  <p className="text-muted-foreground">A: {data.answer}</p>
                  <Badge variant="outline" className="mt-2">{data.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
