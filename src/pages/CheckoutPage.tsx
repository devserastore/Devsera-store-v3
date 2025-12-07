import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockProducts, mockSettings } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Upload, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button onClick={() => navigate('/')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(mockSettings.upiId);
    toast({
      title: 'Copied!',
      description: 'UPI ID copied to clipboard',
    });
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

    setIsUploading(true);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    toast({
      title: 'Order submitted!',
      description: 'Your payment is being verified. You will receive credentials within 2 hours.',
    });

    setTimeout(() => {
      navigate('/orders');
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="outline"
          onClick={() => navigate(`/product/${id}`)}
          className="brutalist-button mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-4xl font-extrabold font-['Space_Grotesk'] mb-8">
          Complete Your Purchase
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="brutalist-card p-6">
              <h2 className="text-xl font-bold font-['Space_Grotesk'] mb-4">
                Order Summary
              </h2>
              <div className="flex items-start space-x-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-black"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.duration}</p>
                  <p className="text-2xl font-bold font-['Space_Grotesk'] text-primary mt-2">
                    ₹{product.salePrice}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="brutalist-card p-6 bg-amber-50 border-amber-500">
              <h3 className="font-bold font-['Space_Grotesk'] mb-3 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                Important Instructions
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Scan the QR code or use the UPI ID to make payment</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Take a screenshot of the successful payment</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Upload the screenshot below and submit</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>You'll receive credentials within 2 hours after verification</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="brutalist-card p-6 text-center">
              <h2 className="text-xl font-bold font-['Space_Grotesk'] mb-4">
                Scan QR Code
              </h2>
              <div className="inline-block brutalist-shadow">
                <img
                  src={mockSettings.qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-64 h-64 border-4 border-black"
                />
              </div>
            </div>

            {/* UPI ID */}
            <div className="brutalist-card p-6">
              <Label className="text-sm font-semibold mb-2 block">
                Or Pay Using UPI ID
              </Label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 font-mono text-lg font-semibold bg-muted p-3 rounded-md border-2 border-black">
                  {mockSettings.upiId}
                </div>
                <Button
                  onClick={handleCopyUPI}
                  variant="outline"
                  className="brutalist-button"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Upload Screenshot */}
            <div className="brutalist-card p-6">
              <Label className="text-sm font-semibold mb-2 block">
                Upload Payment Screenshot
              </Label>
              <div className="border-2 border-dashed border-black rounded-lg p-6 text-center">
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
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                      <p className="font-semibold text-green-600">{screenshot.name}</p>
                      <p className="text-xs text-muted-foreground">Click to change</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="font-semibold">Click to upload</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center mt-2 text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!screenshot || isUploading}
              className="w-full brutalist-button bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg"
            >
              {isUploading ? 'Submitting...' : 'Submit Payment Proof'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Need help? Contact us on{' '}
              <a
                href={mockSettings.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Telegram
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
