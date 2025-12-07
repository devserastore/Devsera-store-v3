import { useState } from 'react';
import { mockAccounts, mockProducts } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Ban } from 'lucide-react';

export function AccountPoolManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    productId: '',
    username: '',
    password: '',
    maxSlots: 5,
    expiryDate: '',
  });
  const { toast } = useToast();

  const handleAddAccount = () => {
    if (!newAccount.productId || !newAccount.username || !newAccount.password || !newAccount.expiryDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Account added!',
      description: 'New account has been added to the pool.',
    });
    setIsAddDialogOpen(false);
    setNewAccount({
      productId: '',
      username: '',
      password: '',
      maxSlots: 5,
      expiryDate: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: 'bg-green-100 text-green-800 border-green-500',
      blocked: 'bg-red-100 text-red-800 border-red-500',
      expired: 'bg-gray-100 text-gray-800 border-gray-500',
    };
    return (
      <Badge variant="outline" className={`border-2 uppercase ${config[status as keyof typeof config]}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-['Space_Grotesk'] mb-2">
            Account Pool
          </h2>
          <p className="text-muted-foreground">
            Manage shared accounts for all products
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brutalist-button bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="brutalist-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-['Space_Grotesk']">
                Add New Account
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product">Product</Label>
                <Select value={newAccount.productId} onValueChange={(v) => setNewAccount({ ...newAccount, productId: v })}>
                  <SelectTrigger className="border-2 border-black">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="acc-username">Username</Label>
                <Input
                  id="acc-username"
                  placeholder="account@service.com"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                  className="border-2 border-black"
                />
              </div>
              <div>
                <Label htmlFor="acc-password">Password</Label>
                <Input
                  id="acc-password"
                  type="text"
                  placeholder="SecurePassword123"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  className="border-2 border-black"
                />
              </div>
              <div>
                <Label htmlFor="max-slots">Max Slots</Label>
                <Input
                  id="max-slots"
                  type="number"
                  min="1"
                  max="10"
                  value={newAccount.maxSlots}
                  onChange={(e) => setNewAccount({ ...newAccount, maxSlots: parseInt(e.target.value) })}
                  className="border-2 border-black"
                />
              </div>
              <div>
                <Label htmlFor="acc-expiry">Expiry Date</Label>
                <Input
                  id="acc-expiry"
                  type="date"
                  value={newAccount.expiryDate}
                  onChange={(e) => setNewAccount({ ...newAccount, expiryDate: e.target.value })}
                  className="border-2 border-black"
                />
              </div>
              <Button
                onClick={handleAddAccount}
                className="w-full brutalist-button bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Add Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="brutalist-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="font-bold">Product</TableHead>
              <TableHead className="font-bold">Username</TableHead>
              <TableHead className="font-bold">Password</TableHead>
              <TableHead className="font-bold">Slots</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Expiry</TableHead>
              <TableHead className="font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAccounts.map(account => {
              const product = mockProducts.find(p => p.id === account.productId);
              const utilization = (account.usedSlots / account.maxSlots) * 100;
              
              return (
                <TableRow key={account.id} className="border-b border-black/20">
                  <TableCell className="font-semibold">{product?.name}</TableCell>
                  <TableCell className="font-mono text-sm">{account.username}</TableCell>
                  <TableCell className="font-mono text-sm">{'•'.repeat(12)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{account.usedSlots}/{account.maxSlots}</span>
                        <span className="text-muted-foreground">{Math.round(utilization)}%</span>
                      </div>
                      <Progress value={utilization} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {new Date(account.expiryDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="brutalist-button">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" className="brutalist-button">
                        <Ban className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
