import { useState, useEffect } from 'react';
import { useAdminOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, XCircle, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderVerificationPanel } from '@/components/admin/OrderVerificationPanel';
import { AccountPoolManager } from '@/components/admin/AccountPoolManager';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { ProductManager } from '@/components/admin/ProductManager';
import { CustomerManager } from '@/components/admin/CustomerManager';
import { mockOrders, mockProducts } from '@/data/mockData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export function AdminDashboard() {
  const { orders: dbOrders, isLoading } = useAdminOrders();
  const { products: dbProducts } = useProducts();
  const [userCount, setUserCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch user count
  useEffect(() => {
    const fetchUserCount = async () => {
      if (!isSupabaseConfigured) {
        // Mock user count
        setUserCount(42);
        setUsersLoading(false);
        return;
      }

      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        setUserCount(count || 0);
      } catch (err) {
        console.error('Error fetching user count:', err);
        setUserCount(0);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  // Use database orders only, no mock data
  const orders = dbOrders.map(order => ({
    ...order,
    product: mockProducts.find(p => p.id === order.productId),
  }));
  const products = isSupabaseConfigured && dbProducts.length > 0 ? dbProducts : mockProducts;

  const totalRevenue = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, order) => {
      return sum + (order.product?.salePrice || 0);
    }, 0);

  const orderCounts = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    submitted: orders.filter(o => o.status === 'SUBMITTED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  };

  if (isLoading && isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-500">
            Manage orders, accounts, and platform settings
          </p>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Total Revenue</CardTitle>
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                From {orderCounts.completed} completed orders
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Users</CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {usersLoading ? '...' : userCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Registered accounts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Total Orders</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {orderCounts.total}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Pending</CardTitle>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-amber-600">
                {orderCounts.submitted}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting action
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Completed</CardTitle>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
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
          <TabsList className="border-2 border-black bg-white h-auto p-1 flex-wrap">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              Order Verification
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              Customers
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

          <TabsContent value="products">
            <ProductManager />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManager />
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
