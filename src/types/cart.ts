
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  image_url: string;
  description?: string;
  category?: string;
  rating?: number;
}
