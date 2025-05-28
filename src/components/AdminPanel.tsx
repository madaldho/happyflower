
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Check, X, Image, DollarSign, Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Product, GeneratedImage, AITrainingData, Order } from '@/types';

export function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [trainingData, setTrainingData] = useState<AITrainingData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'flowers',
    image_url: ''
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Load generated images
      const { data: imagesData, error: imagesError } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (imagesError) throw imagesError;
      setGeneratedImages((imagesData || []).map(img => ({
        ...img,
        status: img.status as 'pending' | 'approved' | 'rejected'
      })));

      // Load training data
      const { data: trainingDataRes, error: trainingError } = await supabase
        .from('ai_training_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (trainingError) throw trainingError;
      setTrainingData(trainingDataRes || []);

      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      // Fix the orders type casting
      setOrders((ordersData || []).map(order => ({
        ...order,
        status: order.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation'
      })));

      toast({
        title: "Data loaded",
        description: "Admin data refreshed successfully",
      });
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
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Missing information",
        description: "Please fill in product name and price",
        variant: "destructive"
      });
      return;
    }

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

  const startEditingProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const cancelEditingProduct = () => {
    setEditingProduct(null);
  };

  const saveEditedProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          price: editingProduct.price,
          description: editingProduct.description,
          category: editingProduct.category,
          image_url: editingProduct.image_url
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      setProducts(prev => 
        prev.map(p => p.id === editingProduct.id ? editingProduct : p)
      );
      
      setEditingProduct(null);

      toast({
        title: "Success",
        description: "Product updated successfully"
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const addTrainingData = async () => {
    if (!newTraining.question || !newTraining.answer) {
      toast({
        title: "Missing information",
        description: "Please fill in both question and answer fields",
        variant: "destructive"
      });
      return;
    }

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

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId 
            ? { ...order, status: status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation' } 
            : order
        )
      );

      toast({
        title: "Success",
        description: `Order status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const deleteTrainingData = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_training_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrainingData(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Training data deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting training data:', error);
      toast({
        title: "Error",
        description: "Failed to delete training data",
        variant: "destructive"
      });
    }
  };

  // Filter data based on search term
  const filteredOrders = searchTerm 
    ? orders.filter(order => 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;

  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={loadData} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search orders, products..."
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="images">Generated Images</TabsTrigger>
          <TabsTrigger value="training">AI Training</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">{order.customer_name} - {order.customer_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
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
                        <p className="text-sm font-medium">Estimated Price: ${order.estimated_price.toLocaleString()}</p>
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
                    
                    <div className="font-semibold text-coral-600 mb-4">
                      {order.final_price ? `Final: $${order.final_price.toLocaleString()}` : 
                       order.estimated_price ? `Estimated: $${order.estimated_price.toLocaleString()}` :
                       `$${order.total_amount.toLocaleString()}`}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant={order.status === "pending" ? "default" : "outline"}
                        onClick={() => updateOrderStatus(order.id, "pending")}
                      >
                        Pending
                      </Button>
                      <Button 
                        size="sm" 
                        variant={order.status === "confirmed" ? "default" : "outline"}
                        onClick={() => updateOrderStatus(order.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                      <Button 
                        size="sm" 
                        variant={order.status === "completed" ? "default" : "outline"}
                        onClick={() => updateOrderStatus(order.id, "completed")}
                      >
                        Complete
                      </Button>
                      <Button 
                        size="sm" 
                        variant={order.status === "cancelled" ? "destructive" : "outline"}
                        onClick={() => updateOrderStatus(order.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
            {isLoading ? (
              <div className="col-span-3 flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-3 text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    
                    {editingProduct && editingProduct.id === product.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                          placeholder="Product name"
                        />
                        <Input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                          placeholder="Price"
                        />
                        <Textarea
                          value={editingProduct.description || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                          placeholder="Description"
                        />
                        <Input
                          value={editingProduct.image_url || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
                          placeholder="Image URL"
                        />
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            onClick={saveEditedProduct}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={cancelEditingProduct}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-coral-600 font-bold">${product.price}</p>
                        <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEditingProduct(product)}
                          >
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
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-3 flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
              </div>
            ) : generatedImages.length === 0 ? (
              <div className="col-span-3 text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No generated images found</p>
              </div>
            ) : (
              generatedImages.map((image) => (
                <Card key={image.id}>
                  <CardContent className="p-4">
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-full h-48 object-cover rounded-md mb-3"
                    />
                    <p className="text-sm mb-2">{image.prompt}</p>
                    <div className="flex justify-between items-center">
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
                        <div className="flex gap-2">
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
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
              </div>
            ) : trainingData.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No training data found</p>
              </div>
            ) : (
              trainingData.map((data) => (
                <Card key={data.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <h3 className="font-semibold mb-2">Q: {data.question}</h3>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteTrainingData(data.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground">A: {data.answer}</p>
                    <Badge variant="outline" className="mt-2">{data.category}</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
