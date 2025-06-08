
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useOrderStatus() {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const updateOrderStatus = async (
    orderId: string, 
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting_admin_confirmation'
  ) => {
    setIsUpdating(orderId);
    
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      // If changing to confirmed status, ensure there's a final price
      if (newStatus === 'confirmed') {
        const { data: orderData, error: fetchError } = await supabase
          .from('orders')
          .select('final_price')
          .eq('id', orderId)
          .single();

        if (fetchError) throw fetchError;
        
        if (!orderData?.final_price) {
          toast({
            title: "Price Required",
            description: "Please set a final price before confirming the order",
            variant: "destructive"
          });
          return false;
        }
      }

      // Prepare updates
      const updates: {
        status: typeof newStatus;
        final_price?: number | null;
      } = { status: newStatus };
      
      // If cancelling, clear final price
      if (newStatus === 'cancelled') {
        updates.final_price = null;
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      toast({
        title: "Status Updated",
        description: `Order has been marked as ${newStatus.replace('_', ' ')}`,
      });

      console.log(`Successfully updated order ${orderId} to ${newStatus}`);
      return true;

    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(null);
    }
  };

  const updateOrderPrice = async (orderId: string, newPrice: number) => {
    if (newPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be greater than zero",
        variant: "destructive"
      });
      return false;
    }

    setIsUpdating(orderId);

    try {
      console.log(`Updating order ${orderId} price to: ${newPrice}`);

      const { error } = await supabase
        .from('orders')
        .update({
          total_amount: newPrice,
          final_price: newPrice,
          status: 'waiting_admin_confirmation'
        })
        .eq('id', orderId);

      if (error) throw new Error(error.message);

      toast({
        title: "Price Updated",
        description: `Order price has been updated to $${newPrice}`,
      });

      return true;

    } catch (error) {
      console.error('Error updating order price:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update order price",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(null);
    }
  };

  return {
    updateOrderStatus,
    updateOrderPrice,
    isUpdating
  };
}
