
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, History, Settings, Package, LogOut, Edit2, Save, X, Eye, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderWithItems extends Order {
  order_items?: OrderItem[];
}

export default function ProfilePage() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userOrders, setUserOrders] = useState<OrderWithItems[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user) {
      loadUserOrders();
      setEditData({
        full_name: profile?.full_name || '',
        email: user.email || ''
      });
    }
  }, [user, profile]);

  const loadUserOrders = async () => {
    if (!user) return;
    
    setIsLoadingOrders(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            price,
            subtotal
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserOrders((orders || []).map(order => ({
        ...order,
        status: order.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation',
        order_items: order.order_items || []
      })));
    } catch (error) {
      console.error('Error loading user orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editData.full_name,
          email: editData.email
        })
        .eq('id', user.id);

      if (error) throw error;

      setEditMode(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'waiting_admin_confirmation':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Order Details Dialog Component
  const OrderDetailsDialog = ({ order }: { order: OrderWithItems }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details #{order.id.slice(0, 8)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Status and Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <p><strong>Status:</strong> <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge></p>
              <p><strong>Order Date:</strong> {formatDate(order.created_at)}</p>
              <p><strong>Payment Method:</strong> {order.payment_method || 'COD'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <p><strong>Name:</strong> {order.customer_name}</p>
              <p><strong>Email:</strong> {order.customer_email}</p>
              {order.customer_phone && <p><strong>Phone:</strong> {order.customer_phone}</p>}
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="font-semibold mb-2">Delivery Address</h3>
            <p className="bg-gray-50 p-3 rounded-md">{order.delivery_address}</p>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Order Items ({order.order_items?.length || 0} items)
            </h3>
            {order.order_items && order.order_items.length > 0 ? (
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity} × ${item.price}</p>
                    </div>
                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No items found for this order</p>
            )}
          </div>

          {/* Price Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Price Information</h3>
            <div className="space-y-2">
              {order.estimated_price && (
                <div className="flex justify-between">
                  <span>Estimated Price:</span>
                  <span>${order.estimated_price.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
              {order.final_price && (
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Final Price:</span>
                  <span>${order.final_price.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="font-semibold mb-2">Special Instructions</h3>
              <p className="bg-gray-50 p-3 rounded-md">{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-serif font-bold text-coral-600">
              My Profile
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-coral-100 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-coral-600" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile?.full_name || 'Welcome!'}
                </h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Order History
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Account Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading orders...</p>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                    <p className="text-sm text-gray-500 mb-4">Start shopping to see your orders here</p>
                    <Button onClick={() => navigate('/')} className="bg-coral-400 hover:bg-coral-500">
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status === 'waiting_admin_confirmation' ? 'Waiting Confirmation' :
                               order.status === 'confirmed' ? 'Confirmed' :
                               order.status === 'completed' ? 'Completed' : 
                               order.status === 'cancelled' ? 'Cancelled' : order.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{order.delivery_address}</p>
                          
                          {/* Order Items Summary */}
                          {order.order_items && order.order_items.length > 0 && (
                            <div className="bg-blue-50 p-3 rounded-md mb-3">
                              <p className="text-sm font-medium mb-1">Items:</p>
                              <div className="text-sm space-y-1">
                                {order.order_items.slice(0, 2).map((item) => (
                                  <p key={item.id} className="text-gray-700">
                                    {item.quantity}x {item.product_name} - ${item.subtotal.toFixed(2)}
                                  </p>
                                ))}
                                {order.order_items.length > 2 && (
                                  <p className="text-gray-500 italic">+{order.order_items.length - 2} more items...</p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <div className="text-right">
                              {order.estimated_price && order.status === 'waiting_admin_confirmation' && (
                                <p className="text-sm text-orange-600">
                                  Estimated: ${order.estimated_price.toLocaleString()}
                                </p>
                              )}
                              <p className="font-semibold text-coral-600">
                                {order.final_price ? `$${order.final_price.toLocaleString()}` :
                                 order.estimated_price ? `$${order.estimated_price.toLocaleString()}` :
                                 `$${order.total_amount.toLocaleString()}`}
                              </p>
                            </div>
                            <OrderDetailsDialog order={order} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <>
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={editData.full_name}
                        onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveProfile} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Full Name</Label>
                      <p className="text-gray-700 mt-1">{profile?.full_name || 'Not set'}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label>Email</Label>
                      <p className="text-gray-700 mt-1">{user.email}</p>
                    </div>
                    <Separator />
                    <Button 
                      onClick={() => setEditMode(true)} 
                      variant="outline" 
                      className="w-full mt-4"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
