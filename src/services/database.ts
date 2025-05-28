
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Product = Tables['products']['Row'];
type Order = Tables['orders']['Row'];
type OrderInsert = Tables['orders']['Insert'];
type Profile = Tables['profiles']['Row'];
type UserRole = Tables['user_roles']['Row'];

export class DatabaseService {
  // Profile operations
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }

  // User roles operations
  static async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUserRoles:', error);
      return [];
    }
  }

  // Product operations
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getProducts:', error);
      return [];
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating product:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in createProduct:', error);
      return null;
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating product:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return false;
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return false;
    }
  }

  // Order operations
  static async createOrder(orderData: OrderInsert): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating order:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return null;
    }
  }

  static async getOrders(userId?: string): Promise<Order[]> {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getOrders:', error);
      return [];
    }
  }

  static async updateOrderStatus(id: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return false;
    }
  }

  // Authentication helper
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  }
}
