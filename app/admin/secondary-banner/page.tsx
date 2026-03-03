'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, EyeOff, Megaphone, ExternalLink, Timer, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const SECTION_OPTIONS = [
  { value: 'after-hero', label: 'After Hero' },
  { value: 'after-why-choose-us', label: 'After Why Choose Us' },
  { value: 'after-mentor-intro', label: 'After Mentor Intro' },
  { value: 'after-success-metrics', label: 'After Success Metrics' },
  { value: 'after-testimonials', label: 'After Testimonials' },
  { value: 'before-cta', label: 'Before CTA Section' },
] as const;

interface SecondaryBanner {
  id: string;
  title: string;
  description: string | null;
  badgeText: string | null;
  linkUrl: string | null;
  linkText: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  isActive: boolean;
  sections: string;
  showTimer: boolean;
  marqueeSpeed: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

const defaultFormData = {
  title: '',
  description: '',
  badgeText: '',
  linkUrl: '',
  linkText: '',
  backgroundColor: '#1e40af',
  textColor: '#ffffff',
  isActive: false,
  sections: ['after-hero'] as string[],
  showTimer: false,
  marqueeSpeed: 30,
  startDate: '',
  endDate: '',
};

export default function SecondaryBannerPage() {
  const [banners, setBanners] = useState<SecondaryBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<SecondaryBanner | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/secondary-banner');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      } else {
        toast.error('Failed to fetch secondary banners');
      }
    } catch {
      toast.error('Failed to fetch secondary banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const url = editingBanner
        ? `/api/admin/secondary-banner/${editingBanner.id}`
        : '/api/admin/secondary-banner';
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingBanner ? 'Banner updated' : 'Banner created');
        setDialogOpen(false);
        setEditingBanner(null);
        setFormData(defaultFormData);
        fetchBanners();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save banner');
      }
    } catch {
      toast.error('Failed to save banner');
    }
  };

  const handleEdit = (banner: SecondaryBanner) => {
    setEditingBanner(banner);
    let parsedSections: string[] = ['after-hero'];
    try {
      parsedSections = JSON.parse(banner.sections);
    } catch {}
    setFormData({
      title: banner.title,
      description: banner.description || '',
      badgeText: banner.badgeText || '',
      linkUrl: banner.linkUrl || '',
      linkText: banner.linkText || '',
      backgroundColor: banner.backgroundColor || '#1e40af',
      textColor: banner.textColor || '#ffffff',
      isActive: banner.isActive,
      sections: parsedSections,
      showTimer: banner.showTimer,
      marqueeSpeed: banner.marqueeSpeed || 30,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/secondary-banner/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Banner deleted');
        fetchBanners();
      } else {
        toast.error('Failed to delete banner');
      }
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  const toggleActive = async (banner: SecondaryBanner) => {
    try {
      const response = await fetch(`/api/admin/secondary-banner/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...banner,
          isActive: !banner.isActive,
        }),
      });
      if (response.ok) {
        toast.success(banner.isActive ? 'Banner deactivated' : 'Banner activated');
        fetchBanners();
      }
    } catch {
      toast.error('Failed to update banner');
    }
  };

  const openCreate = () => {
    setEditingBanner(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Secondary Banner
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage banners displayed across homepage sections with optional countdown timer
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
              <DialogDescription>
                Choose sections where this banner appears and optionally enable a countdown timer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Preview */}
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  backgroundColor: formData.backgroundColor,
                  color: formData.textColor,
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  {formData.badgeText && (
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase"
                      style={{
                        backgroundColor: `${formData.textColor}20`,
                        border: `1px solid ${formData.textColor}40`,
                      }}
                    >
                      {formData.badgeText}
                    </span>
                  )}
                </div>
                <p className="font-bold text-lg">{formData.title || 'Banner Title'}</p>
                {formData.description && (
                  <p className="text-sm opacity-90 mt-1">{formData.description}</p>
                )}
                {formData.linkText && (
                  <span
                    className="inline-block mt-2 px-4 py-1.5 rounded-md text-sm font-semibold"
                    style={{
                      backgroundColor: formData.textColor,
                      color: formData.backgroundColor,
                    }}
                  >
                    {formData.linkText} →
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Start Your Learning Journey"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badgeText">Badge Text</Label>
                  <Input
                    id="badgeText"
                    value={formData.badgeText}
                    onChange={(e) => setFormData(prev => ({ ...prev, badgeText: e.target.value }))}
                    placeholder="e.g., NEW, HOT, LIMITED"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description text..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="e.g., /courses"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkText">Link Text</Label>
                  <Input
                    id="linkText"
                    value={formData.linkText}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
                    placeholder="e.g., Browse Courses"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="backgroundColor"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="textColor"
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active (multiple banners can be active simultaneously)</Label>
              </div>

              {/* Section Selector */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Display Sections *
                </Label>
                <p className="text-xs text-muted-foreground">Choose where this banner appears on the homepage</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SECTION_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={formData.sections.includes(option.value)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            sections: checked
                              ? [...prev.sections, option.value]
                              : prev.sections.filter(s => s !== option.value),
                          }));
                        }}
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Show Timer Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="showTimer"
                  checked={formData.showTimer}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showTimer: checked }))}
                />
                <Label htmlFor="showTimer" className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Show Countdown Timer
                </Label>
              </div>
              {formData.showTimer && (
                <p className="text-xs text-muted-foreground ml-12">
                  Displays a live countdown to the End Date. Make sure to set an end date above.
                </p>
              )}

              {/* Marquee Speed */}
              <div className="space-y-2">
                <Label htmlFor="marqueeSpeed">Scroll Speed: {formData.marqueeSpeed}s</Label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Fast</span>
                  <input
                    type="range"
                    id="marqueeSpeed"
                    min={5}
                    max={120}
                    step={5}
                    value={formData.marqueeSpeed}
                    onChange={(e) => setFormData(prev => ({ ...prev, marqueeSpeed: parseInt(e.target.value) }))}
                    className="flex-1 h-2 accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">Slow</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Controls how many seconds one full scroll cycle takes. Lower = faster.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingBanner ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 bg-muted rounded w-1/2" /></CardHeader>
              <CardContent><div className="h-16 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Secondary Banners</h3>
            <p className="text-muted-foreground mb-4">Create your first secondary banner to display after the hero section.</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((banner) => (
            <Card key={banner.id} className="relative overflow-hidden">
              {/* Color preview strip */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: banner.backgroundColor || '#1e40af' }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base truncate">{banner.title}</CardTitle>
                      {banner.isActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {banner.description && (
                      <CardDescription className="mt-1 line-clamp-2">{banner.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-3 text-xs text-muted-foreground">
                  {banner.badgeText && <span>Badge: {banner.badgeText}</span>}
                  {banner.linkUrl && (
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {banner.linkUrl}
                    </span>
                  )}
                  {banner.showTimer && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Timer className="h-3 w-3" />
                      Timer enabled
                    </span>
                  )}
                  <span>Speed: {banner.marqueeSpeed || 30}s</span>
                </div>
                {/* Sections */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {(() => {
                    try {
                      const sections: string[] = JSON.parse(banner.sections);
                      return sections.map(s => {
                        const label = SECTION_OPTIONS.find(o => o.value === s)?.label || s;
                        return (
                          <Badge key={s} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        );
                      });
                    } catch {
                      return <Badge variant="outline" className="text-xs">After Hero</Badge>;
                    }
                  })()}
                </div>
                {banner.startDate && (
                  <p className="text-xs text-muted-foreground">
                    Schedule: {new Date(banner.startDate).toLocaleDateString()}
                    {banner.endDate && ` — ${new Date(banner.endDate).toLocaleDateString()}`}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(banner)}
                  >
                    {banner.isActive ? (
                      <><EyeOff className="h-3 w-3 mr-1" /> Deactivate</>
                    ) : (
                      <><Eye className="h-3 w-3 mr-1" /> Activate</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(banner)}
                  >
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{banner.title}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(banner.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
