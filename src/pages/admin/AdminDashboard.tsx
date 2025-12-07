import { mockOrders, mockProducts } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderVerificationPanel } from '@/components/admin/OrderVerificationPanel';
import { AccountPoolManager } from '@/components/admin/AccountPoolManager';
import { SettingsPanel } from '@/components/admin/SettingsPanel';

export function AdminDashboard() {
  const totalRevenue = mockOrders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, order) => {
      const product = mockProducts.find(p => p.id === order.productId);
      return sum + (product?.salePrice || 0);
    }, 0);

  const orderCounts = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'PENDING').length,
    submitted: mockOrders.filter(o => o.status === 'SUBMITTED').length,
    completed: mockOrders.filter(o => o.status === 'COMPLETED').length,
    cancelled: mockOrders.filter(o => o.status === 'CANCELLED').length,
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold font-['Space_Grotesk'] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage orders, accounts, and platform settings
          </p>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="brutalist-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-['Space_Grotesk'] text-primary">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {orderCounts.completed} completed orders
              </p>
            </CardContent>
          </Card>

          <Card className="brutalist-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Total Orders</CardTitle>
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-['Space_Grotesk']">
                {orderCounts.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card className="brutalist-card border-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Pending Verification</CardTitle>
              <Clock className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-['Space_Grotesk'] text-amber-600">
                {orderCounts.submitted}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting your action
              </p>
            </CardContent>
          </Card>

          <Card className="brutalist-card border-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-['Space_Grotesk'] text-green-600">
                {orderCounts.completed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully delivered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="border-2 border-black bg-white h-auto p-1">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              Order Verification
            </TabsTrigger>
            <TabsTrigger
              value="accounts"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              Account Pool
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrderVerificationPanel />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountPoolManager />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
