import { useState, useEffect, useRef } from 'react';
import { Product, DeliveryType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Pencil, Trash2, Package, Key, UserCheck, Zap, Search, Filter, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle, Upload, ImageIcon, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const deliveryTypeInfo: Record<DeliveryType, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  CREDENTIALS: {
    label: 'Login Credentials',
    icon: <Key className="h-4 w-4" />,
    description: 'Admin provides username & password',
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  COUPON_CODE: {
    label: 'Coupon/License Key',
    icon: <Package className="h-4 w-4" />,
    description: 'Admin provides activation code or license key',
    color: 'bg-purple-100 text-purple-700 border-purple-300'
  },
  MANUAL_ACTIVATION: {
    label: 'Manual Activation',
    icon: <UserCheck className="h-4 w-4" />,
    description: 'User provides their account, admin activates',
    color: 'bg-amber-100 text-amber-700 border-amber-300'
  },
  INSTANT_KEY: {
    label: 'Instant Key',
    icon: <Zap className="h-4 w-4" />,
    description: 'Pre-loaded keys auto-delivered',
    color: 'bg-green-100 text-green-700 border-green-300'
  }
};

const emptyProduct: Partial<Product> = {
  name: '',
  description: '',
  image: '',
  originalPrice: 0,
  salePrice: 0,
  duration: '1 Month',
  features: [],
  category: '',
  deliveryType: 'CREDENTIALS',
  deliveryInstructions: '',
  requiresUserInput: false,
  userInputLabel: '',
  isActive: true
};

export function ProductManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [featuresText, setFeaturesText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPG, PNG, GIF, etc.)',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    if (!isSupabaseConfigured) {
      toast({
        title: 'Database not configured',
        description: 'Please connect Supabase to upload images',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        // If bucket doesn't exist, show helpful message
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          toast({
            title: 'Storage not configured',
            description: 'Please create a "product-images" bucket in Supabase Storage',
            variant: 'destructive'
          });
        } else {
          throw error;
        }
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      setEditingProduct({ ...editingProduct, image: urlData.publicUrl });

      toast({
        title: 'Image uploaded',
        description: 'Product image has been uploaded successfully'
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    
    if (!isSupabaseConfigured) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name || '',
        description: p.description || '',
        image: p.image || '',
        originalPrice: p.original_price || 0,
        salePrice: p.sale_price || 0,
        duration: p.duration || '1 Month',
        features: p.features || [],
        category: p.category || 'General',
        deliveryType: (p.delivery_type as DeliveryType) || 'CREDENTIALS',
        deliveryInstructions: p.delivery_instructions || '',
        requiresUserInput: p.requires_user_input || false,
        userInputLabel: p.user_input_label || '',
        isActive: p.is_active !== false
      }));

      setProducts(mappedProducts);
    } catch (err: any) {
      console.error('Error loading products:', err);
      toast({
        title: 'Error loading products',
        description: err.message || 'Failed to load products from database',
        variant: 'destructive'
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct({ ...product });
      setFeaturesText(product.features?.join('\n') || '');
    } else {
      setEditingProduct({ ...emptyProduct });
      setFeaturesText('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFeaturesText('');
  };

  const handleSave = async () => {
    if (!editingProduct?.name?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!editingProduct?.salePrice || editingProduct.salePrice <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Sale price must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    const productData = {
      name: editingProduct.name.trim(),
      description: editingProduct.description?.trim() || '',
      image: editingProduct.image?.trim() || 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&q=80',
      original_price: editingProduct.originalPrice || editingProduct.salePrice,
      sale_price: editingProduct.salePrice,
      duration: editingProduct.duration || '1 Month',
      features: featuresText.split('\n').filter(f => f.trim()),
      category: editingProduct.category?.trim() || 'General',
      delivery_type: editingProduct.deliveryType || 'CREDENTIALS',
      delivery_instructions: editingProduct.deliveryInstructions?.trim() || '',
      requires_user_input: editingProduct.requiresUserInput || false,
      user_input_label: editingProduct.userInputLabel?.trim() || '',
      is_active: editingProduct.isActive !== false
    };

    if (!isSupabaseConfigured) {
      toast({
        title: 'Database not configured',
        description: 'Please connect Supabase to save products',
        variant: 'destructive'
      });
      setIsSaving(false);
      return;
    }

    try {
      if (editingProduct.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: 'Product Updated',
          description: `${productData.name} has been updated successfully.`
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;

        toast({
          title: 'Product Created',
          description: `${productData.name} has been added successfully.`
        });
      }

      await loadProducts();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error saving product',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    if (!isSupabaseConfigured) {
      toast({
        title: 'Database not configured',
        description: 'Please connect Supabase to delete products',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: 'Product Deleted',
        description: `${product.name} has been removed successfully.`
      });

      await loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error deleting product',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActive = async (product: Product) => {
    if (!isSupabaseConfigured) {
      toast({
        title: 'Database not configured',
        description: 'Please connect Supabase to update products',
        variant: 'destructive'
      });
      return;
    }

    const newStatus = !product.isActive;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', product.id);

      if (error) throw error;

      setProducts(products.map(p =>
        p.id === product.id ? { ...p, isActive: newStatus } : p
      ));

      toast({
        title: newStatus ? 'Product Activated' : 'Product Deactivated',
        description: `${product.name} is now ${newStatus ? 'visible' : 'hidden'} to customers.`
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error updating product',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && product.isActive) ||
      (filterStatus === 'inactive' && !product.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
      <CardHeader className="border-b-2 border-black bg-gradient-to-r from-teal-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900">
              Product Management
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Manage your product catalog and delivery settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadProducts}
              disabled={isLoading}
              className="border-2 border-black hover:bg-gray-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#0A7A7A] hover:bg-[#086666] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-black"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px] border-2 border-black">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[150px] border-2 border-black">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-[#0A7A7A]" />
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Package className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {products.length === 0 ? 'No products yet' : 'No products found'}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {products.length === 0 
                ? 'Get started by adding your first product'
                : 'Try adjusting your search or filters'}
            </p>
            {products.length === 0 && (
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-[#0A7A7A] hover:bg-[#086666] text-white border-2 border-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b-2 border-black">
                  <TableHead className="font-bold text-gray-900">Product</TableHead>
                  <TableHead className="font-bold text-gray-900">Category</TableHead>
                  <TableHead className="font-bold text-gray-900">Price</TableHead>
                  <TableHead className="font-bold text-gray-900">Delivery</TableHead>
                  <TableHead className="font-bold text-gray-900">Status</TableHead>
                  <TableHead className="font-bold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-black bg-gray-100"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                            }}
                          />
                          {!product.isActive && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <EyeOff className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.duration}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-2 border-gray-300 font-medium">
                        {product.category || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {product.originalPrice > product.salePrice && (
                          <span className="line-through text-gray-400 text-sm block">
                            ₹{product.originalPrice}
                          </span>
                        )}
                        <span className="font-bold text-[#0A7A7A] text-lg">
                          ₹{product.salePrice}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${deliveryTypeInfo[product.deliveryType || 'CREDENTIALS'].color}`}>
                        {deliveryTypeInfo[product.deliveryType || 'CREDENTIALS'].icon}
                        <span>{deliveryTypeInfo[product.deliveryType || 'CREDENTIALS'].label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                          product.isActive
                            ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {product.isActive ? (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Hidden
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                          className="border-2 border-black hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product)}
                          className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Stats Footer */}
        {products.length > 0 && (
          <div className="border-t-2 border-black bg-gray-50 px-6 py-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle className="h-4 w-4" />
                {products.filter(p => p.isActive).length} Active
              </span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <AlertCircle className="h-4 w-4" />
                {products.filter(p => !p.isActive).length} Hidden
              </span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="border-b-2 border-black pb-4">
            <DialogTitle className="text-xl font-bold font-['Space_Grotesk']">
              {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="font-medium">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g., Netflix Premium"
                    className="mt-1.5 border-2 border-black focus:border-[#0A7A7A]"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={editingProduct?.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Brief description of the product"
                    className="mt-1.5 border-2 border-black focus:border-[#0A7A7A]"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="originalPrice" className="font-medium">
                    Original Price (₹)
                  </Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    value={editingProduct?.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    placeholder="999"
                    className="mt-1.5 border-2 border-black focus:border-[#0A7A7A]"
                  />
                </div>

                <div>
                  <Label htmlFor="salePrice" className="font-medium">
                    Sale Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="salePrice"
                    type="number"
                    min="1"
                    value={editingProduct?.salePrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: Number(e.target.value) })}
                    placeholder="499"
                    className="mt-1.5 border-2 border-black focus:border-[#0A7A7A]"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="font-medium">Duration</Label>
                  <Select
                    value={editingProduct?.duration || '1 Month'}
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, duration: value })}
                  >
                    <SelectTrigger className="mt-1.5 border-2 border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 Week">1 Week</SelectItem>
                      <SelectItem value="1 Month">1 Month</SelectItem>
                      <SelectItem value="3 Months">3 Months</SelectItem>
                      <SelectItem value="6 Months">6 Months</SelectItem>
                      <SelectItem value="1 Year">1 Year</SelectItem>
                      <SelectItem value="Lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category" className="font-medium">Category</Label>
                  <Input
                    id="category"
                    value={editingProduct?.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    placeholder="e.g., Entertainment"
                    className="mt-1.5 border-2 border-black focus:border-[#0A7A7A]"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="font-medium">Product Image</Label>
                  <div className="mt-1.5 space-y-3">
                    {/* Image Preview */}
                    {editingProduct?.image && (
                      <div className="relative inline-block">
                        <img
                          src={editingProduct.image}
                          alt="Product preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-black"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* Upload Section */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="product-image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full border-2 border-dashed border-gray-400 hover:border-[#0A7A7A] hover:bg-teal-50 h-20 flex flex-col items-center justify-center gap-1"
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="h-5 w-5 animate-spin text-[#0A7A7A]" />
                              <span className="text-sm">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-gray-500" />
                              <span className="text-sm text-gray-600">Click to upload image</span>
                              <span className="text-xs text-gray-400">Max 5MB (JPG, PNG, GIF)</span>
                            </>
                          )}
                        </Button>
                        {isUploading && (
                          <Progress value={uploadProgress} className="mt-2 h-2" />
                        )}
                      </div>
                    </div>

                    {/* URL Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">or</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="image"
                          value={editingProduct?.image || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          placeholder="Paste image URL here..."
                          className="pl-10 border-2 border-black focus:border-[#0A7A7A]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="features" className="font-medium">Features (one per line)</Label>
                  <Textarea
                    id="features"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    placeholder="4K Ultra HD Streaming&#10;5 Profiles&#10;Ad-free Experience"
                    className="mt-1.5 border-2 border-black focus:border-[#0A7A7A] font-mono text-sm"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Configuration Section */}
            <div className="space-y-4 border-t-2 border-black pt-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Delivery Configuration
              </h3>
              <p className="text-sm text-gray-500">
                Choose how this product will be delivered to customers
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(deliveryTypeInfo) as DeliveryType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEditingProduct({
                      ...editingProduct,
                      deliveryType: type,
                      requiresUserInput: type === 'MANUAL_ACTIVATION'
                    })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      editingProduct?.deliveryType === type
                        ? 'border-[#0A7A7A] bg-teal-50 shadow-[2px_2px_0px_0px_rgba(10,122,122,0.5)]'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={editingProduct?.deliveryType === type ? 'text-[#0A7A7A]' : 'text-gray-600'}>
                        {deliveryTypeInfo[type].icon}
                      </span>
                      <span className="font-semibold text-sm">{deliveryTypeInfo[type].label}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {deliveryTypeInfo[type].description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="deliveryInstructions" className="font-medium">
                    Delivery Instructions
                  </Label>
                  <Textarea
                    id="deliveryInstructions"
                    value={editingProduct?.deliveryInstructions || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, deliveryInstructions: e.target.value })}
                    placeholder="Instructions shown to customer after purchase"
                    className="mt-1.5 border-2 border-black focus:border-[#0A7A7A]"
                    rows={2}
                  />
                </div>

                {editingProduct?.deliveryType === 'MANUAL_ACTIVATION' && (
                  <div className="space-y-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={editingProduct?.requiresUserInput || false}
                        onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, requiresUserInput: checked })}
                      />
                      <Label className="font-medium">Requires user to provide their account details</Label>
                    </div>

                    {editingProduct?.requiresUserInput && (
                      <div>
                        <Label htmlFor="userInputLabel" className="font-medium">User Input Label</Label>
                        <Input
                          id="userInputLabel"
                          value={editingProduct?.userInputLabel || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, userInputLabel: e.target.value })}
                          placeholder="e.g., Your Netflix Email"
                          className="mt-1.5 border-2 border-black focus:border-[#0A7A7A]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div className="flex items-center gap-3 border-t-2 border-black pt-6">
              <Switch
                checked={editingProduct?.isActive !== false}
                onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isActive: checked })}
              />
              <div>
                <Label className="font-medium">Product is active</Label>
                <p className="text-xs text-gray-500">Active products are visible to customers</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSaving}
                className="border-2 border-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#0A7A7A] hover:bg-[#086666] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingProduct?.id ? 'Update Product' : 'Create Product'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
