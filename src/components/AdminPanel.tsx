
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  Package, 
  Brain,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { Product, AITrainingData, GeneratedImage } from '@/types';

export function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [aiTrainingData, setAiTrainingData] = useState<AITrainingData[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'bouquet',
    image_url: ''
  });
  const [newTraining, setNewTraining] = useState({
    question: '',
    answer: '',
    category: 'general'
  });

  const { user, isAdmin, isSeller } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin || isSeller) {
      loadData();
    }
  }, [isAdmin, isSeller]);

  const loadData = async () => {
    try {
      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Load AI training data
      const { data: trainingData } = await supabase
        .from('ai_training_data')
        .select('*')
        .order('created_at', { ascending: false });

      // Load generated images
      const { data: imagesData } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
      setAiTrainingData(trainingData || []);
      setGeneratedImages(imagesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data, ...prev]);
      setNewProduct({
        name: '',
        price: 0,
        description: '',
        category: 'bouquet',
        image_url: ''
      });

      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update(editingProduct)
        .eq('id', editingProduct.id);

      if (error) throw error;

      setProducts(prev => 
        prev.map(p => p.id === editingProduct.id ? editingProduct : p)
      );
      setEditingProduct(null);

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleAddTraining = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_training_data')
        .insert([{ ...newTraining, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setAiTrainingData(prev => [data, ...prev]);
      setNewTraining({
        question: '',
        answer: '',
        category: 'general'
      });

      toast({
        title: "Success",
        description: "Training data added successfully",
      });
    } catch (error) {
      console.error('Error adding training data:', error);
      toast({
        title: "Error",
        description: "Failed to add training data",
        variant: "destructive",
      });
    }
  };

  const handleUpdateImageStatus = async (imageId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ status })
        .eq('id', imageId);

      if (error) throw error;

      setGeneratedImages(prev => 
        prev.map(img => img.id === imageId ? { ...img, status } : img)
      );

      toast({
        title: "Success",
        description: `Image ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating image status:', error);
      toast({
        title: "Error",
        description: "Failed to update image status",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin && !isSeller) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-coral-600 mb-6">Admin Panel</h1>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="ai-training">
            <Brain className="h-4 w-4 mr-2" />
            AI Training
          </TabsTrigger>
          <TabsTrigger value="generated-images">
            <ImageIcon className="h-4 w-4 mr-2" />
            Generated Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Beautiful Rose Bouquet"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="49.99"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="bouquet">Bouquet</option>
                    <option value="arrangement">Arrangement</option>
                    <option value="plant">Plant</option>
                    <option value="gift">Gift</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beautiful arrangement perfect for any occasion..."
                />
              </div>
              <Button onClick={handleAddProduct} className="bg-coral-500 hover:bg-coral-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-coral-600 font-bold mb-2">${product.price}</p>
                  <Badge variant="secondary" className="mb-3">{product.category}</Badge>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add AI Training Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={newTraining.question}
                  onChange={(e) => setNewTraining(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="What flowers are best for weddings?"
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={newTraining.answer}
                  onChange={(e) => setNewTraining(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="For weddings, I recommend white roses, peonies, and baby's breath..."
                />
              </div>
              <div>
                <Label htmlFor="training-category">Category</Label>
                <Input
                  id="training-category"
                  value={newTraining.category}
                  onChange={(e) => setNewTraining(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="weddings"
                />
              </div>
              <Button onClick={handleAddTraining} className="bg-coral-500 hover:bg-coral-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Training Data
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {aiTrainingData.map((data) => (
              <Card key={data.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{data.category}</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(data.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">Q: {data.question}</h3>
                  <p className="text-gray-700">A: {data.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generated-images" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image) => (
              <Card key={image.id}>
                <CardContent className="p-4">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.prompt}</p>
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant={
                        image.status === 'approved' ? 'default' : 
                        image.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {image.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {image.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateImageStatus(image.id, 'approved')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateImageStatus(image.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateProduct} className="bg-coral-500 hover:bg-coral-600">
                  Update Product
                </Button>
                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
