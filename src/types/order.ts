
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
}

export interface OrderWithItems {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address: string;
  shipping_address?: string;
  total_amount: number;
  estimated_price?: number;
  final_price?: number;
  status: string;
  payment_method?: string;
  payment_details?: any;
  notes?: string;
  is_price_overridden?: boolean;
  price_locked?: boolean;
  generated_image_id?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}
