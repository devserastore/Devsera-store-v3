import { useState } from 'react';
import { useAdminOrders } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, XCircle, Eye, Key, Package, UserCheck, Zap, User } from 'lucide-react';
import { Order, OrderCredentials, DeliveryType } from '@/types';
import { mockOrders, mockProducts } from '@/data/mockData';
import { isSupabaseConfigured } from '@/lib/supabase';

const deliveryTypeLabels: Record<DeliveryType, { label: string; icon: React.ReactNode }> = {
  CREDENTIALS: { label: 'Login Credentials', icon: <Key className="h-4 w-4" /> },
  COUPON_CODE: { label: 'Coupon/License Key', icon: <Package className="h-4 w-4" /> },
  MANUAL_ACTIVATION: { label: 'Manual Activation', icon: <UserCheck className="h-4 w-4" /> },
  INSTANT_KEY: { label: 'Instant Key', icon: <Zap className="h-4 w-4" /> }
};

export function OrderVerificationPanel() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [credentials, setCredentials] = useState<OrderCredentials>({
    username: '',
    password: '',
    couponCode: '',
    licenseKey: '',
    activationStatus: '',
    activationNotes: '',
    expiryDate: '',
    additionalInfo: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const { orders: dbOrders, approveOrder, rejectOrder } = useAdminOrders();

  // Use database orders only, no mock data
  const orders = dbOrders.map(order => ({
    ...order,
    product: mockProducts.find(p => p.id === order.productId),
  }));

  const submittedOrders = orders.filter(o => o.status === 'SUBMITTED');

  const getDeliveryType = (order: Order): DeliveryType => {
    return order.product?.deliveryType || 'CREDENTIALS';
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;

    const deliveryType = getDeliveryType(selectedOrder);
    let isValid = false;
    let credentialsToSend: OrderCredentials = { expiryDate: credentials.expiryDate };

    switch (deliveryType) {
      case 'CREDENTIALS':
        isValid = !!(credentials.username && credentials.password && credentials.expiryDate);
        credentialsToSend = {
          username: credentials.username,
          password: credentials.password,
          expiryDate: credentials.expiryDate,
          additionalInfo: credentials.additionalInfo
        };
        break;
      case 'COUPON_CODE':
        isValid = !!(credentials.couponCode || credentials.licenseKey);
        credentialsToSend = {
          couponCode: credentials.couponCode,
          licenseKey: credentials.licenseKey,
          expiryDate: credentials.expiryDate,
          additionalInfo: credentials.additionalInfo
        };
        break;
      case 'MANUAL_ACTIVATION':
        isValid = !!credentials.activationStatus;
        credentialsToSend = {
          activationStatus: credentials.activationStatus,
          activationNotes: credentials.activationNotes,
          expiryDate: credentials.expiryDate,
          additionalInfo: credentials.additionalInfo
        };
        break;
      case 'INSTANT_KEY':
        isValid = !!credentials.licenseKey;
        credentialsToSend = {
          licenseKey: credentials.licenseKey,
          expiryDate: credentials.expiryDate,
          additionalInfo: credentials.additionalInfo
        };
        break;
    }

    if (!isValid) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isSupabaseConfigured) {
        await approveOrder(selectedOrder.id, credentialsToSend);
      }
      toast({
        title: 'Order approved!',
        description: 'Credentials have been sent to the user.',
      });
      setSelectedOrder(null);
      resetCredentials();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetCredentials = () => {
    setCredentials({
      username: '',
      password: '',
      couponCode: '',
      licenseKey: '',
      activationStatus: '',
      activationNotes: '',
      expiryDate: '',
      additionalInfo: ''
    });
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || !selectedOrder) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isSupabaseConfigured) {
        await rejectOrder(selectedOrder.id, rejectionReason);
      }
      toast({
        title: 'Order rejected',
        description: 'User has been notified of the cancellation.',
      });
      setSelectedOrder(null);
      setRejectionReason('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderCredentialsForm = (deliveryType: DeliveryType) => {
    switch (deliveryType) {
      case 'CREDENTIALS':
        return (
          <>
            <div>
              <Label htmlFor="username">Account Username *</Label>
              <Input
                id="username"
                placeholder="user@service.com"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="border-2 border-black"
              />
            </div>
            <div>
              <Label htmlFor="password">Account Password *</Label>
              <Input
                id="password"
                type="text"
                placeholder="SecurePass123"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="border-2 border-black"
              />
            </div>
          </>
        );
      case 'COUPON_CODE':
        return (
          <>
            <div>
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                placeholder="PROMO-XXXX-XXXX"
                value={credentials.couponCode}
                onChange={(e) => setCredentials({ ...credentials, couponCode: e.target.value })}
                className="border-2 border-black font-mono"
              />
            </div>
            <div>
              <Label htmlFor="licenseKey">License Key</Label>
              <Input
                id="licenseKey"
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                value={credentials.licenseKey}
                onChange={(e) => setCredentials({ ...credentials, licenseKey: e.target.value })}
                className="border-2 border-black font-mono"
              />
            </div>
          </>
        );
      case 'MANUAL_ACTIVATION':
        return (
          <>
            <div>
              <Label htmlFor="activationStatus">Activation Status *</Label>
              <Input
                id="activationStatus"
                placeholder="e.g., Activated, Added to Family Plan"
                value={credentials.activationStatus}
                onChange={(e) => setCredentials({ ...credentials, activationStatus: e.target.value })}
                className="border-2 border-black"
              />
            </div>
            <div>
              <Label htmlFor="activationNotes">Activation Notes</Label>
              <Textarea
                id="activationNotes"
                placeholder="Any additional instructions for the user..."
                value={credentials.activationNotes}
                onChange={(e) => setCredentials({ ...credentials, activationNotes: e.target.value })}
                className="border-2 border-black"
              />
            </div>
          </>
        );
      case 'INSTANT_KEY':
        return (
          <div>
            <Label htmlFor="licenseKey">License Key *</Label>
            <Input
              id="licenseKey"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
              value={credentials.licenseKey}
              onChange={(e) => setCredentials({ ...credentials, licenseKey: e.target.value })}
              className="border-2 border-black font-mono"
            />
          </div>
        );
    }
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
                      src={order.product.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'}
                      alt={order.product.name}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-black bg-gray-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                      }}
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
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {deliveryTypeLabels[order.product?.deliveryType || 'CREDENTIALS'].icon}
                        {deliveryTypeLabels[order.product?.deliveryType || 'CREDENTIALS'].label}
                      </span>
                    </div>
                    {order.userProvidedInput && (() => {
                      try {
                        const parsed = JSON.parse(order.userProvidedInput);
                        if (parsed.email && parsed.password) {
                          return (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm space-y-1">
                              <span className="flex items-center gap-1 text-blue-700">
                                <User className="h-3 w-3" />
                                Email: <span className="font-mono font-semibold">{parsed.email}</span>
                              </span>
                              <span className="flex items-center gap-1 text-blue-700">
                                <Key className="h-3 w-3" />
                                Password: <span className="font-mono font-semibold">{parsed.password}</span>
                              </span>
                            </div>
                          );
                        }
                      } catch {
                        // Not JSON, show as plain text
                      }
                      return (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          <span className="flex items-center gap-1 text-blue-700">
                            <User className="h-3 w-3" />
                            User's Account: <span className="font-mono font-semibold">{order.userProvidedInput}</span>
                          </span>
                        </div>
                      );
                    })()}
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
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Delivery Type:</span>
                      <span className="flex items-center gap-1 font-semibold">
                        {deliveryTypeLabels[getDeliveryType(selectedOrder)].icon}
                        {deliveryTypeLabels[getDeliveryType(selectedOrder)].label}
                      </span>
                    </div>
                    {selectedOrder.userProvidedInput && (() => {
                      try {
                        const parsed = JSON.parse(selectedOrder.userProvidedInput);
                        if (parsed.email && parsed.password) {
                          return (
                            <div className="pt-2 border-t space-y-2">
                              <div>
                                <span className="text-muted-foreground">User's Email:</span>
                                <p className="font-mono font-semibold text-blue-600 mt-1">
                                  {parsed.email}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">User's Password:</span>
                                <p className="font-mono font-semibold text-blue-600 mt-1">
                                  {parsed.password}
                                </p>
                              </div>
                            </div>
                          );
                        }
                      } catch {
                        // Not JSON, show as plain text
                      }
                      return (
                        <div className="pt-2 border-t">
                          <span className="text-muted-foreground">User's Account:</span>
                          <p className="font-mono font-semibold text-blue-600 mt-1">
                            {selectedOrder.userProvidedInput}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="space-y-6">
                {/* Approve Section */}
                <div className="brutalist-card p-6 border-green-500">
                  <h3 className="font-bold font-['Space_Grotesk'] mb-4 text-green-600 flex items-center gap-2">
                    {deliveryTypeLabels[getDeliveryType(selectedOrder)].icon}
                    Approve Order - {deliveryTypeLabels[getDeliveryType(selectedOrder)].label}
                  </h3>
                  <div className="space-y-4">
                    {renderCredentialsForm(getDeliveryType(selectedOrder))}
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
                    <div>
                      <Label htmlFor="additionalInfo">Additional Info (Optional)</Label>
                      <Textarea
                        id="additionalInfo"
                        placeholder="Any extra instructions for the user..."
                        value={credentials.additionalInfo}
                        onChange={(e) => setCredentials({ ...credentials, additionalInfo: e.target.value })}
                        className="border-2 border-black"
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={handleApprove}
                      className="w-full brutalist-button bg-green-600 text-white hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve & Send to User
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
