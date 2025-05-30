
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  description: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}
