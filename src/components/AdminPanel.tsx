import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Plus, Trash2, Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import type { OrderWithItems } from '@/types/order';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GeneratedImage {
  id: string;
  prompt: string;
  image_url: string;
  thumbnail_url?: string;
  status: string;
  user_id?: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

const AdminPanel = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    category: 'flowers',
    image_url: '',
    is_active: true
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchUsers();
    fetchGeneratedImages();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems: OrderWithItems[] = [];
      
      for (const order of ordersData || []) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
          continue;
        }

        ordersWithItems.push({
          ...order,
          order_items: itemsData || []
        });
      }

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const fetchGeneratedImages = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGeneratedImages(data || []);
    } catch (error) {
      console.error('Error fetching generated images:', error);
      toast({
        title: "Error",
        description: "Failed to fetch generated images",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const addProduct = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([newProduct]);

      if (error) throw error;

      await fetchProducts();
      setIsAddProductDialogOpen(false);
      setNewProduct({
        name: '',
        price: 0,
        description: '',
        category: 'flowers',
        image_url: '',
        is_active: true
      });
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: selectedProduct.name,
          price: selectedProduct.price,
          description: selectedProduct.description,
          category: selectedProduct.category,
          image_url: selectedProduct.image_url,
          is_active: selectedProduct.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      await fetchProducts();
      setIsProductDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
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

      await fetchProducts();
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'processing': return 'outline';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'confirmed': return 'text-blue-600';
      case 'processing': return 'text-purple-600';
      case 'shipped': return 'text-indigo-600';
      case 'delivered': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="images">Generated Images</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                Manage customer orders and update their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                        <Badge variant={getStatusBadgeVariant(order.status)} className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Customer: {order.customer_name}</p>
                      <p className="text-sm text-gray-600">Email: {order.customer_email}</p>
                      <p className="text-sm text-gray-600">Total: ${Number(order.total_amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Items: {order.order_items.length} products</p>
                      <p className="text-sm text-gray-600">Created: {new Date(order.created_at).toLocaleDateString()}</p>
                      {order.payment_method && (
                        <p className="text-sm text-gray-600">Payment: {order.payment_method}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Order Details #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
                            <DialogDescription>
                              Complete order information and items
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Customer Name</Label>
                                  <p className="text-sm">{selectedOrder.customer_name}</p>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <p className="text-sm">{selectedOrder.customer_email}</p>
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <p className="text-sm">{selectedOrder.customer_phone || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                                    {selectedOrder.status}
                                  </Badge>
                                </div>
                                <div className="col-span-2">
                                  <Label>Delivery Address</Label>
                                  <p className="text-sm">{selectedOrder.delivery_address}</p>
                                </div>
                                {selectedOrder.notes && (
                                  <div className="col-span-2">
                                    <Label>Notes</Label>
                                    <p className="text-sm">{selectedOrder.notes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <Label className="text-base font-semibold">Order Items</Label>
                                <div className="space-y-2 mt-2">
                                  {selectedOrder.order_items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                      <div>
                                        <p className="font-medium">{item.product_name}</p>
                                        <p className="text-sm text-gray-600">
                                          ${Number(item.product_price).toFixed(2)} x {item.quantity}
                                        </p>
                                      </div>
                                      <p className="font-semibold">${Number(item.subtotal).toFixed(2)}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <div className="flex justify-between items-center font-bold text-lg">
                                    <span>Total:</span>
                                    <span>${Number(selectedOrder.total_amount).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                
                {orders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No orders found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Manage your flower products and inventory
                </CardDescription>
              </div>
              <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Create a new product for your store
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Enter product description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flowers">Flowers</SelectItem>
                          <SelectItem value="bouquets">Bouquets</SelectItem>
                          <SelectItem value="arrangements">Arrangements</SelectItem>
                          <SelectItem value="plants">Plants</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <Button onClick={addProduct} className="w-full">
                      Add Product
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className="absolute top-2 right-2"
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-2xl font-bold text-coral-600 mb-2">
                        ${Number(product.price).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <Badge variant="outline" className="mb-4">
                        {product.category}
                      </Badge>
                      <div className="flex gap-2">
                        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                              <DialogDescription>
                                Update product information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedProduct && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">Product Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={selectedProduct.name}
                                    onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-price">Price</Label>
                                  <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    value={selectedProduct.price}
                                    onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={selectedProduct.description}
                                    onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-category">Category</Label>
                                  <Select
                                    value={selectedProduct.category}
                                    onValueChange={(value) => setSelectedProduct({ ...selectedProduct, category: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="flowers">Flowers</SelectItem>
                                      <SelectItem value="bouquets">Bouquets</SelectItem>
                                      <SelectItem value="arrangements">Arrangements</SelectItem>
                                      <SelectItem value="plants">Plants</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-image_url">Image URL</Label>
                                  <Input
                                    id="edit-image_url"
                                    value={selectedProduct.image_url}
                                    onChange={(e) => setSelectedProduct({ ...selectedProduct, image_url: e.target.value })}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="edit-is_active"
                                    checked={selectedProduct.is_active}
                                    onChange={(e) => setSelectedProduct({ ...selectedProduct, is_active: e.target.checked })}
                                  />
                                  <Label htmlFor="edit-is_active">Active</Label>
                                </div>
                                <Button onClick={updateProduct} className="w-full">
                                  Update Product
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{user.full_name || 'No name'}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-600">Phone: {user.phone || 'N/A'}</p>
                      <p className="text-sm text-gray-600">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Images</CardTitle>
              <CardDescription>
                View AI-generated images from customer requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={image.thumbnail_url || image.image_url}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        variant={image.status === 'completed' ? 'default' : 'secondary'}
                        className="absolute top-2 right-2"
                      >
                        {image.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {image.prompt}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(image.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                
                {generatedImages.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No generated images found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
