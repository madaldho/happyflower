
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
import { ArrowLeft, User, History, Settings, Package, LogOut, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';

export default function ProfilePage() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userOrders, setUserOrders] = useState<Order[]>([]);
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
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserOrders((orders || []).map(order => ({
        ...order,
        status: order.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation'
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
      {/* Header */}
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
        {/* Profile Header */}
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
                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    onClick={() => setEditMode(!editMode)}
                    variant="outline"
                    className="border-coral-300 text-coral-600 hover:bg-coral-50"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
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
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <Badge variant={
                              order.status === 'waiting_admin_confirmation' ? 'secondary' :
                              order.status === 'confirmed' ? 'default' :
                              order.status === 'completed' ? 'default' : 'destructive'
                            }>
                              {order.status === 'waiting_admin_confirmation' ? 'Waiting Confirmation' :
                               order.status === 'confirmed' ? 'Confirmed' :
                               order.status === 'completed' ? 'Completed' : 
                               order.status === 'cancelled' ? 'Cancelled' : order.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{order.delivery_address}</p>
                          
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
