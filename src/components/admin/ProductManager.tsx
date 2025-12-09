import { useState, useEffect, useRef } from 'react';
import { Product, DeliveryType, ProductVariant, ProductStockKey } from '@/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Package, Key, UserCheck, Zap, Search, Filter, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle, Upload, ImageIcon, X, Calendar, Clock, Layers, Database, Copy, FileUp, AlertTriangle } from 'lucide-react';
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
  costPrice: 0,
  duration: '1 Month',
  features: [],
  category: '',
  deliveryType: 'CREDENTIALS',
  deliveryInstructions: '',
  requiresUserInput: false,
  userInputLabel: '',
  requiresPassword: true,
  isActive: true,
  hasVariants: false,
  scheduledStart: '',
  scheduledEnd: '',
  lowStockAlert: 5,
  useManualStock: false,
  manualStockCount: 0
};

interface VariantForm {
  id?: string;
  name: string;
  duration: string;
  originalPrice: number;
  salePrice: number;
  isDefault: boolean;
  sortOrder: number;
}

const emptyVariant: VariantForm = {
  name: '',
  duration: '1 Month',
  originalPrice: 0,
  salePrice: 0,
  isDefault: false,
  sortOrder: 0
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
  
  // New state for variants and stock
  const [activeTab, setActiveTab] = useState('basic');
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [stockKeys, setStockKeys] = useState<ProductStockKey[]>([]);
  const [newStockKey, setNewStockKey] = useState({ keyValue: '', username: '', password: '' });
  const [bulkKeysText, setBulkKeysText] = useState('');
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const stockFileInputRef = useRef<HTMLInputElement>(null);

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
        costPrice: p.cost_price || 0,
        duration: p.duration || '1 Month',
        features: p.features || [],
        category: p.category || 'General',
        deliveryType: (p.delivery_type as DeliveryType) || 'CREDENTIALS',
        deliveryInstructions: p.delivery_instructions || '',
        requiresUserInput: p.requires_user_input || false,
        userInputLabel: p.user_input_label || '',
        requiresPassword: p.requires_password !== false,
        isActive: p.is_active !== false,
        hasVariants: p.has_variants || false,
        scheduledStart: p.scheduled_start || '',
        scheduledEnd: p.scheduled_end || '',
        lowStockAlert: p.low_stock_alert || 5,
        useManualStock: p.use_manual_stock || false,
        manualStockCount: p.manual_stock_count || 0
      }));

      // Load stock counts for each product
      for (const product of mappedProducts) {
        if (product.useManualStock) {
          product.stockCount = product.manualStockCount || 0;
        } else {
          const { count } = await supabase
            .from('product_stock_keys')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', product.id)
            .eq('status', 'AVAILABLE');
          product.stockCount = count || 0;
        }
      }

      // Load variants for products with hasVariants
      for (const product of mappedProducts) {
        if (product.hasVariants) {
          const { data: variantsData } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id)
            .order('sort_order', { ascending: true });
          
          if (variantsData) {
            product.variants = variantsData.map(v => ({
              id: v.id,
              productId: v.product_id,
              name: v.name,
              duration: v.duration,
              originalPrice: v.original_price,
              salePrice: v.sale_price,
              stockCount: v.stock_count || 0,
              isDefault: v.is_default,
              sortOrder: v.sort_order,
              createdAt: v.created_at,
              updatedAt: v.updated_at
            }));
          }
        }
      }

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
      // Load variants if product has variants
      if (product.hasVariants && product.variants) {
        setVariants(product.variants.map(v => ({
          id: v.id,
          name: v.name,
          duration: v.duration,
          originalPrice: v.originalPrice,
          salePrice: v.salePrice,
          isDefault: v.isDefault,
          sortOrder: v.sortOrder
        })));
      } else {
        setVariants([]);
      }
    } else {
      setEditingProduct({ ...emptyProduct });
      setFeaturesText('');
      setVariants([]);
    }
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFeaturesText('');
    setVariants([]);
    setActiveTab('basic');
  };

  // Variant management functions
  const addVariant = () => {
    setVariants([...variants, { ...emptyVariant, sortOrder: variants.length }]);
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    // If setting as default, unset others
    if (field === 'isDefault' && value === true) {
      updated.forEach((v, i) => {
        if (i !== index) v.isDefault = false;
      });
    }
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Stock management functions
  const openStockDialog = async (product: Product) => {
    setSelectedProductForStock(product);
    setIsStockDialogOpen(true);
    await loadStockKeys(product.id);
  };

  const loadStockKeys = async (productId: string) => {
    if (!isSupabaseConfigured) return;
    
    const { data, error } = await supabase
      .from('product_stock_keys')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setStockKeys(data.map(k => ({
        id: k.id,
        productId: k.product_id,
        variantId: k.variant_id,
        keyType: k.key_type,
        keyValue: k.key_value,
        username: k.username,
        password: k.password,
        additionalData: k.additional_data,
        status: k.status,
        assignedOrderId: k.assigned_order_id,
        expiryDate: k.expiry_date,
        createdAt: k.created_at,
        updatedAt: k.updated_at
      })));
    }
  };

  const addSingleStockKey = async () => {
    if (!selectedProductForStock || !newStockKey.keyValue.trim()) return;
    
    const keyType = selectedProductForStock.deliveryType === 'CREDENTIALS' ? 'CREDENTIALS' : 
                    selectedProductForStock.deliveryType === 'COUPON_CODE' ? 'COUPON_CODE' : 'LICENSE_KEY';
    
    const { error } = await supabase
      .from('product_stock_keys')
      .insert({
        product_id: selectedProductForStock.id,
        key_type: keyType,
        key_value: newStockKey.keyValue.trim(),
        username: newStockKey.username.trim() || null,
        password: newStockKey.password.trim() || null,
        status: 'AVAILABLE'
      });
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Key Added', description: 'Stock key added successfully' });
      setNewStockKey({ keyValue: '', username: '', password: '' });
      await loadStockKeys(selectedProductForStock.id);
      await loadProducts();
    }
  };

  const addBulkStockKeys = async () => {
    if (!selectedProductForStock || !bulkKeysText.trim()) return;
    
    const lines = bulkKeysText.split('\n').filter(l => l.trim());
    const keyType = selectedProductForStock.deliveryType === 'CREDENTIALS' ? 'CREDENTIALS' : 
                    selectedProductForStock.deliveryType === 'COUPON_CODE' ? 'COUPON_CODE' : 'LICENSE_KEY';
    
    const keysToInsert = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        product_id: selectedProductForStock.id,
        key_type: keyType,
        key_value: parts[0] || '',
        username: parts[1] || null,
        password: parts[2] || null,
        status: 'AVAILABLE'
      };
    }).filter(k => k.key_value);
    
    if (keysToInsert.length === 0) {
      toast({ title: 'Error', description: 'No valid keys found', variant: 'destructive' });
      return;
    }
    
    const { error } = await supabase
      .from('product_stock_keys')
      .insert(keysToInsert);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Keys Added', description: `${keysToInsert.length} keys added successfully` });
      setBulkKeysText('');
      await loadStockKeys(selectedProductForStock.id);
      await loadProducts();
    }
  };

  const deleteStockKey = async (keyId: string) => {
    if (!confirm('Delete this stock key?')) return;
    
    const { error } = await supabase
      .from('product_stock_keys')
      .delete()
      .eq('id', keyId);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Stock key removed' });
      if (selectedProductForStock) {
        await loadStockKeys(selectedProductForStock.id);
        await loadProducts();
      }
    }
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
      cost_price: editingProduct.costPrice || 0,
      duration: editingProduct.duration || '1 Month',
      features: featuresText.split('\n').filter(f => f.trim()),
      category: editingProduct.category?.trim() || 'General',
      delivery_type: editingProduct.deliveryType || 'CREDENTIALS',
      delivery_instructions: editingProduct.deliveryInstructions?.trim() || '',
      requires_user_input: editingProduct.requiresUserInput || false,
      user_input_label: editingProduct.userInputLabel?.trim() || '',
      requires_password: editingProduct.requiresPassword !== false,
      is_active: editingProduct.isActive !== false,
      has_variants: editingProduct.hasVariants || false,
      scheduled_start: editingProduct.scheduledStart || null,
      scheduled_end: editingProduct.scheduledEnd || null,
      low_stock_alert: editingProduct.lowStockAlert || 5
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

        // Handle variants
        if (editingProduct.hasVariants && variants.length > 0) {
          // Delete existing variants
          await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', editingProduct.id);
          
          // Insert new variants
          const variantsToInsert = variants.map((v, index) => ({
            product_id: editingProduct.id,
            name: v.name || `${editingProduct.name} - ${v.duration}`,
            duration: v.duration,
            original_price: v.originalPrice,
            sale_price: v.salePrice,
            is_default: v.isDefault,
            sort_order: index
          }));
          
          await supabase
            .from('product_variants')
            .insert(variantsToInsert);
        }

        toast({
          title: 'Product Updated',
          description: `${productData.name} has been updated successfully.`
        });
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;

        // Handle variants for new product
        if (editingProduct.hasVariants && variants.length > 0 && newProduct) {
          const variantsToInsert = variants.map((v, index) => ({
            product_id: newProduct.id,
            name: v.name || `${productData.name} - ${v.duration}`,
            duration: v.duration,
            original_price: v.originalPrice,
            sale_price: v.salePrice,
            is_default: v.isDefault,
            sort_order: index
          }));
          
          await supabase
            .from('product_variants')
            .insert(variantsToInsert);
        }

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
                  <TableHead className="font-bold text-gray-900">Stock</TableHead>
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
                      {product.hasVariants && (
                        <Badge variant="outline" className="ml-2 text-xs border-purple-300 text-purple-600">
                          <Layers className="h-3 w-3 mr-1" />
                          {product.variants?.length || 0} variants
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => openStockDialog(product)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all ${
                          (product.stockCount || 0) === 0
                            ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                            : (product.stockCount || 0) <= (product.lowStockAlert || 5)
                            ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                            : 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                        }`}
                      >
                        {product.useManualStock ? (
                          <Package className="h-3.5 w-3.5" />
                        ) : (
                          <Database className="h-3.5 w-3.5" />
                        )}
                        {product.stockCount || 0} {product.useManualStock ? 'stock' : 'keys'}
                        {(product.stockCount || 0) <= (product.lowStockAlert || 5) && (product.stockCount || 0) > 0 && (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                      </button>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="border-b-2 border-black pb-4">
            <DialogTitle className="text-xl font-bold font-['Space_Grotesk']">
              {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="basic" className="text-sm">
                <Package className="h-4 w-4 mr-1" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="variants" className="text-sm">
                <Layers className="h-4 w-4 mr-1" />
                Variants
              </TabsTrigger>
              <TabsTrigger value="delivery" className="text-sm">
                <Zap className="h-4 w-4 mr-1" />
                Delivery
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
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
                    disabled={editingProduct?.hasVariants}
                  />
                  {editingProduct?.hasVariants && (
                    <p className="text-xs text-amber-600 mt-1">Prices are set per variant</p>
                  )}
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
                    disabled={editingProduct?.hasVariants}
                  />
                </div>

                <div>
                  <Label htmlFor="costPrice" className="font-medium">
                    Cost Price (₹) <span className="text-gray-400 text-xs">(Vendor Price - Admin Only)</span>
                  </Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min="0"
                    value={editingProduct?.costPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                    placeholder="299"
                    className="mt-1.5 border-2 border-amber-400 focus:border-amber-600 bg-amber-50"
                    disabled={editingProduct?.hasVariants}
                  />
                  {editingProduct?.salePrice && editingProduct?.costPrice ? (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      Profit: ₹{(editingProduct.salePrice - editingProduct.costPrice).toLocaleString()} per sale
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="duration" className="font-medium">Duration</Label>
                  <Select
                    value={editingProduct?.duration || '1 Month'}
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, duration: value })}
                    disabled={editingProduct?.hasVariants}
                  >
                    <SelectTrigger className="mt-1.5 border-2 border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 Week">1 Week</SelectItem>
                      <SelectItem value="1 Month">1 Month</SelectItem>
                      <SelectItem value="2 Months">2 Months</SelectItem>
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
                            </>
                          )}
                        </Button>
                        {isUploading && <Progress value={uploadProgress} className="mt-2 h-2" />}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={editingProduct?.image || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          placeholder="Or paste image URL..."
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
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <Switch
                  checked={editingProduct?.hasVariants || false}
                  onCheckedChange={(checked) => {
                    setEditingProduct({ ...editingProduct, hasVariants: checked });
                    if (checked && variants.length === 0) {
                      addVariant();
                    }
                  }}
                />
                <div>
                  <Label className="font-medium">Enable Product Variants</Label>
                  <p className="text-xs text-gray-500">Allow multiple duration/price options for this product</p>
                </div>
              </div>

              {editingProduct?.hasVariants && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Price Variants</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                      className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variant
                    </Button>
                  </div>

                  {variants.map((variant, index) => (
                    <div key={index} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-700">Variant {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={variant.isDefault}
                              onChange={(e) => updateVariant(index, 'isDefault', e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            Default
                          </label>
                          {variants.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Name (optional)</Label>
                          <Input
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            placeholder="e.g., Basic Plan"
                            className="mt-1 border-2 border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Duration</Label>
                          <Select
                            value={variant.duration}
                            onValueChange={(value) => updateVariant(index, 'duration', value)}
                          >
                            <SelectTrigger className="mt-1 border-2 border-gray-300 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1 Week">1 Week</SelectItem>
                              <SelectItem value="1 Month">1 Month</SelectItem>
                              <SelectItem value="2 Months">2 Months</SelectItem>
                              <SelectItem value="3 Months">3 Months</SelectItem>
                              <SelectItem value="6 Months">6 Months</SelectItem>
                              <SelectItem value="1 Year">1 Year</SelectItem>
                              <SelectItem value="Lifetime">Lifetime</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Original Price (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={variant.originalPrice || ''}
                            onChange={(e) => updateVariant(index, 'originalPrice', Number(e.target.value))}
                            placeholder="999"
                            className="mt-1 border-2 border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Sale Price (₹)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={variant.salePrice || ''}
                            onChange={(e) => updateVariant(index, 'salePrice', Number(e.target.value))}
                            placeholder="499"
                            className="mt-1 border-2 border-gray-300 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-4">
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
                      <>
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
                        <div className="flex items-center gap-3 pt-2 border-t border-amber-300">
                          <Switch
                            checked={editingProduct?.requiresPassword !== false}
                            onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, requiresPassword: checked })}
                          />
                          <div>
                            <Label className="font-medium">Require Password</Label>
                            <p className="text-xs text-gray-500">Turn off if you only need email/username from user</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {editingProduct?.deliveryType === 'INSTANT_KEY' && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-700">Stock Management</span>
                    </div>
                    <p className="text-sm text-green-600 mb-3">
                      Pre-load license keys/credentials that will be auto-delivered when orders are completed.
                    </p>
                    <div>
                      <Label className="font-medium">Low Stock Alert Threshold</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editingProduct?.lowStockAlert || 5}
                        onChange={(e) => setEditingProduct({ ...editingProduct, lowStockAlert: Number(e.target.value) })}
                        className="mt-1.5 border-2 border-green-300 w-32"
                      />
                      <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this number</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-700">Product Scheduling</span>
                </div>
                <p className="text-sm text-blue-600">
                  Set start and end dates for product availability. Leave empty for always available.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Start Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={editingProduct?.scheduledStart ? new Date(editingProduct.scheduledStart).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, scheduledStart: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                    className="mt-1.5 border-2 border-black focus:border-[#0A7A7A]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Product becomes visible at this time</p>
                </div>

                <div>
                  <Label className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    End Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={editingProduct?.scheduledEnd ? new Date(editingProduct.scheduledEnd).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, scheduledEnd: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                    className="mt-1.5 border-2 border-black focus:border-[#0A7A7A]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Product becomes hidden after this time</p>
                </div>
              </div>

              {(editingProduct?.scheduledStart || editingProduct?.scheduledEnd) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProduct({ ...editingProduct, scheduledStart: '', scheduledEnd: '' })}
                  className="border-2 border-gray-300"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Schedule
                </Button>
              )}

              {/* Status Section */}
              <div className="flex items-center gap-3 border-t-2 border-gray-200 pt-6 mt-6">
                <Switch
                  checked={editingProduct?.isActive !== false}
                  onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isActive: checked })}
                />
                <div>
                  <Label className="font-medium">Product is active</Label>
                  <p className="text-xs text-gray-500">Active products are visible to customers</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
        </DialogContent>
      </Dialog>

      {/* Stock Management Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="border-b-2 border-black pb-4">
            <DialogTitle className="text-xl font-bold font-['Space_Grotesk'] flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Stock Management - {selectedProductForStock?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Manual Stock Option */}
            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Manual Stock Count
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Set stock count manually without adding individual keys (useful when you don't have pre-loaded keys)
                  </p>
                </div>
                <Switch
                  checked={selectedProductForStock?.useManualStock || false}
                  onCheckedChange={async (checked) => {
                    if (!selectedProductForStock || !isSupabaseConfigured) return;
                    await supabase
                      .from('products')
                      .update({ use_manual_stock: checked })
                      .eq('id', selectedProductForStock.id);
                    setSelectedProductForStock({ ...selectedProductForStock, useManualStock: checked });
                    setProducts(products.map(p => 
                      p.id === selectedProductForStock.id ? { ...p, useManualStock: checked } : p
                    ));
                  }}
                />
              </div>
              
              {selectedProductForStock?.useManualStock && (
                <div className="flex items-center gap-3 mt-3">
                  <Label className="text-amber-900 font-medium">Stock Count:</Label>
                  <Input
                    type="number"
                    min="0"
                    value={selectedProductForStock?.manualStockCount || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setSelectedProductForStock({ ...selectedProductForStock, manualStockCount: value });
                    }}
                    className="w-24 border-2 border-amber-300"
                  />
                  <Button
                    onClick={async () => {
                      if (!selectedProductForStock || !isSupabaseConfigured) return;
                      await supabase
                        .from('products')
                        .update({ manual_stock_count: selectedProductForStock.manualStockCount })
                        .eq('id', selectedProductForStock.id);
                      setProducts(products.map(p => 
                        p.id === selectedProductForStock.id 
                          ? { ...p, manualStockCount: selectedProductForStock.manualStockCount, stockCount: selectedProductForStock.manualStockCount } 
                          : p
                      ));
                      toast({
                        title: 'Stock Updated',
                        description: `Manual stock count set to ${selectedProductForStock.manualStockCount}`,
                      });
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Save Stock
                  </Button>
                </div>
              )}
            </div>

            {!selectedProductForStock?.useManualStock && (
              <>
            {/* Stock Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stockKeys.filter(k => k.status === 'AVAILABLE').length}
                </p>
                <p className="text-sm text-green-700">Available</p>
              </div>
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stockKeys.filter(k => k.status === 'ASSIGNED').length}
                </p>
                <p className="text-sm text-blue-700">Assigned</p>
              </div>
              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-600">{stockKeys.length}</p>
                <p className="text-sm text-gray-700">Total</p>
              </div>
            </div>

            {/* Add Single Key */}
            <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Single Key
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Key/Code Value *"
                  value={newStockKey.keyValue}
                  onChange={(e) => setNewStockKey({ ...newStockKey, keyValue: e.target.value })}
                  className="border-2 border-gray-300"
                />
                <Input
                  placeholder="Username (optional)"
                  value={newStockKey.username}
                  onChange={(e) => setNewStockKey({ ...newStockKey, username: e.target.value })}
                  className="border-2 border-gray-300"
                />
                <Input
                  placeholder="Password (optional)"
                  value={newStockKey.password}
                  onChange={(e) => setNewStockKey({ ...newStockKey, password: e.target.value })}
                  className="border-2 border-gray-300"
                />
              </div>
              <Button
                onClick={addSingleStockKey}
                disabled={!newStockKey.keyValue.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Key
              </Button>
            </div>

            {/* Bulk Import */}
            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg space-y-3">
              <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Bulk Import Keys
              </h4>
              <p className="text-xs text-purple-700">
                Enter one key per line. Format: key,username,password (username and password are optional)
              </p>
              <Textarea
                placeholder="KEY123&#10;KEY456,user@email.com,password123&#10;KEY789"
                value={bulkKeysText}
                onChange={(e) => setBulkKeysText(e.target.value)}
                className="border-2 border-purple-300 font-mono text-sm"
                rows={4}
              />
              <Button
                onClick={addBulkStockKeys}
                disabled={!bulkKeysText.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <FileUp className="h-4 w-4 mr-1" />
                Import Keys
              </Button>
            </div>

            {/* Stock Keys List */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b-2 border-gray-200">
                <h4 className="font-semibold text-gray-900">Stock Keys ({stockKeys.length})</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {stockKeys.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No stock keys added yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key/Code</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell className="font-mono text-sm">
                            {key.keyValue.slice(0, 20)}{key.keyValue.length > 20 ? '...' : ''}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={() => {
                                navigator.clipboard.writeText(key.keyValue);
                                toast({ title: 'Copied!', description: 'Key copied to clipboard' });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TableCell>
                          <TableCell className="text-sm">{key.username || '-'}</TableCell>
                          <TableCell>
                            <Badge className={
                              key.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                              key.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {key.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {key.status === 'AVAILABLE' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteStockKey(key.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
