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
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DollarSign, Save, Loader2, Info, CheckCircle2, XCircle,
  LayoutTemplate, Code, Globe, Zap, ShieldAlert,
  ChevronDown, Monitor, Smartphone, ArrowUpDown, Settings2,
  PanelTop, PanelBottom, PanelLeft, FileText, BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PageAdConfig {
  maxAds?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  showInArticle?: boolean;
  showSidebar?: boolean;
  adProvider?: string;
}

interface AdSettings {
  id: string;
  activeProvider: string;
  excludedPages: string | null;
  showHeaderAd: boolean;
  showFooterAd: boolean;
  showSidebarAd: boolean;
  showInArticleAd: boolean;
  showHomePageAd: boolean;
  showCoursePageAd: boolean;
  showPortalAd: boolean;
  showBlogAd: boolean;
  // Mobile
  showHeaderAdMobile: boolean;
  showFooterAdMobile: boolean;
  showSidebarAdMobile: boolean;
  showInArticleAdMobile: boolean;
  maxAdsPerPage: number;
  maxInArticleAds: number;
  pageAdConfig: Record<string, PageAdConfig>;
  // AdSense
  adsenseEnabled: boolean;
  adsensePublisherId: string | null;
  adsenseHeadScript: string | null;
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
  id: '', activeProvider: 'none', excludedPages: '',
  showHeaderAd: true, showFooterAd: true, showSidebarAd: true, showInArticleAd: true,
  showHomePageAd: true, showCoursePageAd: true, showPortalAd: true, showBlogAd: true,
  showHeaderAdMobile: true, showFooterAdMobile: true, showSidebarAdMobile: false, showInArticleAdMobile: true,
  maxAdsPerPage: 5, maxInArticleAds: 3, pageAdConfig: {},
  adsenseEnabled: false, adsensePublisherId: '', adsenseHeadScript: '', adsenseAutoAds: false,
  adsenseHeaderSlot: '', adsenseFooterSlot: '', adsenseSidebarSlot: '', adsenseInArticleSlot: '',
  medianetEnabled: false, medianetCustomerId: '',
  medianetHeaderCode: '', medianetFooterCode: '', medianetSidebarCode: '', medianetInArticleCode: '',
  amazonEnabled: false, amazonTrackingId: '', amazonAdInstanceId: '',
  amazonHeaderCode: '', amazonFooterCode: '', amazonSidebarCode: '', amazonInArticleCode: '',
  propellerEnabled: false, propellerZoneId: '',
  propellerHeaderCode: '', propellerFooterCode: '', propellerSidebarCode: '', propellerInArticleCode: '',
  adsterraEnabled: false, adsterraKey: '',
  adsterraHeaderCode: '', adsterraFooterCode: '', adsterraSidebarCode: '', adsterraInArticleCode: '',
  customEnabled: false, customProviderName: '', customHeadScript: '',
  customHeaderCode: '', customFooterCode: '', customSidebarCode: '', customInArticleCode: '',
};

const providers = [
  { value: 'none', label: 'None (Disabled)', description: 'No ads displayed', icon: XCircle },
  { value: 'adsense', label: 'Google AdSense', description: 'Google advertising', icon: Globe },
  { value: 'medianet', label: 'Media.net', description: 'Yahoo/Bing contextual ads', icon: Zap },
  { value: 'amazon', label: 'Amazon Native Ads', description: 'Amazon advertising', icon: LayoutTemplate },
  { value: 'propeller', label: 'PropellerAds', description: 'Multi-format network', icon: Zap },
  { value: 'adsterra', label: 'Adsterra', description: 'Global ad network', icon: Globe },
  { value: 'custom', label: 'Custom Provider', description: 'Your own ad code', icon: Code },
];

// Provider card colors
const providerStyles = {
  adsense: { bg: 'bg-blue-500/10', icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', activeBg: 'bg-blue-500/5' },
  medianet: { bg: 'bg-purple-500/10', icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', activeBg: 'bg-purple-500/5' },
  amazon: { bg: 'bg-orange-500/10', icon: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20', activeBg: 'bg-orange-500/5' },
  propeller: { bg: 'bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', activeBg: 'bg-emerald-500/5' },
  adsterra: { bg: 'bg-pink-500/10', icon: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20', activeBg: 'bg-pink-500/5' },
  custom: { bg: 'bg-slate-500/10', icon: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', activeBg: 'bg-slate-500/5' },
};

const availablePages = [
  { value: '/', label: 'Home Page' },
  { value: '/about', label: 'About Page' },
  { value: '/contact', label: 'Contact Page' },
  { value: '/courses', label: 'Courses List' },
  { value: '/courses/*', label: 'Course Details' },
  { value: '/jisho', label: 'Dictionary' },
  { value: '/playground', label: 'Playground' },
  { value: '/portal/*', label: 'Student Portal' },
  { value: '/terms', label: 'Terms' },
  { value: '/privacy', label: 'Privacy' },
  { value: '/checkout/*', label: 'Checkout' },
];

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '';

// Reusable status dot
function StatusDot({ active }: { active: boolean }) {
  return <span className={cn('inline-block h-2 w-2 rounded-full', active ? 'bg-green-500' : 'bg-muted-foreground/30')} />;
}

// Field status badge
function FieldStatus({ value, label }: { value: string | null | undefined; label: string }) {
  const filled = !!(value && value.trim().length > 0);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
            filled ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground')}>
            {filled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {filled ? 'Set' : 'Empty'}
          </span>
        </TooltipTrigger>
        <TooltipContent><p>{filled ? `${label} configured` : `${label} not set`}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Provider code fields component
function ProviderCodeFields({ prefix, settings, onChange, onBulkChange }: {
  prefix: string;
  settings: AdSettings;
  onChange: (field: keyof AdSettings, value: string) => void;
  onBulkChange?: (updates: Partial<AdSettings>) => void;
}) {
  const slots = ['Header', 'Footer', 'Sidebar', 'InArticle'] as const;
  const slotIcons = { Header: PanelTop, Footer: PanelBottom, Sidebar: PanelLeft, InArticle: FileText };
  
  const applyToAllSlots = (value: string) => {
    if (onBulkChange) {
      const updates: Partial<AdSettings> = {};
      slots.forEach((slot) => {
        const field = `${prefix}${slot}Code` as keyof AdSettings;
        (updates as Record<string, string>)[field] = value;
      });
      onBulkChange(updates);
      toast.success('Code applied to all slots');
    }
  };

  const applyToOtherSlots = (currentSlot: typeof slots[number], value: string) => {
    if (onBulkChange) {
      const updates: Partial<AdSettings> = {};
      slots.forEach((slot) => {
        if (slot !== currentSlot) {
          const field = `${prefix}${slot}Code` as keyof AdSettings;
          (updates as Record<string, string>)[field] = value;
        }
      });
      onBulkChange(updates);
      toast.success(`Code copied to other slots`);
    }
  };

  return (
    <div className="grid gap-3">
      {slots.map((slot) => {
        const field = `${prefix}${slot}Code` as keyof AdSettings;
        const value = settings[field] as string || '';
        const Icon = slotIcons[slot];
        return (
          <div key={slot} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-sm">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                {slot === 'InArticle' ? 'In-Article' : slot} Ad Code
              </Label>
              <div className="flex items-center gap-2">
                {value.trim() && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => applyToOtherSlots(slot, value)}
                        >
                          Copy to all
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Apply this code to all other ad slots</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <FieldStatus value={value} label={`${slot} Ad Code`} />
              </div>
            </div>
            <Textarea
              placeholder={`Paste ${slot.toLowerCase()} ad code here...`}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              rows={3}
              className={cn('font-mono text-xs', value.trim() ? 'border-green-500/30' : '')}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function AdsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<AdSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageRuleModalOpen, setPageRuleModalOpen] = useState(false);
  const [newPageRule, setNewPageRule] = useState({
    path: '', maxAds: 3, showHeader: true, showFooter: true,
    showInArticle: true, showSidebar: true, adProvider: 'global',
  });

  const isSuperAdmin = session?.user?.role === 'super' || session?.user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/auth/signin'); return; }
    const isSuper = session?.user?.role === 'super' || session?.user?.email === SUPER_ADMIN_EMAIL;
    if (!isSuper) { setLoading(false); return; }
    fetchSettings();
  }, [status, session, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/ads');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...defaultSettings, ...data,
          showHeaderAd: data.showHeaderAd ?? true, showFooterAd: data.showFooterAd ?? true,
          showSidebarAd: data.showSidebarAd ?? true, showInArticleAd: data.showInArticleAd ?? true,
          showHomePageAd: data.showHomePageAd ?? true, showCoursePageAd: data.showCoursePageAd ?? true,
          showPortalAd: data.showPortalAd ?? true, showBlogAd: data.showBlogAd ?? true,
          showHeaderAdMobile: data.showHeaderAdMobile ?? true, showFooterAdMobile: data.showFooterAdMobile ?? true,
          showSidebarAdMobile: data.showSidebarAdMobile ?? false, showInArticleAdMobile: data.showInArticleAdMobile ?? true,
          excludedPages: data.excludedPages || '',
          adsensePublisherId: data.adsensePublisherId || '', adsenseHeadScript: data.adsenseHeadScript || '',
          adsenseHeaderSlot: data.adsenseHeaderSlot || '', adsenseFooterSlot: data.adsenseFooterSlot || '',
          adsenseSidebarSlot: data.adsenseSidebarSlot || '', adsenseInArticleSlot: data.adsenseInArticleSlot || '',
          medianetCustomerId: data.medianetCustomerId || '',
          medianetHeaderCode: data.medianetHeaderCode || '', medianetFooterCode: data.medianetFooterCode || '',
          medianetSidebarCode: data.medianetSidebarCode || '', medianetInArticleCode: data.medianetInArticleCode || '',
          amazonTrackingId: data.amazonTrackingId || '', amazonAdInstanceId: data.amazonAdInstanceId || '',
          amazonHeaderCode: data.amazonHeaderCode || '', amazonFooterCode: data.amazonFooterCode || '',
          amazonSidebarCode: data.amazonSidebarCode || '', amazonInArticleCode: data.amazonInArticleCode || '',
          propellerZoneId: data.propellerZoneId || '',
          propellerHeaderCode: data.propellerHeaderCode || '', propellerFooterCode: data.propellerFooterCode || '',
          propellerSidebarCode: data.propellerSidebarCode || '', propellerInArticleCode: data.propellerInArticleCode || '',
          adsterraKey: data.adsterraKey || '',
          adsterraHeaderCode: data.adsterraHeaderCode || '', adsterraFooterCode: data.adsterraFooterCode || '',
          adsterraSidebarCode: data.adsterraSidebarCode || '', adsterraInArticleCode: data.adsterraInArticleCode || '',
          customProviderName: data.customProviderName || '', customHeadScript: data.customHeadScript || '',
          customHeaderCode: data.customHeaderCode || '', customFooterCode: data.customFooterCode || '',
          customSidebarCode: data.customSidebarCode || '', customInArticleCode: data.customInArticleCode || '',
          maxAdsPerPage: data.maxAdsPerPage ?? 5, maxInArticleAds: data.maxInArticleAds ?? 3,
          pageAdConfig: data.pageAdConfig ? (typeof data.pageAdConfig === 'string' ? JSON.parse(data.pageAdConfig) : data.pageAdConfig) : {},
        });
      } else { toast.error('Failed to fetch ad settings'); }
    } catch { toast.error('Failed to fetch ad settings'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/admin/ads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) { toast.success('Ad settings saved successfully'); fetchSettings(); }
      else { const error = await response.json(); toast.error(error.error || 'Failed to save settings'); }
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handleChange = (field: keyof AdSettings, value: string | boolean | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleBulkChange = (updates: Partial<AdSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const getActiveProviderLabel = () => providers.find(p => p.value === settings.activeProvider)?.label || 'None';
  const hasContent = (value: string | null | undefined) => !!(value && value.trim().length > 0);

  // Count configured slots for active provider
  const getConfiguredSlots = () => {
    let count = 0;
    const p = settings.activeProvider;
    if (p === 'adsense') {
      if (hasContent(settings.adsenseHeaderSlot)) count++;
      if (hasContent(settings.adsenseFooterSlot)) count++;
      if (hasContent(settings.adsenseSidebarSlot)) count++;
      if (hasContent(settings.adsenseInArticleSlot)) count++;
    } else if (p !== 'none') {
      const prefix = p === 'medianet' ? 'medianet' : p === 'amazon' ? 'amazon' : p === 'propeller' ? 'propeller' : p === 'adsterra' ? 'adsterra' : 'custom';
      ['HeaderCode', 'FooterCode', 'SidebarCode', 'InArticleCode'].forEach(s => {
        if (hasContent(settings[`${prefix}${s}` as keyof AdSettings] as string)) count++;
      });
    }
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="container px-4 sm:px-6 py-8 sm:py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>This section is restricted to Super Administrators only.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/admin')} variant="outline">Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />
            Ads Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure ad providers, placements & rules</p>
        </div>
        <Badge variant={settings.activeProvider !== 'none' ? 'default' : 'secondary'} className="text-sm w-fit">
          {settings.activeProvider !== 'none'
            ? <><CheckCircle2 className="h-4 w-4 mr-1" /> {getActiveProviderLabel()}</>
            : <><XCircle className="h-4 w-4 mr-1" /> Ads Disabled</>}
        </Badge>
      </div>

      {/* Status Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Provider</span>
          </div>
          <p className="text-sm font-semibold truncate">{getActiveProviderLabel()}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Slots</span>
          </div>
          <p className="text-sm font-semibold">{getConfiguredSlots()} / 4 configured</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Max / Page</span>
          </div>
          <p className="text-sm font-semibold">{settings.maxAdsPerPage} ads</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Page Rules</span>
          </div>
          <p className="text-sm font-semibold">{Object.keys(settings.pageAdConfig).length} rules</p>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Active Provider */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5" /> Active Provider
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={settings.activeProvider} onValueChange={(v) => handleChange('activeProvider', v)}>
              <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <div className="flex items-center gap-2">
                      <p.icon className="h-4 w-4" />
                      <div>
                        <span>{p.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{p.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-1.5">
              <Label>Excluded Pages</Label>
              <Textarea placeholder="/admin, /checkout/*, /auth/*" value={settings.excludedPages || ''}
                onChange={(e) => handleChange('excludedPages', e.target.value)} rows={2} />
              <p className="text-xs text-muted-foreground">Comma-separated paths. Use * for wildcards.</p>
            </div>
          </CardContent>
        </Card>

        {/* Placement Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutTemplate className="h-5 w-5" /> Ad Placements
            </CardTitle>
            <CardDescription>Control where ads appear — desktop & mobile independently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Position Toggles - Table Layout */}
            <div className="rounded-lg border overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] bg-muted/50 border-b">
                <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Position
                </div>
                <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center flex items-center justify-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </div>
                <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center flex items-center justify-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </div>
              </div>
              {/* Table Body */}
              {[
                { label: 'Header', icon: PanelTop, desk: 'showHeaderAd', mob: 'showHeaderAdMobile', desc: 'Below navigation' },
                { label: 'Footer', icon: PanelBottom, desk: 'showFooterAd', mob: 'showFooterAdMobile', desc: 'Above footer' },
                { label: 'Sidebar', icon: PanelLeft, desk: 'showSidebarAd', mob: 'showSidebarAdMobile', desc: 'Side panels' },
                { label: 'In-Article', icon: FileText, desk: 'showInArticleAd', mob: 'showInArticleAdMobile', desc: 'Within content' },
              ].map((pos, idx) => (
                <div key={pos.label} className={cn(
                  "grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] items-center",
                  idx < 3 && "border-b"
                )}>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <pos.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{pos.label}</span>
                      <p className="text-xs text-muted-foreground hidden sm:block">{pos.desc}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex justify-center">
                    <Switch checked={settings[pos.desk as keyof AdSettings] as boolean}
                      onCheckedChange={(c) => handleChange(pos.desk as keyof AdSettings, c)} />
                  </div>
                  <div className="px-4 py-3 flex justify-center">
                    <Switch checked={settings[pos.mob as keyof AdSettings] as boolean}
                      onCheckedChange={(c) => handleChange(pos.mob as keyof AdSettings, c)} />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Page Toggles */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Page Categories</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'showHomePageAd', label: 'Home Page', icon: '🏠' },
                  { key: 'showCoursePageAd', label: 'Course Pages', icon: '📚' },
                  { key: 'showPortalAd', label: 'Student Portal', icon: '🎓' },
                  { key: 'showBlogAd', label: 'Blog / Articles', icon: '📝' },
                ].map((p) => (
                  <div key={p.key} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{p.icon}</span>
                      <Label className="text-sm font-medium cursor-pointer">{p.label}</Label>
                    </div>
                    <Switch checked={settings[p.key as keyof AdSettings] as boolean}
                      onCheckedChange={(c) => handleChange(p.key as keyof AdSettings, c)} />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Ad Limits */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Max Ads Per Page</Label>
                <Input type="number" min={1} max={10} value={settings.maxAdsPerPage}
                  onChange={(e) => handleChange('maxAdsPerPage', parseInt(e.target.value) || 5)} />
              </div>
              <div className="space-y-1.5">
                <Label>Max In-Article Ads</Label>
                <Input type="number" min={1} max={10} value={settings.maxInArticleAds}
                  onChange={(e) => handleChange('maxInArticleAds', parseInt(e.target.value) || 3)} />
              </div>
            </div>

            <Separator />

            {/* Per-Page Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Per-Page Rules</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  setNewPageRule({ path: '', maxAds: 3, showHeader: true, showFooter: true, showInArticle: true, showSidebar: true, adProvider: 'global' });
                  setPageRuleModalOpen(true);
                }}>+ Add Rule</Button>
              </div>
              {Object.keys(settings.pageAdConfig).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(settings.pageAdConfig).map(([path, config]) => (
                    <div key={path} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{path}</code>
                        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7 text-xs"
                          onClick={() => {
                            const c = { ...settings.pageAdConfig }; delete c[path];
                            setSettings(prev => ({ ...prev, pageAdConfig: c }));
                          }}>Remove</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="flex items-center gap-1"><StatusDot active={config.showHeader ?? true} /> Header</span>
                        <span className="flex items-center gap-1"><StatusDot active={config.showFooter ?? true} /> Footer</span>
                        <span className="flex items-center gap-1"><StatusDot active={config.showInArticle ?? true} /> In-Article</span>
                        <span className="flex items-center gap-1"><StatusDot active={config.showSidebar ?? true} /> Sidebar</span>
                        <span className="text-muted-foreground">| Max: {config.maxAds ?? 3}</span>
                        {config.adProvider && config.adProvider !== 'global' && (
                          <Badge variant="outline" className="text-[10px] h-5">{config.adProvider}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm border rounded-lg border-dashed">
                  No per-page rules. Ads use global settings everywhere.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Provider Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5" /> Provider Configuration
            </CardTitle>
            <CardDescription>Configure ad codes for each provider. Only the active provider is used.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AdSense */}
            <Collapsible>
              <div className={cn(
                "rounded-xl border-2 transition-all duration-200",
                settings.adsenseEnabled ? "border-blue-500/30 bg-blue-500/5" : "border-border",
                settings.activeProvider === 'adsense' && "ring-2 ring-blue-500/50"
              )}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", providerStyles.adsense.bg)}>
                      <Globe className={cn("h-5 w-5", providerStyles.adsense.icon)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Google AdSense</span>
                        {settings.activeProvider === 'adsense' && (
                          <Badge className="h-5 text-[10px] bg-blue-500">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Contextual advertising by Google</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={settings.adsenseEnabled}
                      onCheckedChange={(c) => handleChange('adsenseEnabled', c)} />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Publisher ID</Label>
                        <Input placeholder="ca-pub-XXXXXXXXXXXXXXXX" value={settings.adsensePublisherId || ''}
                          onChange={(e) => handleChange('adsensePublisherId', e.target.value)} />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div><Label className="text-sm">Auto Ads</Label><p className="text-xs text-muted-foreground">Google auto-placement</p></div>
                        <Switch checked={settings.adsenseAutoAds} onCheckedChange={(c) => handleChange('adsenseAutoAds', c)} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Head Script (Optional)</Label>
                      <Textarea placeholder='<script async src="..."></script>' value={settings.adsenseHeadScript || ''}
                        onChange={(e) => handleChange('adsenseHeadScript', e.target.value)} rows={3} className="font-mono text-xs" />
                    </div>
                    <Separator />
                    <Label className="text-sm font-medium">Ad Slot IDs</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {['Header', 'Footer', 'Sidebar', 'InArticle'].map((s) => {
                        const field = `adsense${s}Slot` as keyof AdSettings;
                        return (
                          <div key={s} className="space-y-1">
                            <Label className="text-xs">{s === 'InArticle' ? 'In-Article' : s} Slot</Label>
                            <Input placeholder="1234567890" value={(settings[field] as string) || ''}
                              onChange={(e) => handleChange(field, e.target.value)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Media.net */}
            <Collapsible>
              <div className={cn(
                "rounded-xl border-2 transition-all duration-200",
                settings.medianetEnabled ? "border-purple-500/30 bg-purple-500/5" : "border-border",
                settings.activeProvider === 'medianet' && "ring-2 ring-purple-500/50"
              )}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", providerStyles.medianet.bg)}>
                      <Zap className={cn("h-5 w-5", providerStyles.medianet.icon)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Media.net</span>
                        {settings.activeProvider === 'medianet' && (
                          <Badge className="h-5 text-[10px] bg-purple-500">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Yahoo/Bing contextual ads</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={settings.medianetEnabled}
                      onCheckedChange={(c) => handleChange('medianetEnabled', c)} />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    <div className="space-y-1.5">
                      <Label>Customer ID</Label>
                      <Input placeholder="8CUXXXXXXX" value={settings.medianetCustomerId || ''}
                        onChange={(e) => handleChange('medianetCustomerId', e.target.value)} />
                    </div>
                    <Separator />
                    <ProviderCodeFields prefix="medianet" settings={settings} onChange={handleChange} onBulkChange={handleBulkChange} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Amazon */}
            <Collapsible>
              <div className={cn(
                "rounded-xl border-2 transition-all duration-200",
                settings.amazonEnabled ? "border-orange-500/30 bg-orange-500/5" : "border-border",
                settings.activeProvider === 'amazon' && "ring-2 ring-orange-500/50"
              )}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", providerStyles.amazon.bg)}>
                      <LayoutTemplate className={cn("h-5 w-5", providerStyles.amazon.icon)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Amazon Native Ads</span>
                        {settings.activeProvider === 'amazon' && (
                          <Badge className="h-5 text-[10px] bg-orange-500">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Amazon Associates program</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={settings.amazonEnabled}
                      onCheckedChange={(c) => handleChange('amazonEnabled', c)} />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Tracking ID</Label>
                        <Input placeholder="yoursite-20" value={settings.amazonTrackingId || ''}
                          onChange={(e) => handleChange('amazonTrackingId', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Ad Instance ID</Label>
                        <Input placeholder="xxxxxxxx-xxxx-xxxx" value={settings.amazonAdInstanceId || ''}
                          onChange={(e) => handleChange('amazonAdInstanceId', e.target.value)} />
                      </div>
                    </div>
                    <Separator />
                    <ProviderCodeFields prefix="amazon" settings={settings} onChange={handleChange} onBulkChange={handleBulkChange} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* PropellerAds */}
            <Collapsible>
              <div className={cn(
                "rounded-xl border-2 transition-all duration-200",
                settings.propellerEnabled ? "border-emerald-500/30 bg-emerald-500/5" : "border-border",
                settings.activeProvider === 'propeller' && "ring-2 ring-emerald-500/50"
              )}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", providerStyles.propeller.bg)}>
                      <Zap className={cn("h-5 w-5", providerStyles.propeller.icon)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">PropellerAds</span>
                        {settings.activeProvider === 'propeller' && (
                          <Badge className="h-5 text-[10px] bg-emerald-500">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Multi-format ad network</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={settings.propellerEnabled}
                      onCheckedChange={(c) => handleChange('propellerEnabled', c)} />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    <div className="space-y-1.5">
                      <Label>Zone ID</Label>
                      <Input placeholder="1234567" value={settings.propellerZoneId || ''}
                        onChange={(e) => handleChange('propellerZoneId', e.target.value)} />
                    </div>
                    <Separator />
                    <ProviderCodeFields prefix="propeller" settings={settings} onChange={handleChange} onBulkChange={handleBulkChange} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Adsterra */}
            <Collapsible>
              <div className={cn(
                "rounded-xl border-2 transition-all duration-200",
                settings.adsterraEnabled ? "border-pink-500/30 bg-pink-500/5" : "border-border",
                settings.activeProvider === 'adsterra' && "ring-2 ring-pink-500/50"
              )}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", providerStyles.adsterra.bg)}>
                      <Globe className={cn("h-5 w-5", providerStyles.adsterra.icon)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Adsterra</span>
                        {settings.activeProvider === 'adsterra' && (
                          <Badge className="h-5 text-[10px] bg-pink-500">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Global ad network</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={settings.adsterraEnabled}
                      onCheckedChange={(c) => handleChange('adsterraEnabled', c)} />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    <div className="space-y-1.5">
                      <Label>Publisher Key</Label>
                      <Input placeholder="xxxxxxxxxxxxxxxx" value={settings.adsterraKey || ''}
                        onChange={(e) => handleChange('adsterraKey', e.target.value)} />
                    </div>
                    <Separator />
                    <ProviderCodeFields prefix="adsterra" settings={settings} onChange={handleChange} onBulkChange={handleBulkChange} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Custom */}
            <Collapsible>
              <div className={cn(
                "rounded-xl border-2 transition-all duration-200",
                settings.customEnabled ? "border-slate-500/30 bg-slate-500/5" : "border-border",
                settings.activeProvider === 'custom' && "ring-2 ring-slate-500/50"
              )}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", providerStyles.custom.bg)}>
                      <Code className={cn("h-5 w-5", providerStyles.custom.icon)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Custom Provider</span>
                        {settings.activeProvider === 'custom' && (
                          <Badge className="h-5 text-[10px] bg-slate-500">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Your own ad code</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={settings.customEnabled}
                      onCheckedChange={(c) => handleChange('customEnabled', c)} />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    <div className="space-y-1.5">
                      <Label>Provider Name</Label>
                      <Input placeholder="My Ad Network" value={settings.customProviderName || ''}
                        onChange={(e) => handleChange('customProviderName', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Head Script (Optional)</Label>
                      <Textarea placeholder="<script src='...'></script>" value={settings.customHeadScript || ''}
                        onChange={(e) => handleChange('customHeadScript', e.target.value)} rows={3} className="font-mono text-xs" />
                    </div>
                    <Separator />
                    <ProviderCodeFields prefix="custom" settings={settings} onChange={handleChange} onBulkChange={handleBulkChange} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-center sm:justify-end sticky bottom-4 sm:static z-10">
          <Button type="submit" disabled={saving} size="lg" className="w-full sm:w-auto shadow-lg sm:shadow-none">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              : <><Save className="mr-2 h-4 w-4" />Save All Settings</>}
          </Button>
        </div>
      </form>

      {/* Page Rule Modal */}
      <Dialog open={pageRuleModalOpen} onOpenChange={setPageRuleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Page Rule</DialogTitle>
            <DialogDescription>Configure ad settings for a specific page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Select Page</Label>
              <Select value={newPageRule.path} onValueChange={(v) => setNewPageRule(prev => ({ ...prev, path: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose a page..." /></SelectTrigger>
                <SelectContent>
                  {availablePages.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label} <span className="text-xs text-muted-foreground ml-1">{p.value}</span></SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Path...</SelectItem>
                </SelectContent>
              </Select>
              {newPageRule.path === 'custom' && (
                <Input placeholder="/your-path or /path/*" className="mt-2"
                  onChange={(e) => { if (e.target.value.startsWith('/')) setNewPageRule(prev => ({ ...prev, path: e.target.value })); }} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Max Ads</Label>
                <Input type="number" min={0} max={10} value={newPageRule.maxAds}
                  onChange={(e) => setNewPageRule(prev => ({ ...prev, maxAds: parseInt(e.target.value) || 3 }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Provider</Label>
                <Select value={newPageRule.adProvider} onValueChange={(v) => setNewPageRule(prev => ({ ...prev, adProvider: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="adsense">AdSense</SelectItem>
                    <SelectItem value="medianet">Media.net</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="propeller">Propeller</SelectItem>
                    <SelectItem value="adsterra">Adsterra</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="none">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              {['Header', 'Footer', 'InArticle', 'Sidebar'].map((s) => {
                const key = `show${s}` as 'showHeader' | 'showFooter' | 'showInArticle' | 'showSidebar';
                return (
                  <div key={s} className="flex items-center justify-between rounded-lg border p-2.5">
                    <Label className="text-sm cursor-pointer">{s === 'InArticle' ? 'In-Article' : s}</Label>
                    <Switch checked={newPageRule[key]}
                      onCheckedChange={(c) => setNewPageRule(prev => ({ ...prev, [key]: c }))} />
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setPageRuleModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={() => {
              if (!newPageRule.path.trim() || newPageRule.path === 'custom') { toast.error('Select a page or enter a path'); return; }
              if (!newPageRule.path.startsWith('/')) { toast.error('Path must start with /'); return; }
              setSettings(prev => ({
                ...prev, pageAdConfig: {
                  ...prev.pageAdConfig,
                  [newPageRule.path]: {
                    maxAds: newPageRule.maxAds, showHeader: newPageRule.showHeader, showFooter: newPageRule.showFooter,
                    showInArticle: newPageRule.showInArticle, showSidebar: newPageRule.showSidebar, adProvider: newPageRule.adProvider,
                  }
                }
              }));
              setPageRuleModalOpen(false);
              toast.success(`Rule added for ${newPageRule.path}`);
            }}>Add Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
