
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  description: string;
  image?: string; // Keep for backward compatibility
  category?: string;
  rating?: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}
