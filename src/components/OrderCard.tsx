
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Mail, MapPin, Clock, DollarSign, Image, AlertCircle } from 'lucide-react';
import { OrderStatusDropdown } from './OrderStatusDropdown';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onOrderUpdate: () => void;
}

export function OrderCard({ order, onOrderUpdate }: OrderCardProps) {
  const [priceInput, setPriceInput] = useState('');
  const { updateOrderStatus, updateOrderPrice, isUpdating } = useOrderStatus();

  const handleStatusChange = async (newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation') => {
    const success = await updateOrderStatus(order.id, newStatus);
    if (success) {
      onOrderUpdate();
    }
  };

  const handlePriceUpdate = async () => {
    if (!priceInput) return;
    
    const success = await updateOrderPrice(order.id, Number(priceInput));
    if (success) {
      setPriceInput('');
      onOrderUpdate();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

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

  const relatedImage = order.generated_images;

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          {relatedImage && relatedImage.image_url && (
            <div className="w-full md:w-1/3 h-48 md:h-auto">
              <img 
                src={relatedImage.image_url} 
                alt="Order Image" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Content Section */}
          <div className="p-4 flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  Order #{order.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {order.customer_name} - {order.customer_email}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(order.created_at)}
                </p>
              </div>
              
              {/* Status Dropdown */}
              <div className="w-full sm:w-auto min-w-[200px]">
                <OrderStatusDropdown
                  currentStatus={order.status}
                  onStatusChange={handleStatusChange}
                  disabled={isUpdating === order.id}
                />
              </div>
            </div>
            
            {/* Address */}
            <p className="text-sm mb-3 bg-gray-50 p-2 rounded-md flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{order.delivery_address}</span>
            </p>

            {/* Price Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {order.estimated_price && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">Estimated: ${order.estimated_price.toLocaleString()}</p>
                </div>
              )}
              
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-bold text-green-800">
                  {order.final_price ? `Final: $${order.final_price.toLocaleString()}` : 
                  `Total: $${order.total_amount.toLocaleString()}`}
                </p>
              </div>
            </div>
            
            {/* Admin Price Confirmation */}
            {order.status === 'waiting_admin_confirmation' && (
              <div className="flex flex-col sm:flex-row gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                <Input
                  type="number"
                  placeholder="Set final price"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full sm:w-40"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePriceUpdate();
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={handlePriceUpdate}
                  disabled={!priceInput || isUpdating === order.id}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Set Price
                </Button>
              </div>
            )}
            
            {/* Related Image Status */}
            {relatedImage && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Image className="h-3 w-3 mr-1" />
                    Image Status: 
                    <Badge className={`ml-2 ${getStatusColor(relatedImage.status)} capitalize px-2 py-0 rounded-full text-xs`}>
                      {relatedImage.status}
                    </Badge>
                  </p>
                  
                  {/* Status Sync Warning */}
                  {((relatedImage.status === 'rejected' && order.status !== 'cancelled') ||
                    (relatedImage.status === 'approved' && order.status === 'cancelled')) && (
                    <Badge variant="destructive" className="text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Status mismatch!
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
