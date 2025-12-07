import { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Save, Upload, Copy, CheckCircle2 } from 'lucide-react';

export function SettingsPanel() {
  const { settings, updateSettings, uploadQrCode, isLoading } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local settings when settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;

    try {
      await updateSettings(localSettings);
      toast({
        title: 'Settings saved!',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadQrCode(file);
      setLocalSettings({ ...localSettings!, qrCodeUrl: url });
      toast({
        title: 'QR Code uploaded!',
        description: 'Click Save Settings to apply changes.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUpi = () => {
    if (localSettings?.upiId) {
      navigator.clipboard.writeText(localSettings.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'UPI ID copied to clipboard',
      });
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center p-12">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] mb-2">
          Platform Settings
        </h2>
        <p className="text-muted-foreground">
          Configure payment details and contact information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-6">
          <div className="brutalist-card p-6">
            <h3 className="font-bold font-['Space_Grotesk'] mb-4">
              Payment Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="upi-id">UPI ID</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="upi-id"
                    value={localSettings?.upiId || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings!, upiId: e.target.value })}
                    className="border-2 border-black font-mono flex-1"
                    placeholder="yourname@upi"
                  />
                  <Button 
                    variant="outline" 
                    className="brutalist-button"
                    onClick={handleCopyUpi}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This UPI ID will be shown to customers for payment
                </p>
              </div>
              <div>
                <Label htmlFor="qr-code">QR Code Image</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="qr-code"
                    value={localSettings?.qrCodeUrl || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings!, qrCodeUrl: e.target.value })}
                    className="border-2 border-black flex-1"
                    placeholder="https://... or upload image"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleQrUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    className="brutalist-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your payment QR code image or paste URL
                </p>
              </div>
            </div>
          </div>

          <div className="brutalist-card p-6">
            <h3 className="font-bold font-['Space_Grotesk'] mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="telegram">Telegram Support Link</Label>
                <Input
                  id="telegram"
                  value={localSettings?.telegramLink || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings!, telegramLink: e.target.value })}
                  className="border-2 border-black mt-1"
                  placeholder="https://t.me/yourusername"
                />
              </div>
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={localSettings?.contactEmail || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings!, contactEmail: e.target.value })}
                  className="border-2 border-black mt-1"
                  placeholder="support@yourstore.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={localSettings?.contactPhone || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings!, contactPhone: e.target.value })}
                  className="border-2 border-black mt-1"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full brutalist-button bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <div className="brutalist-card p-6">
            <h3 className="font-bold font-['Space_Grotesk'] mb-4">
              Payment Preview
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This is how customers will see your payment details
            </p>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">QR Code</p>
                <div className="inline-block brutalist-shadow">
                  {localSettings?.qrCodeUrl ? (
                    <img
                      src={localSettings.qrCodeUrl}
                      alt="QR Code Preview"
                      className="w-48 h-48 border-4 border-black object-contain bg-white"
                    />
                  ) : (
                    <div className="w-48 h-48 border-4 border-black bg-gray-100 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">No QR Code</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg border-2 border-black">
                <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
                <p className="font-mono font-semibold text-lg">{localSettings?.upiId || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="brutalist-card p-6">
            <h3 className="font-bold font-['Space_Grotesk'] mb-4">
              Contact Preview
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Telegram:</span>
                {localSettings?.telegramLink ? (
                  <a
                    href={localSettings.telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline"
                  >
                    Open Link
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold">{localSettings?.contactEmail || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-semibold">{localSettings?.contactPhone || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
