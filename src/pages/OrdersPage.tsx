import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Eye, Clock, CheckCircle2, XCircle, AlertCircle, Key, Package, UserCheck, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Order, OrderStatus, DeliveryType } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isSupabaseConfigured } from '@/lib/supabase';

const deliveryTypeLabels: Record<DeliveryType, { label: string; icon: React.ReactNode }> = {
  CREDENTIALS: { label: 'Login Credentials', icon: <Key className="h-4 w-4" /> },
  COUPON_CODE: { label: 'Coupon/License Key', icon: <Package className="h-4 w-4" /> },
  MANUAL_ACTIVATION: { label: 'Manual Activation', icon: <UserCheck className="h-4 w-4" /> },
  INSTANT_KEY: { label: 'Instant Key', icon: <Zap className="h-4 w-4" /> }
};

export function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const { toast } = useToast();
  const { orders: dbOrders, isLoading, refetch } = useOrders();

  // Use database orders with their associated products
  const orders = dbOrders;

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  if (isLoading && isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-[#0A7A7A] mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'SUBMITTED':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Awaiting payment upload';
      case 'SUBMITTED':
        return 'Payment under verification';
      case 'COMPLETED':
        return 'Order completed successfully';
      case 'CANCELLED':
        return 'Order cancelled';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              My Orders
            </h1>
            <p className="text-gray-500">
              Track and manage your subscription orders
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refetch}
            disabled={isLoading}
            className="border-2 border-black hover:bg-gray-100 w-fit"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as OrderStatus | 'ALL')}>
            <TabsList className="bg-white border border-gray-200 rounded-xl p-1 inline-flex min-w-max">
              <TabsTrigger value="ALL" className="rounded-lg data-[state=active]:bg-gray-900 data-[state=active]:text-white px-4">
                All Orders
              </TabsTrigger>
              <TabsTrigger value="PENDING" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white px-4">
                Pending
              </TabsTrigger>
              <TabsTrigger value="SUBMITTED" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4">
                Submitted
              </TabsTrigger>
              <TabsTrigger value="COMPLETED" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-4">
                Completed
              </TabsTrigger>
              <TabsTrigger value="CANCELLED" className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white px-4">
                Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-black p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === 'ALL' 
                ? "You haven't placed any orders yet. Browse our products to get started!"
                : `No ${filterStatus.toLowerCase()} orders found.`}
            </p>
            {filterStatus !== 'ALL' && (
              <Button
                variant="outline"
                onClick={() => setFilterStatus('ALL')}
                className="border-2 border-black"
              >
                View All Orders
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border-2 border-black p-4 md:p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {order.product && (
                    <img
                      src={order.product.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'}
                      alt={order.product.name}
                      className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-xl bg-gray-100 border-2 border-black"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {order.product?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-sm font-mono text-gray-500">
                          Order ID: {order.id.slice(0, 8)}...
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-500 mb-3">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="font-bold text-[#0A7A7A] text-lg">
                        ₹{(order.product?.salePrice || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm text-gray-600">{getStatusMessage(order.status)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedOrder(order)}
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl border-2 border-black hover:bg-[#0A7A7A] hover:text-white hover:border-[#0A7A7A]"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader className="border-b-2 border-black pb-4">
              <DialogTitle className="text-2xl font-bold font-['Space_Grotesk']">
                Order Details
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <span className="font-mono font-semibold">{selectedOrder.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Product</span>
                    <span className="font-semibold">{selectedOrder.product?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{selectedOrder.product?.salePrice}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t-2 border-black pt-6">
                  <h3 className="font-bold font-['Space_Grotesk'] mb-4">Order Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold">Order Created</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.status !== 'PENDING' && (
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-semibold">Payment Submitted</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {new Date(selectedOrder.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Credentials */}
                {selectedOrder.status === 'COMPLETED' && selectedOrder.credentials && (
                  <div className="border-t-2 border-black pt-6">
                    <h3 className="font-bold font-['Space_Grotesk'] mb-4 flex items-center gap-2">
                      {deliveryTypeLabels[selectedOrder.product?.deliveryType || 'CREDENTIALS'].icon}
                      {selectedOrder.product?.deliveryType === 'MANUAL_ACTIVATION' 
                        ? 'Activation Status' 
                        : selectedOrder.product?.deliveryType === 'COUPON_CODE' || selectedOrder.product?.deliveryType === 'INSTANT_KEY'
                        ? 'Your License/Code'
                        : 'Account Credentials'}
                    </h3>
                    <div className="space-y-3">
                      {/* Username/Password for CREDENTIALS type */}
                      {selectedOrder.credentials.username && (
                        <div className="bg-muted p-4 rounded-lg border-2 border-black">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">Username</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(selectedOrder.credentials!.username!, 'Username')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-mono text-sm">{selectedOrder.credentials.username}</p>
                        </div>
                      )}
                      {selectedOrder.credentials.password && (
                        <div className="bg-muted p-4 rounded-lg border-2 border-black">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">Password</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(selectedOrder.credentials!.password!, 'Password')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-mono text-sm">{selectedOrder.credentials.password}</p>
                        </div>
                      )}

                      {/* Coupon Code */}
                      {selectedOrder.credentials.couponCode && (
                        <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-500">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-purple-700">Coupon Code</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(selectedOrder.credentials!.couponCode!, 'Coupon Code')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-mono text-lg font-bold text-purple-700">{selectedOrder.credentials.couponCode}</p>
                        </div>
                      )}

                      {/* License Key */}
                      {selectedOrder.credentials.licenseKey && (
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-500">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-blue-700">License Key</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(selectedOrder.credentials!.licenseKey!, 'License Key')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-mono text-lg font-bold text-blue-700">{selectedOrder.credentials.licenseKey}</p>
                        </div>
                      )}

                      {/* Activation Link */}
                      {selectedOrder.credentials.activationLink && (
                        <div className="bg-teal-50 p-4 rounded-lg border-2 border-teal-500">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-teal-700">Activation Link</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(selectedOrder.credentials!.activationLink!, 'Activation Link')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <a 
                            href={selectedOrder.credentials.activationLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                          >
                            Click to Activate
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}

                      {/* Activation Status for MANUAL_ACTIVATION */}
                      {selectedOrder.credentials.activationStatus && (
                        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">Activation Status</span>
                          </div>
                          <p className="font-semibold text-green-700">{selectedOrder.credentials.activationStatus}</p>
                          {selectedOrder.credentials.activationNotes && (
                            <p className="text-sm text-green-600 mt-2">{selectedOrder.credentials.activationNotes}</p>
                          )}
                        </div>
                      )}

                      {/* Additional Info */}
                      {selectedOrder.credentials.additionalInfo && (
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                          <span className="text-sm font-semibold">Additional Instructions</span>
                          <p className="text-sm mt-1">{selectedOrder.credentials.additionalInfo}</p>
                        </div>
                      )}

                      {/* Expiry Warning */}
                      {selectedOrder.credentials.expiryDate && (
                        <div className="bg-amber-50 border-2 border-amber-500 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-amber-800">
                            ⚠️ Expires on: {new Date(selectedOrder.credentials.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancellation Reason */}
                {selectedOrder.status === 'CANCELLED' && selectedOrder.cancellationReason && (
                  <div className="border-t-2 border-black pt-6">
                    <h3 className="font-bold font-['Space_Grotesk'] mb-2 text-red-600">
                      Cancellation Reason
                    </h3>
                    <p className="text-sm">{selectedOrder.cancellationReason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
