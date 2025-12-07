import { useState } from 'react';
import { mockOrders, mockProducts } from '@/data/mockData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Order, OrderStatus } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const { toast } = useToast();

  const ordersWithProducts = mockOrders.map(order => ({
    ...order,
    product: mockProducts.find(p => p.id === order.productId),
  }));

  const filteredOrders = filterStatus === 'ALL'
    ? ordersWithProducts
    : ordersWithProducts.filter(o => o.status === filterStatus);

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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold font-['Space_Grotesk'] mb-2">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track and manage your subscription orders
          </p>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as OrderStatus | 'ALL')} className="mb-6">
          <TabsList className="border-2 border-black bg-white h-auto p-1">
            <TabsTrigger value="ALL" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Orders
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Pending
            </TabsTrigger>
            <TabsTrigger value="SUBMITTED" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Submitted
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Completed
            </TabsTrigger>
            <TabsTrigger value="CANCELLED" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="brutalist-card p-12 text-center">
            <p className="text-muted-foreground text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="brutalist-card p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {order.product && (
                      <img
                        src={order.product.image}
                        alt={order.product.name}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-black"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold font-['Space_Grotesk']">
                            {order.product?.name}
                          </h3>
                          <p className="text-sm font-mono text-muted-foreground">
                            Order ID: {order.id}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <span>
                          Ordered: {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-primary">
                          ₹{order.product?.salePrice}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="text-sm">{getStatusMessage(order.status)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedOrder(order)}
                    variant="outline"
                    className="brutalist-button ml-4"
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
          <DialogContent className="brutalist-card max-w-2xl">
            <DialogHeader>
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
                    <h3 className="font-bold font-['Space_Grotesk'] mb-4">
                      Account Credentials
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-muted p-4 rounded-lg border-2 border-black">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">Username</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(selectedOrder.credentials!.username, 'Username')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-mono text-sm">{selectedOrder.credentials.username}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg border-2 border-black">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">Password</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(selectedOrder.credentials!.password, 'Password')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-mono text-sm">{selectedOrder.credentials.password}</p>
                      </div>
                      <div className="bg-amber-50 border-2 border-amber-500 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-amber-800">
                          ⚠️ Expires on: {new Date(selectedOrder.credentials.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
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
