import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Settings } from '@/types';
import { mockSettings } from '@/data/mockData';

// Local storage key for settings
const SETTINGS_STORAGE_KEY = 'devsera_settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!isSupabaseConfigured) {
      // Load from localStorage or use mock data
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(mockSettings);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(mockSettings));
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          upiId: data.upi_id,
          qrCodeUrl: data.qr_code_url,
          telegramLink: data.telegram_link,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
        });
      }
    } catch (err) {
      setError(err as Error);
      // Fallback to mock data
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      setSettings(storedSettings ? JSON.parse(storedSettings) : mockSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!isSupabaseConfigured) {
      // Save to localStorage
      const updatedSettings = { ...settings, ...newSettings } as Settings;
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      return;
    }

    const { error } = await supabase
      .from('settings')
      .update({
        upi_id: newSettings.upiId,
        qr_code_url: newSettings.qrCodeUrl,
        telegram_link: newSettings.telegramLink,
        contact_email: newSettings.contactEmail,
        contact_phone: newSettings.contactPhone,
      })
      .eq('id', (await supabase.from('settings').select('id').single()).data?.id);

    if (error) throw error;
    await loadSettings();
  };

  const uploadQrCode = async (file: File): Promise<string> => {
    // Always use base64 for simplicity - works without storage bucket setup
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  return { settings, isLoading, error, refetch: loadSettings, updateSettings, uploadQrCode };
}
