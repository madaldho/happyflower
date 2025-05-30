
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Package, Settings, LogOut, Eye } from 'lucide-react';
import type { OrderWithItems } from '@/types/order';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(createdProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
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
        description: "Failed to load orders",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    if (!profile || !user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile?.full_name || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile?.address || ''}
                  onChange={(e) => setProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
              <Button onClick={updateProfile} disabled={isUpdating} className="w-full md:w-auto">
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View your previous orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                        <Badge variant={getStatusBadgeVariant(order.status)} className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-coral-600">
                        ${Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                      <p>Items: {order.order_items.length} products</p>
                      <p>Delivery: {order.delivery_address}</p>
                      {order.payment_method && (
                        <p>Payment: {order.payment_method}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {order.order_items.slice(0, 3).map((item, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.product_name}
                          </span>
                        ))}
                        {order.order_items.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{order.order_items.length - 3} more
                          </span>
                        )}
                      </div>
                      
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
                                  <Label>Order Date</Label>
                                  <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
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
                    </div>
                  </div>
                ))}
                
                {orders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>No orders yet</p>
                    <p className="text-sm">When you place an order, it will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Sign Out</h3>
                  <p className="text-sm text-gray-600">Sign out of your account</p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <h3 className="font-medium">Account Information</h3>
                  <p className="text-sm text-gray-600">Member since {new Date(profile?.created_at || '').toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
