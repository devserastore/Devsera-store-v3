import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Order, OrderStatus, OrderCredentials, DeliveryType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(
        data.map((o) => ({
          id: o.id,
          userId: o.user_id,
          productId: o.product_id,
          status: o.status as OrderStatus,
          paymentScreenshot: o.payment_screenshot || undefined,
          userProvidedInput: o.user_provided_input || undefined,
          credentials: o.credentials || undefined,
          cancellationReason: o.cancellation_reason || undefined,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          product: o.product ? {
            id: o.product.id,
            name: o.product.name,
            description: o.product.description,
            image: o.product.image,
            originalPrice: o.product.original_price,
            salePrice: o.product.sale_price,
            duration: o.product.duration,
            features: o.product.features,
            category: o.product.category,
            deliveryType: o.product.delivery_type as DeliveryType || 'CREDENTIALS',
            deliveryInstructions: o.product.delivery_instructions,
            requiresUserInput: o.product.requires_user_input,
            userInputLabel: o.product.user_input_label,
            isActive: o.product.is_active,
          } : undefined,
        }))
      );
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (productId: string, userProvidedInput?: string) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: productId,
        status: 'PENDING',
        user_provided_input: userProvidedInput || null,
      })
      .select()
      .single();

    if (error) throw error;
    await loadOrders();
    return data;
  };

  const uploadPaymentScreenshot = async (orderId: string, file: File, userProvidedInput?: string) => {
    if (!user) throw new Error('User not authenticated');

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}-${Date.now()}.${fileExt}`;
    const filePath = `payment-screenshots/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('order-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('order-files')
      .getPublicUrl(filePath);

    // Update order
    const updateData: any = {
      payment_screenshot: publicUrl,
      status: 'SUBMITTED',
    };
    
    if (userProvidedInput) {
      updateData.user_provided_input = userProvidedInput;
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) throw updateError;
    await loadOrders();
  };

  return { orders, isLoading, error, refetch: loadOrders, createOrder, uploadPaymentScreenshot };
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(*),
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(
        data.map((o) => ({
          id: o.id,
          userId: o.user_id,
          productId: o.product_id,
          status: o.status as OrderStatus,
          paymentScreenshot: o.payment_screenshot || undefined,
          userProvidedInput: o.user_provided_input || undefined,
          credentials: o.credentials || undefined,
          cancellationReason: o.cancellation_reason || undefined,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          product: o.product ? {
            id: o.product.id,
            name: o.product.name,
            description: o.product.description,
            image: o.product.image,
            originalPrice: o.product.original_price,
            salePrice: o.product.sale_price,
            duration: o.product.duration,
            features: o.product.features,
            category: o.product.category,
            deliveryType: o.product.delivery_type as DeliveryType || 'CREDENTIALS',
            deliveryInstructions: o.product.delivery_instructions,
            requiresUserInput: o.product.requires_user_input,
            userInputLabel: o.product.user_input_label,
            isActive: o.product.is_active,
          } : undefined,
        }))
      );
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveOrder = async (orderId: string, credentials: OrderCredentials) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'COMPLETED',
        credentials,
      })
      .eq('id', orderId);

    if (error) throw error;
    await loadOrders();
  };

  const rejectOrder = async (orderId: string, reason: string) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'CANCELLED',
        cancellation_reason: reason,
      })
      .eq('id', orderId);

    if (error) throw error;
    await loadOrders();
  };

  return { orders, isLoading, error, refetch: loadOrders, approveOrder, rejectOrder };
}
