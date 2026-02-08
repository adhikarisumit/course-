'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DollarSign, 
  Save, 
  Loader2, 
  Info, 
  CheckCircle2, 
  XCircle,
  LayoutTemplate,
  PanelTop,
  PanelBottom,
  PanelLeft,
  FileText,
  Code
} from 'lucide-react';
import { toast } from 'sonner';

interface AdSenseSettings {
  id: string;
  publisherId: string;
  headScript: string;
  isEnabled: boolean;
  enableAutoAds: boolean;
  enableInArticle: boolean;
  enableSidebar: boolean;
  enableHeader: boolean;
  enableFooter: boolean;
  inArticleSlot: string | null;
  sidebarSlot: string | null;
  headerSlot: string | null;
  footerSlot: string | null;
  excludedPages: string | null;
}

const defaultSettings: AdSenseSettings = {
  id: '',
  publisherId: '',
  headScript: '',
  isEnabled: false,
  enableAutoAds: false,
  enableInArticle: false,
  enableSidebar: false,
  enableHeader: false,
  enableFooter: false,
  inArticleSlot: '',
  sidebarSlot: '',
  headerSlot: '',
  footerSlot: '',
  excludedPages: '',
};

export default function AdSensePage() {
  const [settings, setSettings] = useState<AdSenseSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/adsense');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...defaultSettings,
          ...data,
          headScript: data.headScript || '',
          inArticleSlot: data.inArticleSlot || '',
          sidebarSlot: data.sidebarSlot || '',
          headerSlot: data.headerSlot || '',
          footerSlot: data.footerSlot || '',
          excludedPages: data.excludedPages || '',
        });
      } else {
        toast.error('Failed to fetch AdSense settings');
      }
    } catch (error) {
      console.error('Error fetching AdSense settings:', error);
      toast.error('Failed to fetch AdSense settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/adsense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publisherId: settings.publisherId,
          headScript: settings.headScript || null,
          isEnabled: settings.isEnabled,
          enableAutoAds: settings.enableAutoAds,
          enableInArticle: settings.enableInArticle,
          enableSidebar: settings.enableSidebar,
          enableHeader: settings.enableHeader,
          enableFooter: settings.enableFooter,
          inArticleSlot: settings.inArticleSlot || null,
          sidebarSlot: settings.sidebarSlot || null,
          headerSlot: settings.headerSlot || null,
          footerSlot: settings.footerSlot || null,
          excludedPages: settings.excludedPages || null,
        }),
      });

      if (response.ok) {
        toast.success('AdSense settings saved successfully');
        fetchSettings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving AdSense settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof AdSenseSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Google AdSense Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure Google AdSense advertisements on your website
          </p>
        </div>
        <Badge variant={settings.isEnabled ? "default" : "secondary"} className="text-sm">
          {settings.isEnabled ? (
            <><CheckCircle2 className="h-4 w-4 mr-1" /> Active</>
          ) : (
            <><XCircle className="h-4 w-4 mr-1" /> Inactive</>
          )}
        </Badge>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          To use Google AdSense, you need to have an approved AdSense account. 
          Your Publisher ID starts with &quot;ca-pub-&quot; followed by a number. 
          Ad slots are specific IDs provided by Google for each ad unit you create.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Basic Configuration
            </CardTitle>
            <CardDescription>
              Configure your Google AdSense Publisher ID and enable/disable ads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="publisherId">Publisher ID</Label>
                <Input
                  id="publisherId"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  value={settings.publisherId}
                  onChange={(e) => handleChange('publisherId', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your Google AdSense Publisher ID (e.g., ca-pub-1234567890123456)
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isEnabled">Enable AdSense</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on/off all Google AdSense ads
                  </p>
                </div>
                <Switch
                  id="isEnabled"
                  checked={settings.isEnabled}
                  onCheckedChange={(checked) => handleChange('isEnabled', checked)}
                />
              </div>
            </div>

            {/* AdSense Script */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="headScript">AdSense Script (Optional)</Label>
              </div>
              <Textarea
                id="headScript"
                placeholder='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>'
                value={settings.headScript}
                onChange={(e) => handleChange('headScript', e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Paste the full AdSense script tag from Google here. This will be added to the head of your website.
                If left empty, the script will be generated automatically from your Publisher ID.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="enableAutoAds">Enable Auto Ads</Label>
                <p className="text-sm text-muted-foreground">
                  Let Google automatically place ads on your site for optimal performance
                </p>
              </div>
              <Switch
                id="enableAutoAds"
                checked={settings.enableAutoAds}
                onCheckedChange={(checked) => handleChange('enableAutoAds', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ad Placement Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Placements</CardTitle>
            <CardDescription>
              Configure where ads appear on your website. Each placement requires an Ad Slot ID from Google AdSense.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Header Ad */}
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PanelTop className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="enableHeader">Header Ad</Label>
                    <p className="text-sm text-muted-foreground">
                      Display an ad banner at the top of pages
                    </p>
                  </div>
                </div>
                <Switch
                  id="enableHeader"
                  checked={settings.enableHeader}
                  onCheckedChange={(checked) => handleChange('enableHeader', checked)}
                />
              </div>
              {settings.enableHeader && (
                <div className="space-y-2">
                  <Label htmlFor="headerSlot">Header Ad Slot ID</Label>
                  <Input
                    id="headerSlot"
                    placeholder="1234567890"
                    value={settings.headerSlot || ''}
                    onChange={(e) => handleChange('headerSlot', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Sidebar Ad */}
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PanelLeft className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="enableSidebar">Sidebar Ad</Label>
                    <p className="text-sm text-muted-foreground">
                      Display ads in the sidebar area
                    </p>
                  </div>
                </div>
                <Switch
                  id="enableSidebar"
                  checked={settings.enableSidebar}
                  onCheckedChange={(checked) => handleChange('enableSidebar', checked)}
                />
              </div>
              {settings.enableSidebar && (
                <div className="space-y-2">
                  <Label htmlFor="sidebarSlot">Sidebar Ad Slot ID</Label>
                  <Input
                    id="sidebarSlot"
                    placeholder="1234567890"
                    value={settings.sidebarSlot || ''}
                    onChange={(e) => handleChange('sidebarSlot', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* In-Article Ad */}
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="enableInArticle">In-Article Ad</Label>
                    <p className="text-sm text-muted-foreground">
                      Display ads within article/lesson content
                    </p>
                  </div>
                </div>
                <Switch
                  id="enableInArticle"
                  checked={settings.enableInArticle}
                  onCheckedChange={(checked) => handleChange('enableInArticle', checked)}
                />
              </div>
              {settings.enableInArticle && (
                <div className="space-y-2">
                  <Label htmlFor="inArticleSlot">In-Article Ad Slot ID</Label>
                  <Input
                    id="inArticleSlot"
                    placeholder="1234567890"
                    value={settings.inArticleSlot || ''}
                    onChange={(e) => handleChange('inArticleSlot', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Footer Ad */}
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PanelBottom className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="enableFooter">Footer Ad</Label>
                    <p className="text-sm text-muted-foreground">
                      Display an ad banner at the bottom of pages
                    </p>
                  </div>
                </div>
                <Switch
                  id="enableFooter"
                  checked={settings.enableFooter}
                  onCheckedChange={(checked) => handleChange('enableFooter', checked)}
                />
              </div>
              {settings.enableFooter && (
                <div className="space-y-2">
                  <Label htmlFor="footerSlot">Footer Ad Slot ID</Label>
                  <Input
                    id="footerSlot"
                    placeholder="1234567890"
                    value={settings.footerSlot || ''}
                    onChange={(e) => handleChange('footerSlot', e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exclusion Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Exclusion Settings</CardTitle>
            <CardDescription>
              Specify pages where ads should not be displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excludedPages">Excluded Pages</Label>
              <Textarea
                id="excludedPages"
                placeholder="/admin, /checkout, /auth/signin"
                value={settings.excludedPages || ''}
                onChange={(e) => handleChange('excludedPages', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Enter page paths separated by commas. Ads will not be shown on these pages.
                Examples: /admin, /checkout, /auth/signin
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
