import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useSettings } from '@/hooks/useSettings';
import { mockProducts, mockSettings } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Upload, CheckCircle2, ArrowLeft, Info, Key, Package, UserCheck, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { isSupabaseConfigured } from '@/lib/supabase';
import { DeliveryType } from '@/types';

const deliveryTypeInfo: Record<DeliveryType, { icon: React.ReactNode; color: string }> = {
  CREDENTIALS: { icon: <Key className="h-5 w-5" />, color: 'text-blue-600' },
  COUPON_CODE: { icon: <Package className="h-5 w-5" />, color: 'text-purple-600' },
  MANUAL_ACTIVATION: { icon: <UserCheck className="h-5 w-5" />, color: 'text-green-600' },
  INSTANT_KEY: { icon: <Zap className="h-5 w-5" />, color: 'text-amber-600' }
};

export function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');

  const { product: dbProduct, isLoading: productLoading } = useProduct(id!);
  const { settings: dbSettings, isLoading: settingsLoading } = useSettings();
  const { createOrder, uploadPaymentScreenshot } = useOrders();

  // Use mock data if Supabase is not configured
  const product = isSupabaseConfigured && dbProduct ? dbProduct : mockProducts.find(p => p.id === id);
  const settings = isSupabaseConfigured && dbSettings ? dbSettings : mockSettings;

  useEffect(() => {
    if (product && !orderId && isSupabaseConfigured) {
      createOrder(product.id).then((order) => {
        setOrderId(order.id);
      }).catch((error) => {
        toast({
          title: 'Error creating order',
          description: error.message,
          variant: 'destructive',
        });
      });
    }
  }, [product]);

  if ((productLoading || settingsLoading) && isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="btn-gradient">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const handleCopyUPI = () => {
    if (settings) {
      navigator.clipboard.writeText(settings.upiId);
      toast({
        title: 'Copied!',
        description: 'UPI ID copied to clipboard',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      toast({
        title: 'Screenshot required',
        description: 'Please upload payment screenshot',
        variant: 'destructive',
      });
      return;
    }

    // Validate user input for manual activation products
    if (product?.requiresUserInput && !userInput.trim()) {
      toast({
        title: 'Account details required',
        description: `Please provide your ${product.userInputLabel || 'account details'}`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 90; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (isSupabaseConfigured && orderId) {
        await uploadPaymentScreenshot(orderId, screenshot, userInput);
      }
      setUploadProgress(100);

      toast({
        title: 'Order submitted!',
        description: 'Your payment is being verified. You will receive credentials within 2 hours.',
      });

      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/product/${id}`)}
          className="mb-6 rounded-xl hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Complete Your Purchase
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="flex items-start gap-4">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.duration}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ₹{(product.salePrice || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <h3 className="font-bold text-amber-800 mb-3 flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                Important Instructions
              </h3>
              <ul className="space-y-2 text-sm text-amber-900">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</span>
                  <span>Scan the QR code or use the UPI ID to make payment</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</span>
                  <span>Take a screenshot of the successful payment</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</span>
                  <span>Upload the screenshot below and submit</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">4</span>
                  <span>You'll receive credentials within 2 hours after verification</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Scan QR Code
              </h2>
              <div className="inline-block rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={settings?.qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-64 h-64"
                />
              </div>
            </div>

            {/* UPI ID */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Or Pay Using UPI ID
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-lg font-semibold bg-gray-100 p-3 rounded-xl">
                  {settings?.upiId}
                </div>
                <Button
                  onClick={handleCopyUPI}
                  variant="outline"
                  className="rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:text-teal-600"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            {product.deliveryType && (
              <div className={`bg-white rounded-2xl border border-gray-200 p-4 shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${deliveryTypeInfo[product.deliveryType].color}`}>
                    {deliveryTypeInfo[product.deliveryType].icon}
                  </div>
                  <span className="font-semibold text-gray-900">Delivery Method</span>
                </div>
                <p className="text-sm text-gray-600">
                  {product.deliveryInstructions || 'You will receive your access within 2 hours of payment verification.'}
                </p>
              </div>
            )}

            {/* User Input for Manual Activation */}
            {product.requiresUserInput && (
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-blue-800">
                    Your Account Details Required
                  </h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  We need your account details to activate the service on your existing account.
                </p>
                <div>
                  <Label htmlFor="userInput" className="font-semibold text-blue-800">
                    {product.userInputLabel || 'Your Account Email/ID'} *
                  </Label>
                  <Input
                    id="userInput"
                    type="text"
                    placeholder={`Enter your ${product.userInputLabel?.toLowerCase() || 'account email'}`}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="border-2 border-blue-200 rounded-xl mt-2 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Upload Screenshot */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Upload Payment Screenshot
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label
                  htmlFor="screenshot-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  {screenshot ? (
                    <>
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                      </div>
                      <p className="font-semibold text-emerald-600">{screenshot.name}</p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-700">Click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center mt-2 text-gray-500">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!screenshot || isUploading || (product.requiresUserInput && !userInput.trim())}
              className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Submitting...' : 'Submit Payment Proof'}
            </Button>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-center text-gray-600">
                Need help?{' '}
                <a
                  href="https://t.me/karthik_nkn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0088cc] font-bold hover:underline"
                >
                  Contact @karthik_nkn on Telegram
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
