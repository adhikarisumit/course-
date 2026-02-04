'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  Save, 
  Loader2, 
  Info, 
  CheckCircle2, 
  XCircle,
  LayoutTemplate,
  Code,
  Globe,
  Zap,
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdSettings {
  id: string;
  activeProvider: string;
  excludedPages: string | null;
  // AdSense
  adsenseEnabled: boolean;
  adsensePublisherId: string | null;
  adsenseAutoAds: boolean;
  adsenseHeaderSlot: string | null;
  adsenseFooterSlot: string | null;
  adsenseSidebarSlot: string | null;
  adsenseInArticleSlot: string | null;
  // Media.net
  medianetEnabled: boolean;
  medianetCustomerId: string | null;
  medianetHeaderCode: string | null;
  medianetFooterCode: string | null;
  medianetSidebarCode: string | null;
  medianetInArticleCode: string | null;
  // Amazon
  amazonEnabled: boolean;
  amazonTrackingId: string | null;
  amazonAdInstanceId: string | null;
  amazonHeaderCode: string | null;
  amazonFooterCode: string | null;
  amazonSidebarCode: string | null;
  amazonInArticleCode: string | null;
  // PropellerAds
  propellerEnabled: boolean;
  propellerZoneId: string | null;
  propellerHeaderCode: string | null;
  propellerFooterCode: string | null;
  propellerSidebarCode: string | null;
  propellerInArticleCode: string | null;
  // Adsterra
  adsterraEnabled: boolean;
  adsterraKey: string | null;
  adsterraHeaderCode: string | null;
  adsterraFooterCode: string | null;
  adsterraSidebarCode: string | null;
  adsterraInArticleCode: string | null;
  // Custom
  customEnabled: boolean;
  customProviderName: string | null;
  customHeadScript: string | null;
  customHeaderCode: string | null;
  customFooterCode: string | null;
  customSidebarCode: string | null;
  customInArticleCode: string | null;
}

const defaultSettings: AdSettings = {
  id: '',
  activeProvider: 'none',
  excludedPages: '',
  // AdSense
  adsenseEnabled: false,
  adsensePublisherId: '',
  adsenseAutoAds: false,
  adsenseHeaderSlot: '',
  adsenseFooterSlot: '',
  adsenseSidebarSlot: '',
  adsenseInArticleSlot: '',
  // Media.net
  medianetEnabled: false,
  medianetCustomerId: '',
  medianetHeaderCode: '',
  medianetFooterCode: '',
  medianetSidebarCode: '',
  medianetInArticleCode: '',
  // Amazon
  amazonEnabled: false,
  amazonTrackingId: '',
  amazonAdInstanceId: '',
  amazonHeaderCode: '',
  amazonFooterCode: '',
  amazonSidebarCode: '',
  amazonInArticleCode: '',
  // PropellerAds
  propellerEnabled: false,
  propellerZoneId: '',
  propellerHeaderCode: '',
  propellerFooterCode: '',
  propellerSidebarCode: '',
  propellerInArticleCode: '',
  // Adsterra
  adsterraEnabled: false,
  adsterraKey: '',
  adsterraHeaderCode: '',
  adsterraFooterCode: '',
  adsterraSidebarCode: '',
  adsterraInArticleCode: '',
  // Custom
  customEnabled: false,
  customProviderName: '',
  customHeadScript: '',
  customHeaderCode: '',
  customFooterCode: '',
  customSidebarCode: '',
  customInArticleCode: '',
};

const providers = [
  { value: 'none', label: 'None (Disabled)', description: 'No ads will be displayed' },
  { value: 'adsense', label: 'Google AdSense', description: 'Google\'s advertising network' },
  { value: 'medianet', label: 'Media.net', description: 'Yahoo/Bing contextual ads' },
  { value: 'amazon', label: 'Amazon Native Ads', description: 'Amazon advertising network' },
  { value: 'propeller', label: 'PropellerAds', description: 'Multi-format ad network' },
  { value: 'adsterra', label: 'Adsterra', description: 'Global ad network' },
  { value: 'custom', label: 'Custom Provider', description: 'Use your own ad code' },
];

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '';

export default function AdsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<AdSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check if user is super admin
  const isSuperAdmin = session?.user?.role === 'super' || session?.user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    // Compute super admin check inside useEffect to avoid dependency issues
    const isSuper = session?.user?.role === 'super' || session?.user?.email === SUPER_ADMIN_EMAIL;
    
    if (!isSuper) {
      setLoading(false);
      return;
    }
    
    fetchSettings();
  }, [status, session, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/ads');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...defaultSettings,
          ...data,
          excludedPages: data.excludedPages || '',
          adsensePublisherId: data.adsensePublisherId || '',
          adsenseHeaderSlot: data.adsenseHeaderSlot || '',
          adsenseFooterSlot: data.adsenseFooterSlot || '',
          adsenseSidebarSlot: data.adsenseSidebarSlot || '',
          adsenseInArticleSlot: data.adsenseInArticleSlot || '',
          medianetCustomerId: data.medianetCustomerId || '',
          medianetHeaderCode: data.medianetHeaderCode || '',
          medianetFooterCode: data.medianetFooterCode || '',
          medianetSidebarCode: data.medianetSidebarCode || '',
          medianetInArticleCode: data.medianetInArticleCode || '',
          amazonTrackingId: data.amazonTrackingId || '',
          amazonAdInstanceId: data.amazonAdInstanceId || '',
          amazonHeaderCode: data.amazonHeaderCode || '',
          amazonFooterCode: data.amazonFooterCode || '',
          amazonSidebarCode: data.amazonSidebarCode || '',
          amazonInArticleCode: data.amazonInArticleCode || '',
          propellerZoneId: data.propellerZoneId || '',
          propellerHeaderCode: data.propellerHeaderCode || '',
          propellerFooterCode: data.propellerFooterCode || '',
          propellerSidebarCode: data.propellerSidebarCode || '',
          propellerInArticleCode: data.propellerInArticleCode || '',
          adsterraKey: data.adsterraKey || '',
          adsterraHeaderCode: data.adsterraHeaderCode || '',
          adsterraFooterCode: data.adsterraFooterCode || '',
          adsterraSidebarCode: data.adsterraSidebarCode || '',
          adsterraInArticleCode: data.adsterraInArticleCode || '',
          customProviderName: data.customProviderName || '',
          customHeadScript: data.customHeadScript || '',
          customHeaderCode: data.customHeaderCode || '',
          customFooterCode: data.customFooterCode || '',
          customSidebarCode: data.customSidebarCode || '',
          customInArticleCode: data.customInArticleCode || '',
        });
      } else {
        toast.error('Failed to fetch ad settings');
      }
    } catch (error) {
      console.error('Error fetching ad settings:', error);
      toast.error('Failed to fetch ad settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Ad settings saved successfully');
        fetchSettings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving ad settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof AdSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const getActiveProviderLabel = () => {
    const provider = providers.find(p => p.value === settings.activeProvider);
    return provider?.label || 'None';
  };

  // Helper to check if a field has content
  const hasContent = (value: string | null | undefined): boolean => {
    return !!(value && value.trim().length > 0);
  };

  // Status indicator component for fields
  const FieldStatus = ({ value, label }: { value: string | null | undefined; label: string }) => {
    const filled = hasContent(value);
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${filled ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
              {filled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {filled ? 'Set' : 'Empty'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{filled ? `${label} is configured (${value?.length} chars)` : `${label} is not set`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Access denied for non-super admins
  if (!isSuperAdmin) {
    return (
      <div className="container px-4 sm:px-6 py-8 sm:py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              This section is restricted to Super Administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              You don&apos;t have permission to manage advertisement settings. Please contact your system administrator if you believe this is an error.
            </p>
            <Button onClick={() => router.push('/admin')} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />
            Ads Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Configure advertisement providers and placements
          </p>
        </div>
        <Badge variant={settings.activeProvider !== 'none' ? "default" : "secondary"} className="text-sm w-fit">
          {settings.activeProvider !== 'none' ? (
            <><CheckCircle2 className="h-4 w-4 mr-1" /> {getActiveProviderLabel()}</>
          ) : (
            <><XCircle className="h-4 w-4 mr-1" /> Ads Disabled</>
          )}
        </Badge>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Multiple Ad Providers</AlertTitle>
        <AlertDescription>
          You can configure multiple ad providers, but only one can be active at a time. 
          Switch between providers instantly by changing the active provider setting.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Active Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Active Provider
            </CardTitle>
            <CardDescription>
              Select which ad provider to use on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activeProvider">Select Ad Provider</Label>
              <Select
                value={settings.activeProvider}
                onValueChange={(value) => handleChange('activeProvider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div className="flex flex-col">
                        <span>{provider.label}</span>
                        <span className="text-xs text-muted-foreground">{provider.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="excludedPages">Excluded Pages (All Providers)</Label>
              <Textarea
                id="excludedPages"
                placeholder="/admin, /checkout, /auth/signin, /portal/*"
                value={settings.excludedPages || ''}
                onChange={(e) => handleChange('excludedPages', e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated page paths. Use * for wildcards (e.g., /portal/*). Ads won&apos;t show on these pages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Provider Configuration Tabs */}
        <Tabs defaultValue="adsense" className="w-full">
          <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-3 lg:grid-cols-6 gap-1">
              <TabsTrigger value="adsense" className="text-xs sm:text-sm whitespace-nowrap">AdSense</TabsTrigger>
              <TabsTrigger value="medianet" className="text-xs sm:text-sm whitespace-nowrap">Media.net</TabsTrigger>
              <TabsTrigger value="amazon" className="text-xs sm:text-sm whitespace-nowrap">Amazon</TabsTrigger>
              <TabsTrigger value="propeller" className="text-xs sm:text-sm whitespace-nowrap">PropellerAds</TabsTrigger>
              <TabsTrigger value="adsterra" className="text-xs sm:text-sm whitespace-nowrap">Adsterra</TabsTrigger>
              <TabsTrigger value="custom" className="text-xs sm:text-sm whitespace-nowrap">Custom</TabsTrigger>
            </TabsList>
          </div>

          {/* Google AdSense Tab */}
          <TabsContent value="adsense">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="flex items-center gap-2 text-base sm:text-lg">
                    <LayoutTemplate className="h-5 w-5" />
                    Google AdSense
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground sm:hidden">Enable</span>
                    <Switch
                      checked={settings.adsenseEnabled}
                      onCheckedChange={(checked) => handleChange('adsenseEnabled', checked)}
                    />
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configure Google AdSense for contextual advertising
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adsensePublisherId">Publisher ID</Label>
                    <Input
                      id="adsensePublisherId"
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      value={settings.adsensePublisherId || ''}
                      onChange={(e) => handleChange('adsensePublisherId', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Auto Ads</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">Let Google place ads automatically</p>
                    </div>
                    <Switch
                      checked={settings.adsenseAutoAds}
                      onCheckedChange={(checked) => handleChange('adsenseAutoAds', checked)}
                    />
                  </div>
                </div>

                <Separator />
                <p className="text-sm font-medium">Ad Slot IDs</p>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adsenseHeaderSlot">Header Ad Slot</Label>
                    <Input
                      id="adsenseHeaderSlot"
                      placeholder="1234567890"
                      value={settings.adsenseHeaderSlot || ''}
                      onChange={(e) => handleChange('adsenseHeaderSlot', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adsenseFooterSlot">Footer Ad Slot</Label>
                    <Input
                      id="adsenseFooterSlot"
                      placeholder="1234567890"
                      value={settings.adsenseFooterSlot || ''}
                      onChange={(e) => handleChange('adsenseFooterSlot', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adsenseSidebarSlot">Sidebar Ad Slot</Label>
                    <Input
                      id="adsenseSidebarSlot"
                      placeholder="1234567890"
                      value={settings.adsenseSidebarSlot || ''}
                      onChange={(e) => handleChange('adsenseSidebarSlot', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adsenseInArticleSlot">In-Article Ad Slot</Label>
                    <Input
                      id="adsenseInArticleSlot"
                      placeholder="1234567890"
                      value={settings.adsenseInArticleSlot || ''}
                      onChange={(e) => handleChange('adsenseInArticleSlot', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media.net Tab */}
          <TabsContent value="medianet">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="flex items-center gap-2 text-base sm:text-lg">
                    <Zap className="h-5 w-5" />
                    Media.net
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground sm:hidden">Enable</span>
                    <Switch
                      checked={settings.medianetEnabled}
                      onCheckedChange={(checked) => handleChange('medianetEnabled', checked)}
                    />
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Yahoo/Bing contextual ads network - great AdSense alternative
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="medianetCustomerId">Customer ID (cid)</Label>
                  <Input
                    id="medianetCustomerId"
                    placeholder="8CUXXXXXXX"
                    value={settings.medianetCustomerId || ''}
                    onChange={(e) => handleChange('medianetCustomerId', e.target.value)}
                  />
                </div>

                <Separator />
                <p className="text-sm font-medium">Ad Codes (Paste full ad code from Media.net)</p>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="medianetHeaderCode">Header Ad Code</Label>
                      <FieldStatus value={settings.medianetHeaderCode} label="Header Ad Code" />
                    </div>
                    <Textarea
                      id="medianetHeaderCode"
                      placeholder="<div id='medianet_header'>...</div>"
                      value={settings.medianetHeaderCode || ''}
                      onChange={(e) => handleChange('medianetHeaderCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.medianetHeaderCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="medianetFooterCode">Footer Ad Code</Label>
                      <FieldStatus value={settings.medianetFooterCode} label="Footer Ad Code" />
                    </div>
                    <Textarea
                      id="medianetFooterCode"
                      placeholder="<div id='medianet_footer'>...</div>"
                      value={settings.medianetFooterCode || ''}
                      onChange={(e) => handleChange('medianetFooterCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.medianetFooterCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="medianetSidebarCode">Sidebar Ad Code</Label>
                      <FieldStatus value={settings.medianetSidebarCode} label="Sidebar Ad Code" />
                    </div>
                    <Textarea
                      id="medianetSidebarCode"
                      placeholder="<div id='medianet_sidebar'>...</div>"
                      value={settings.medianetSidebarCode || ''}
                      onChange={(e) => handleChange('medianetSidebarCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.medianetSidebarCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="medianetInArticleCode">In-Article Ad Code</Label>
                      <FieldStatus value={settings.medianetInArticleCode} label="In-Article Ad Code" />
                    </div>
                    <Textarea
                      id="medianetInArticleCode"
                      placeholder="<div id='medianet_article'>...</div>"
                      value={settings.medianetInArticleCode || ''}
                      onChange={(e) => handleChange('medianetInArticleCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.medianetInArticleCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amazon Native Ads Tab */}
          <TabsContent value="amazon">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="flex items-center gap-2 text-base sm:text-lg">
                    <LayoutTemplate className="h-5 w-5" />
                    Amazon Native Ads
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground sm:hidden">Enable</span>
                    <Switch
                      checked={settings.amazonEnabled}
                      onCheckedChange={(checked) => handleChange('amazonEnabled', checked)}
                    />
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Amazon Associates native advertising program
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amazonTrackingId">Tracking ID</Label>
                    <Input
                      id="amazonTrackingId"
                      placeholder="yoursite-20"
                      value={settings.amazonTrackingId || ''}
                      onChange={(e) => handleChange('amazonTrackingId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amazonAdInstanceId">Ad Instance ID</Label>
                    <Input
                      id="amazonAdInstanceId"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={settings.amazonAdInstanceId || ''}
                      onChange={(e) => handleChange('amazonAdInstanceId', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />
                <p className="text-sm font-medium">Ad Codes (Paste full ad code from Amazon)</p>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="amazonHeaderCode">Header Ad Code</Label>
                      <FieldStatus value={settings.amazonHeaderCode} label="Header Ad Code" />
                    </div>
                    <Textarea
                      id="amazonHeaderCode"
                      placeholder="<script>amzn_assoc_...</script>"
                      value={settings.amazonHeaderCode || ''}
                      onChange={(e) => handleChange('amazonHeaderCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.amazonHeaderCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="amazonFooterCode">Footer Ad Code</Label>
                      <FieldStatus value={settings.amazonFooterCode} label="Footer Ad Code" />
                    </div>
                    <Textarea
                      id="amazonFooterCode"
                      placeholder="<script>amzn_assoc_...</script>"
                      value={settings.amazonFooterCode || ''}
                      onChange={(e) => handleChange('amazonFooterCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.amazonFooterCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="amazonSidebarCode">Sidebar Ad Code</Label>
                      <FieldStatus value={settings.amazonSidebarCode} label="Sidebar Ad Code" />
                    </div>
                    <Textarea
                      id="amazonSidebarCode"
                      placeholder="<script>amzn_assoc_...</script>"
                      value={settings.amazonSidebarCode || ''}
                      onChange={(e) => handleChange('amazonSidebarCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.amazonSidebarCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="amazonInArticleCode">In-Article Ad Code</Label>
                      <FieldStatus value={settings.amazonInArticleCode} label="In-Article Ad Code" />
                    </div>
                    <Textarea
                      id="amazonInArticleCode"
                      placeholder="<script>amzn_assoc_...</script>"
                      value={settings.amazonInArticleCode || ''}
                      onChange={(e) => handleChange('amazonInArticleCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.amazonInArticleCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PropellerAds Tab */}
          <TabsContent value="propeller">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="flex items-center gap-2 text-base sm:text-lg">
                    <Zap className="h-5 w-5" />
                    PropellerAds
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground sm:hidden">Enable</span>
                    <Switch
                      checked={settings.propellerEnabled}
                      onCheckedChange={(checked) => handleChange('propellerEnabled', checked)}
                    />
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Multi-format advertising network with various ad types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="propellerZoneId">Zone ID</Label>
                  <Input
                    id="propellerZoneId"
                    placeholder="1234567"
                    value={settings.propellerZoneId || ''}
                    onChange={(e) => handleChange('propellerZoneId', e.target.value)}
                  />
                </div>

                <Separator />
                <p className="text-sm font-medium">Ad Codes (Paste full ad code from PropellerAds)</p>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="propellerHeaderCode">Header Ad Code</Label>
                      <FieldStatus value={settings.propellerHeaderCode} label="Header Ad Code" />
                    </div>
                    <Textarea
                      id="propellerHeaderCode"
                      placeholder="<script data-cfasync='false'>...</script>"
                      value={settings.propellerHeaderCode || ''}
                      onChange={(e) => handleChange('propellerHeaderCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.propellerHeaderCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="propellerFooterCode">Footer Ad Code</Label>
                      <FieldStatus value={settings.propellerFooterCode} label="Footer Ad Code" />
                    </div>
                    <Textarea
                      id="propellerFooterCode"
                      placeholder="<script data-cfasync='false'>...</script>"
                      value={settings.propellerFooterCode || ''}
                      onChange={(e) => handleChange('propellerFooterCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.propellerFooterCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="propellerSidebarCode">Sidebar Ad Code</Label>
                      <FieldStatus value={settings.propellerSidebarCode} label="Sidebar Ad Code" />
                    </div>
                    <Textarea
                      id="propellerSidebarCode"
                      placeholder="<script data-cfasync='false'>...</script>"
                      value={settings.propellerSidebarCode || ''}
                      onChange={(e) => handleChange('propellerSidebarCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.propellerSidebarCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="propellerInArticleCode">In-Article Ad Code</Label>
                      <FieldStatus value={settings.propellerInArticleCode} label="In-Article Ad Code" />
                    </div>
                    <Textarea
                      id="propellerInArticleCode"
                      placeholder="<script data-cfasync='false'>...</script>"
                      value={settings.propellerInArticleCode || ''}
                      onChange={(e) => handleChange('propellerInArticleCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.propellerInArticleCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adsterra Tab */}
          <TabsContent value="adsterra">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="flex items-center gap-2 text-base sm:text-lg">
                    <Globe className="h-5 w-5" />
                    Adsterra
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground sm:hidden">Enable</span>
                    <Switch
                      checked={settings.adsterraEnabled}
                      onCheckedChange={(checked) => handleChange('adsterraEnabled', checked)}
                    />
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Global advertising network with high CPM rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="adsterraKey">Publisher Key</Label>
                  <Input
                    id="adsterraKey"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={settings.adsterraKey || ''}
                    onChange={(e) => handleChange('adsterraKey', e.target.value)}
                  />
                </div>

                <Separator />
                <p className="text-sm font-medium">Ad Codes (Paste full ad code from Adsterra)</p>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="adsterraHeaderCode">Header Ad Code</Label>
                      <FieldStatus value={settings.adsterraHeaderCode} label="Header Ad Code" />
                    </div>
                    <Textarea
                      id="adsterraHeaderCode"
                      placeholder="<script async='async' data-cfasync='false' src='...'></script>"
                      value={settings.adsterraHeaderCode || ''}
                      onChange={(e) => handleChange('adsterraHeaderCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.adsterraHeaderCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="adsterraFooterCode">Footer Ad Code</Label>
                      <FieldStatus value={settings.adsterraFooterCode} label="Footer Ad Code" />
                    </div>
                    <Textarea
                      id="adsterraFooterCode"
                      placeholder="<script async='async' data-cfasync='false' src='...'></script>"
                      value={settings.adsterraFooterCode || ''}
                      onChange={(e) => handleChange('adsterraFooterCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.adsterraFooterCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="adsterraSidebarCode">Sidebar Ad Code</Label>
                      <FieldStatus value={settings.adsterraSidebarCode} label="Sidebar Ad Code" />
                    </div>
                    <Textarea
                      id="adsterraSidebarCode"
                      placeholder="<script async='async' data-cfasync='false' src='...'></script>"
                      value={settings.adsterraSidebarCode || ''}
                      onChange={(e) => handleChange('adsterraSidebarCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.adsterraSidebarCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="adsterraInArticleCode">In-Article Ad Code</Label>
                      <FieldStatus value={settings.adsterraInArticleCode} label="In-Article Ad Code" />
                    </div>
                    <Textarea
                      id="adsterraInArticleCode"
                      placeholder="<script async='async' data-cfasync='false' src='...'></script>"
                      value={settings.adsterraInArticleCode || ''}
                      onChange={(e) => handleChange('adsterraInArticleCode', e.target.value)}
                      rows={3}
                      className={hasContent(settings.adsterraInArticleCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Provider Tab */}
          <TabsContent value="custom">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="flex items-center gap-2 text-base sm:text-lg">
                    <Code className="h-5 w-5" />
                    Custom Ad Provider
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground sm:hidden">Enable</span>
                    <Switch
                      checked={settings.customEnabled}
                      onCheckedChange={(checked) => handleChange('customEnabled', checked)}
                    />
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Use any ad provider by pasting custom HTML/JavaScript code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="customProviderName">Provider Name</Label>
                  <Input
                    id="customProviderName"
                    placeholder="My Ad Network"
                    value={settings.customProviderName || ''}
                    onChange={(e) => handleChange('customProviderName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customHeadScript">Head Script (Optional)</Label>
                    <FieldStatus value={settings.customHeadScript} label="Head Script" />
                  </div>
                  <Textarea
                    id="customHeadScript"
                    placeholder="<script src='...'></script>"
                    value={settings.customHeadScript || ''}
                    onChange={(e) => handleChange('customHeadScript', e.target.value)}
                    rows={3}
                    className={hasContent(settings.customHeadScript) ? 'border-green-500/50' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    JavaScript/CSS that needs to be loaded in the document head
                  </p>
                </div>

                <Separator />
                <p className="text-sm font-medium">Ad Placement Codes</p>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customHeaderCode">Header Ad Code</Label>
                      <FieldStatus value={settings.customHeaderCode} label="Header Ad Code" />
                    </div>
                    <Textarea
                      id="customHeaderCode"
                      placeholder="<div>Your header ad code here...</div>"
                      value={settings.customHeaderCode || ''}
                      onChange={(e) => handleChange('customHeaderCode', e.target.value)}
                      rows={4}
                      className={hasContent(settings.customHeaderCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customFooterCode">Footer Ad Code</Label>
                      <FieldStatus value={settings.customFooterCode} label="Footer Ad Code" />
                    </div>
                    <Textarea
                      id="customFooterCode"
                      placeholder="<div>Your footer ad code here...</div>"
                      value={settings.customFooterCode || ''}
                      onChange={(e) => handleChange('customFooterCode', e.target.value)}
                      rows={4}
                      className={hasContent(settings.customFooterCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customSidebarCode">Sidebar Ad Code</Label>
                      <FieldStatus value={settings.customSidebarCode} label="Sidebar Ad Code" />
                    </div>
                    <Textarea
                      id="customSidebarCode"
                      placeholder="<div>Your sidebar ad code here...</div>"
                      value={settings.customSidebarCode || ''}
                      onChange={(e) => handleChange('customSidebarCode', e.target.value)}
                      rows={4}
                      className={hasContent(settings.customSidebarCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customInArticleCode">In-Article Ad Code</Label>
                      <FieldStatus value={settings.customInArticleCode} label="In-Article Ad Code" />
                    </div>
                    <Textarea
                      id="customInArticleCode"
                      placeholder="<div>Your in-article ad code here...</div>"
                      value={settings.customInArticleCode || ''}
                      onChange={(e) => handleChange('customInArticleCode', e.target.value)}
                      rows={4}
                      className={hasContent(settings.customInArticleCode) ? 'border-green-500/50' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-center sm:justify-end sticky bottom-4 sm:static">
          <Button type="submit" disabled={saving} size="lg" className="w-full sm:w-auto shadow-lg sm:shadow-none">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
