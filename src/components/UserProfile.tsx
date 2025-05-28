
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, User, History, Settings, Package } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Order } from '@/types';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onLogout: () => void;
}

export function UserProfile({ isOpen, onClose, user, onLogout }: UserProfileProps) {
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (isOpen && user) {
      loadUserOrders();
    }
  }, [isOpen, user]);

  const loadUserOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Profile</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2 m-4">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Riwayat Pesanan
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profil
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="px-4 pb-4">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading orders...</p>
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No orders yet</p>
                      <p className="text-sm text-gray-500">Start shopping to see your orders here</p>
                    </div>
                  ) : (
                    userOrders.map((order) => (
                      <Card key={order.id}>
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
                              {order.status === 'waiting_admin_confirmation' ? 'Menunggu Konfirmasi' :
                               order.status === 'confirmed' ? 'Dikonfirmasi' :
                               order.status === 'completed' ? 'Selesai' : 
                               order.status === 'cancelled' ? 'Dibatalkan' : order.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{order.delivery_address}</p>
                          
                          <div className="text-right">
                            {order.estimated_price && order.status === 'waiting_admin_confirmation' && (
                              <p className="text-sm text-orange-600">
                                Estimasi: Rp {order.estimated_price.toLocaleString()}
                              </p>
                            )}
                            <p className="font-semibold text-coral-600">
                              {order.final_price ? `Rp ${order.final_price.toLocaleString()}` :
                               order.estimated_price ? `Rp ${order.estimated_price.toLocaleString()}` :
                               `Rp ${order.total_amount.toLocaleString()}`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="profile" className="px-4 pb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editMode ? (
                      <>
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
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
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} className="flex-1">
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>Email</Label>
                          <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                        </div>
                        <Button onClick={() => setEditMode(true)} variant="outline" className="w-full">
                          Edit Profile
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <Button 
              onClick={onLogout} 
              variant="destructive" 
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
