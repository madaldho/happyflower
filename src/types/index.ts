
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
  image: string;
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
