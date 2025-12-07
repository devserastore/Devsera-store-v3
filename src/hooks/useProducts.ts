import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Product, DeliveryType } from '@/types';
import { mockProducts } from '@/data/mockData';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (!isSupabaseConfigured) {
      setProducts(mockProducts);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(
        data.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.image,
          originalPrice: p.original_price,
          salePrice: p.sale_price,
          duration: p.duration,
          features: p.features,
          category: p.category,
          deliveryType: (p.delivery_type as DeliveryType) || 'CREDENTIALS',
          deliveryInstructions: p.delivery_instructions,
          requiresUserInput: p.requires_user_input,
          userInputLabel: p.user_input_label,
          isActive: p.is_active ?? true,
        }))
      );
    } catch (err) {
      setError(err as Error);
      // Fallback to mock data on error
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  };

  return { products, isLoading, error, refetch: loadProducts };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!isSupabaseConfigured) {
      const mockProduct = mockProducts.find(p => p.id === id);
      setProduct(mockProduct || null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setProduct({
          id: data.id,
          name: data.name,
          description: data.description,
          image: data.image,
          originalPrice: data.original_price,
          salePrice: data.sale_price,
          duration: data.duration,
          features: data.features,
          category: data.category,
          deliveryType: (data.delivery_type as DeliveryType) || 'CREDENTIALS',
          deliveryInstructions: data.delivery_instructions,
          requiresUserInput: data.requires_user_input,
          userInputLabel: data.user_input_label,
          isActive: data.is_active ?? true,
        });
      }
    } catch (err) {
      setError(err as Error);
      // Fallback to mock data on error
      const mockProduct = mockProducts.find(p => p.id === id);
      setProduct(mockProduct || null);
    } finally {
      setIsLoading(false);
    }
  };

  return { product, isLoading, error, refetch: loadProduct };
}
