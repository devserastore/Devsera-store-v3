import { useState } from 'react';
import { mockOrders, mockProducts } from '@/data/mockData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Order } from '@/types';

export function OrderVerificationPanel() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [credentials, setCredentials] = useState({ username: '', password: '', expiryDate: '' });
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  const submittedOrders = mockOrders
    .filter(o => o.status === 'SUBMITTED')
    .map(order => ({
      ...order,
      product: mockProducts.find(p => p.id === order.productId),
    }));

  const handleApprove = () => {
    if (!credentials.username || !credentials.password || !credentials.expiryDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all credential fields',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Order approved!',
      description: 'Credentials have been sent to the user.',
    });
    setSelectedOrder(null);
    setCredentials({ username: '', password: '', expiryDate: '' });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Order rejected',
      description: 'User has been notified of the cancellation.',
    });
    setSelectedOrder(null);
    setRejectionReason('');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] mb-2">
          Pending Verification
        </h2>
        <p className="text-muted-foreground">
          Review payment screenshots and approve or reject orders
        </p>
      </div>

      {submittedOrders.length === 0 ? (
        <div className="brutalist-card p-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">All caught up!</p>
          <p className="text-muted-foreground">No orders pending verification</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submittedOrders.map(order => (
            <div key={order.id} className="brutalist-card p-6">
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
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        Submitted: {new Date(order.updatedAt).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-primary">
                        ₹{order.product?.salePrice}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedOrder(order)}
                  className="brutalist-button bg-primary text-primary-foreground hover:bg-primary/90 ml-4"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="brutalist-card max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-['Space_Grotesk']">
              Verify Order
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Screenshot Preview */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-['Space_Grotesk'] mb-2">
                    Payment Screenshot
                  </h3>
                  <div className="brutalist-card overflow-hidden">
                    <img
                      src={selectedOrder.paymentScreenshot || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80'}
                      alt="Payment proof"
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                <div className="brutalist-card p-4 bg-muted/30">
                  <h4 className="font-semibold mb-2">Order Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product:</span>
                      <span className="font-semibold">{selectedOrder.product?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-primary">₹{selectedOrder.product?.salePrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="space-y-6">
                {/* Approve Section */}
                <div className="brutalist-card p-6 border-green-500">
                  <h3 className="font-bold font-['Space_Grotesk'] mb-4 text-green-600">
                    Approve Order
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Account Username</Label>
                      <Input
                        id="username"
                        placeholder="user@service.com"
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        className="border-2 border-black"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Account Password</Label>
                      <Input
                        id="password"
                        type="text"
                        placeholder="SecurePass123"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className="border-2 border-black"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        type="date"
                        value={credentials.expiryDate}
                        onChange={(e) => setCredentials({ ...credentials, expiryDate: e.target.value })}
                        className="border-2 border-black"
                      />
                    </div>
                    <Button
                      onClick={handleApprove}
                      className="w-full brutalist-button bg-green-600 text-white hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve & Send Credentials
                    </Button>
                  </div>
                </div>

                {/* Reject Section */}
                <div className="brutalist-card p-6 border-red-500">
                  <h3 className="font-bold font-['Space_Grotesk'] mb-4 text-red-600">
                    Reject Order
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Rejection Reason</Label>
                      <Textarea
                        id="reason"
                        placeholder="e.g., Invalid payment screenshot, amount mismatch..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="border-2 border-black min-h-[100px]"
                      />
                    </div>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      className="w-full brutalist-button"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Order
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
