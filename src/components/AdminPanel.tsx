
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Check, X, Image, Search, RefreshCw, Package, ShoppingBag, ChevronDown, ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Product, GeneratedImage, AITrainingData, Order } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OrderCard } from './OrderCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [trainingData, setTrainingData] = useState<AITrainingData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'flowers',
    image_url: ''
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingProductFile, setEditingProductFile] = useState<File | null>(null);
  const [editingProductPreview, setEditingProductPreview] = useState<string>('');

  const [newTraining, setNewTraining] = useState({
    question: '',
    answer: '',
    category: 'general'
  });

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for orders
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          console.log('Order change detected:', payload);
          loadData(); // Reload data when orders change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading admin data...');

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

      // Load orders with related generated images
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          generated_images:generated_image_id (
            id,
            image_url,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      
      // Process orders data with proper type casting
      setOrders((ordersData || []).map(order => {
        return {
          ...order,
          status: order.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation',
          generated_images: order.generated_images ? {
            ...order.generated_images,
            status: order.generated_images.status as 'pending' | 'approved' | 'rejected'
          } : null
        };
      }));

      console.log('Data loaded successfully:', {
        products: productsData?.length || 0,
        images: imagesData?.length || 0,
        training: trainingDataRes?.length || 0,
        orders: ordersData?.length || 0
      });

      toast({
        title: "Data Refreshed",
        description: "Admin data updated successfully",
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEditing) {
        setEditingProductFile(file);
        setEditingProductPreview(reader.result as string);
      } else {
        setProductImageFile(file);
        setProductImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Fungsi untuk mengonversi file gambar ke Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Ganti fungsi uploadProductImage dengan versi yang lebih sederhana
  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      // Konversi file ke Base64 dan gunakan langsung sebagai image_url
      const base64Image = await convertToBase64(file);
      return base64Image;
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Image Processing Error",
        description: "Failed to process image. Please try using an image URL instead.",
        variant: "destructive"
      });
      return "";
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
      let imageUrl = newProduct.image_url;
      
      // If there's a file to upload, use base64 image directly
      if (productImageFile) {
        const base64Image = await uploadProductImage(productImageFile);
        if (base64Image) {
          imageUrl = base64Image;
        }
      }

      // Jika tidak ada URL gambar sama sekali
      if (!imageUrl) {
        imageUrl = "https://placehold.co/600x400?text=No+Image";
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{...newProduct, image_url: imageUrl}])
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
      setProductImageFile(null);
      setProductImagePreview('');
      setShowAddProductForm(false);

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
    setEditingProductPreview(product.image_url || '');
  };

  const cancelEditingProduct = () => {
    setEditingProduct(null);
    setEditingProductFile(null);
    setEditingProductPreview('');
  };

  const saveEditedProduct = async () => {
    if (!editingProduct) return;

    try {
      let imageUrl = editingProduct.image_url;
      
      // If there's a file to upload, use base64 image directly
      if (editingProductFile) {
        const base64Image = await uploadProductImage(editingProductFile);
        if (base64Image) {
          imageUrl = base64Image;
        }
      }

      // Jika tidak ada URL gambar sama sekali
      if (!imageUrl) {
        imageUrl = "https://placehold.co/600x400?text=No+Image";
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          price: editingProduct.price,
          description: editingProduct.description,
          category: editingProduct.category,
          image_url: imageUrl
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      setProducts(prev => 
        prev.map(p => p.id === editingProduct.id ? {...editingProduct, image_url: imageUrl} : p)
      );
      
      setEditingProduct(null);
      setEditingProductFile(null);
      setEditingProductPreview('');

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
    if (newPrice <= 0) {
      toast({
        title: "Invalid price",
        description: "Price must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    try {
      // Direct update via Supabase RLS instead of Edge Function
      const { error } = await supabase
        .from('orders')
        .update({
          total_amount: newPrice,
          final_price: newPrice,
          status: 'waiting_admin_confirmation'
        })
        .eq('id', orderId);

      if (error) throw new Error(error.message);

      await loadData();

      toast({
        title: "Price updated",
        description: `Order price has been updated to $${newPrice}`,
      });
    } catch (error) {
      console.error('Error updating order price:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order price",
        variant: "destructive"
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation') => {
    try {
      // If changing to confirmed status, ensure there's a final price
      if (status === 'confirmed') {
        const order = orders.find(o => o.id === orderId);
        if (!order?.final_price) {
          toast({
            title: "Price Required",
            description: "Please set a final price before confirming the order",
            variant: "destructive"
          });
          return;
        }
      }

      // Direct update via Supabase RLS instead of Edge Function
      const updates: {
        status: typeof status;
        final_price?: number | null;
      } = { status };
      
      // If cancelling, clear final price
      if (status === 'cancelled') {
        updates.final_price = null;
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw new Error(error.message);

      await loadData();

      toast({
        title: "Status updated",
        description: `Order has been marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
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
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;

  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  // Utility function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved':
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'waiting_admin_confirmation':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Utility function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Add Product Form Component
  const AddProductForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50 pb-10">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => setShowAddProductForm(false)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Add New Product</h1>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="Enter price"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div>
              <Label>Product Image</Label>
              <div className="mt-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="border rounded-md p-2 flex-1">
                    <Input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductImageChange(e)}
                      className="cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">OR</span>
                  <div className="flex-1">
                    <Input
                      placeholder="Image URL"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                    />
                  </div>
                </div>
                
                {(productImagePreview || newProduct.image_url) && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={productImagePreview || newProduct.image_url} 
                      alt="Product preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={addProduct} 
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // If showing add product form, render that instead of main admin panel
  if (showAddProductForm) {
    return <AddProductForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50 pb-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
          <Button onClick={loadData} variant="outline" disabled={isLoading} className="w-full sm:w-auto">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Dropdown */}
          <div className="md:hidden w-full mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    {activeTab === 'orders' && <Package className="h-4 w-4" />}
                    {activeTab === 'products' && <ShoppingBag className="h-4 w-4" />}
                    {activeTab === 'images' && <Image className="h-4 w-4" />}
                    {activeTab === 'training' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4V11h4.5a2.5 2.5 0 0 1 0 5H18v2.6c1.2.6 2 2 2 3.4a4 4 0 0 1-4 4 4 4 0 0 1-4-4c0-1.5.8-2.8 2-3.4V16H9.5a2.5 2.5 0 0 1 0-5H14V9.4C12.8 8.8 12 7.5 12 6a4 4 0 0 1 4-4z"></path>
                      </svg>
                    )}
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setActiveTab('orders')} className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('products')} className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Products</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('images')} className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span>Images</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('training')} className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4V11h4.5a2.5 2.5 0 0 1 0 5H18v2.6c1.2.6 2 2 2 3.4a4 4 0 0 1-4 4a4 4 0 0 1-4-4c0-1.5.8-2.8 2-3.4V16H9.5a2.5 2.5 0 0 1 0-5H14V9.4C12.8 8.8 12 7.5 12 6a4 4 0 0 1 4-4z"></path>
                  </svg>
                  <span>Training</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <ScrollArea className="w-full overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Products</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span>Images</span>
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4V11h4.5a2.5 2.5 0 0 1 0 5H18v2.6c1.2.6 2 2 2 3.4a4 4 0 0 1-4 4a4 4 0 0 1-4-4c0-1.5.8-2.8 2-3.4V16H9.5a2.5 2.5 0 0 1 0-5H14V9.4C12.8 8.8 12 7.5 12 6a4 4 0 0 1 4-4z"></path>
                  </svg>
                  <span>Training</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

          <TabsContent value="orders" className="space-y-4 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOrderUpdate={loadData}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 mt-4 sm:mt-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddProductForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-white/80 text-black px-2 py-1 rounded-full">
                          ${product.price}
                        </Badge>
                      </div>
                    
                      <div className="p-3 sm:p-4">
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
                            
                            <div className="space-y-2">
                              <Label>Product Image</Label>
                              <div className="flex items-center gap-2">
                                <div className="border rounded-md p-1 flex-1">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleProductImageChange(e, true)}
                                    className="cursor-pointer text-xs"
                                  />
                                </div>
                                <span className="text-xs">OR</span>
                                <div className="flex-1">
                                  <Input
                                    placeholder="Image URL"
                                    value={editingProduct.image_url || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
                                    className="text-xs"
                                  />
                                </div>
                              </div>
                              
                              {(editingProductPreview) && (
                                <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden mt-2">
                                  <img 
                                    src={editingProductPreview} 
                                    alt="Product preview" 
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <Button 
                                size="sm" 
                                onClick={saveEditedProduct}
                                className="flex-1"
                              >
                                <Check className="h-4 w-4 mr-2" /> Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={cancelEditingProduct}
                                className="flex-1"
                              >
                                <X className="h-4 w-4 mr-2" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-coral-600 font-bold text-xl">${product.price}</p>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => startEditingProduct(product)}
                                className="flex-1"
                              >
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteProduct(product.id)}
                                className="flex-1"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
                </div>
              ) : generatedImages.length === 0 ? (
                <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No generated images found</p>
                </div>
              ) : (
                generatedImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={image.image_url}
                          alt={image.prompt}
                          className="w-full h-60 object-cover"
                        />
                        <Badge 
                          className={`absolute top-3 right-3 ${image.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            image.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'} capitalize px-3 py-1 rounded-full`}
                        >
                          {image.status}
                        </Badge>
                      </div>
                      
                      <div className="p-3 sm:p-4">
                        <p className="text-sm line-clamp-2 mb-3">{image.prompt}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                          <Clock className="h-3 w-3" />
                          {formatDate(image.created_at)}
                        </p>
                      
                        {image.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => updateImageStatus(image.id, 'approved')}
                              className="flex-1"
                            >
                              <Check className="h-4 w-4 mr-2" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateImageStatus(image.id, 'rejected')}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-2" /> Reject
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

          <TabsContent value="training" className="space-y-4 mt-4 sm:mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Add Training Data</CardTitle>
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
                <Button onClick={addTrainingData} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Training Data
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
                </div>
              ) : trainingData.length === 0 ? (
                <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No training data found</p>
                </div>
              ) : (
                trainingData.map((data) => (
                  <Card key={data.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold mb-2 flex-1">Q: {data.question}</h3>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteTrainingData(data.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm bg-gray-50 p-3 rounded-md">A: {data.answer}</p>
                      <Badge variant="outline" className="mt-3">{data.category}</Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
