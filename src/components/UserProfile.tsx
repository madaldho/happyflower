
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Package, Clock, CheckCircle, User, Mail, Phone } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'delivered';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

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
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  // Mock order data
  const orders: Order[] = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      total: 89.98,
      status: 'delivered',
      items: [
        {
          name: 'Enchanted Garden Bouquet',
          quantity: 1,
          price: 49.99,
          image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=100'
        },
        {
          name: 'Rose Elegance',
          quantity: 1,
          price: 39.99,
          image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=100'
        }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-20',
      total: 74.99,
      status: 'processing',
      items: [
        {
          name: 'Custom AI Generated Arrangement',
          quantity: 1,
          price: 74.99,
          image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=100'
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-serif">My Account</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Button
              variant={activeTab === 'profile' ? 'default' : 'outline'}
              onClick={() => setActiveTab('profile')}
              className={activeTab === 'profile' ? 'bg-coral-400 hover:bg-coral-500' : ''}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveTab('orders')}
              className={activeTab === 'orders' ? 'bg-coral-400 hover:bg-coral-500' : ''}
            >
              <Package className="h-4 w-4 mr-2" />
              Order History
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-coral-100 text-coral-600 text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">Happy Flower Customer</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-coral-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-coral-500" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Account Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-coral-50 rounded-lg">
                    <div className="text-2xl font-bold text-coral-600">
                      {orders.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center p-3 bg-coral-50 rounded-lg">
                    <div className="text-2xl font-bold text-coral-600">
                      ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={onLogout}
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground">Start shopping to see your orders here!</p>
                </div>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="border border-coral-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">Order {order.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} mb-2`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                          <p className="font-semibold text-coral-600">
                            ${order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ${item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
