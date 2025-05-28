
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  image: string;
  description: string;
  category: string;
  rating: number;
  quantity: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'seller' | 'customer';
  created_at: string;
}

export interface AITrainingData {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_by: string | null;
  created_at: string;
}

export interface GeneratedImage {
  id: string;
  user_id: string | null;
  prompt: string;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CustomOrder {
  id: string;
  user_id: string;
  generated_image_id: string;
  price_range_min?: number;
  price_range_max?: number;
  final_price?: number;
  status: 'pending_review' | 'price_provided' | 'confirmed' | 'completed';
  seller_notes?: string;
  created_at: string;
}
