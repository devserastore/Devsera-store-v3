import { useState, useEffect } from 'react';
import { useAdminOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useAdminTickets } from '@/hooks/useTickets';
import { useAdminBundles } from '@/hooks/useBundles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, XCircle, Users, MessageSquare, Package, Ticket, TrendingUp, Activity, BarChart3, ArrowUpRight, ArrowDownRight, Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderVerificationPanel } from '@/components/admin/OrderVerificationPanel';
import { AccountPoolManager } from '@/components/admin/AccountPoolManager';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { ProductManager } from '@/components/admin/ProductManager';
import { CustomerManager } from '@/components/admin/CustomerManager';
import { CommunityManager } from '@/components/admin/CommunityManager';
import { BundleManager } from '@/components/admin/BundleManager';
import { TicketManager } from '@/components/admin/TicketManager';
import { RewardsManager } from '@/components/admin/RewardsManager';
import { mockOrders, mockProducts } from '@/data/mockData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export function AdminDashboard() {
  const { orders: dbOrders, isLoading } = useAdminOrders();
  const { products: dbProducts } = useProducts();
  const { stats: ticketStats } = useAdminTickets();
  const { bundles } = useAdminBundles();
  const [userCount, setUserCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [todayOrders, setTodayOrders] = useState(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);

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

  // Calculate today's orders and weekly growth
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = orders.filter(o => new Date(o.createdAt) >= today).length;
    setTodayOrders(todayCount);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const thisWeekOrders = orders.filter(o => new Date(o.createdAt) >= lastWeek).length;
    const prevWeekStart = new Date(lastWeek);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= prevWeekStart && date < lastWeek;
    }).length;
    
    if (prevWeekOrders > 0) {
      setWeeklyGrowth(Math.round(((thisWeekOrders - prevWeekOrders) / prevWeekOrders) * 100));
    } else {
      setWeeklyGrowth(thisWeekOrders > 0 ? 100 : 0);
    }
  }, [orders]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
              Admin Dashboard
            </h1>
            <p className="text-gray-500">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl border-2 border-gray-200 px-4 py-2">
              <p className="text-xs text-gray-500">Today's Date</p>
              <p className="font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics - Professional Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {/* Revenue Card */}
          <Card className="col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${weeklyGrowth >= 0 ? 'text-emerald-100' : 'text-red-200'}`}>
                  {weeklyGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(weeklyGrowth)}%
                </div>
              </div>
              <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-emerald-100 text-xs mt-1">{orderCounts.completed} completed orders</p>
            </CardContent>
          </Card>

          {/* Orders Today */}
          <Card className="col-span-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-sm text-blue-100">
                  <TrendingUp className="h-4 w-4" />
                  Live
                </div>
              </div>
              <p className="text-blue-100 text-sm font-medium">Today's Orders</p>
              <p className="text-3xl font-bold">{todayOrders}</p>
              <p className="text-blue-100 text-xs mt-1">{orderCounts.submitted} awaiting action</p>
            </CardContent>
          </Card>

          {/* Users */}
          <Card className="bg-white border-2 border-gray-100 hover:border-purple-200 transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Users</p>
              <p className="text-2xl font-bold text-gray-900">{usersLoading ? '...' : userCount}</p>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="bg-white border-2 border-gray-100 hover:border-orange-200 transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </CardContent>
          </Card>

          {/* Bundles */}
          <Card className="bg-white border-2 border-gray-100 hover:border-pink-200 transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-3">
                <Package className="h-5 w-5 text-pink-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Bundles</p>
              <p className="text-2xl font-bold text-gray-900">{bundles.length}</p>
            </CardContent>
          </Card>

          {/* Open Tickets */}
          <Card className={`bg-white border-2 transition-all hover:shadow-lg ${ticketStats.open > 0 ? 'border-red-200 bg-red-50/50' : 'border-gray-100'}`}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${ticketStats.open > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Ticket className={`h-5 w-5 ${ticketStats.open > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
              <p className="text-xs text-gray-500 font-medium">Open Tickets</p>
              <p className={`text-2xl font-bold ${ticketStats.open > 0 ? 'text-red-600' : 'text-gray-900'}`}>{ticketStats.open}</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{orderCounts.pending}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Submitted</p>
              <p className="text-2xl font-bold text-blue-600">{orderCounts.submitted}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{orderCounts.completed}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{orderCounts.cancelled}</p>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white border-2 border-gray-200 h-auto p-1.5 flex-wrap rounded-xl shadow-sm">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg"
            >
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg relative"
            >
              <Ticket className="h-4 w-4 mr-1.5" />
              Tickets
              {ticketStats.open > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {ticketStats.open}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg"
            >
              Customers
            </TabsTrigger>
            <TabsTrigger
              value="accounts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg"
            >
              Account Pool
            </TabsTrigger>
            <TabsTrigger
              value="bundles"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg"
            >
              <Package className="h-4 w-4 mr-1.5" />
              Bundles
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg"
            >
              <Gift className="h-4 w-4 mr-1.5" />
              Rewards
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg"
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Community
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrderVerificationPanel />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketManager />
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

          <TabsContent value="bundles">
            <BundleManager />
          </TabsContent>

          <TabsContent value="rewards">
            <RewardsManager />
          </TabsContent>

          <TabsContent value="community">
            <CommunityManager />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
