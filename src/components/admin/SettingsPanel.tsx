import { useState } from 'react';
import { mockSettings } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Save, Upload } from 'lucide-react';

export function SettingsPanel() {
  const [settings, setSettings] = useState(mockSettings);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Settings saved!',
      description: 'Your changes have been saved successfully.',
    });
  };

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
                <Input
                  id="upi-id"
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  className="border-2 border-black font-mono"
                />
              </div>
              <div>
                <Label htmlFor="qr-code">QR Code Image URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="qr-code"
                    value={settings.qrCodeUrl}
                    onChange={(e) => setSettings({ ...settings, qrCodeUrl: e.target.value })}
                    className="border-2 border-black flex-1"
                  />
                  <Button variant="outline" className="brutalist-button">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
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
                  value={settings.telegramLink}
                  onChange={(e) => setSettings({ ...settings, telegramLink: e.target.value })}
                  className="border-2 border-black"
                />
              </div>
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="border-2 border-black"
                />
              </div>
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="border-2 border-black"
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
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">QR Code</p>
                <div className="inline-block brutalist-shadow">
                  <img
                    src={settings.qrCodeUrl}
                    alt="QR Code Preview"
                    className="w-48 h-48 border-4 border-black"
                  />
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg border-2 border-black">
                <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
                <p className="font-mono font-semibold text-lg">{settings.upiId}</p>
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
                <a
                  href={settings.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline"
                >
                  Open Link
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold">{settings.contactEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-semibold">{settings.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
