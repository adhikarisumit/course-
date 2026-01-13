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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, EyeOff, Megaphone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PromoBanner {
  id: string;
  title: string;
  description: string | null;
  badgeText: string | null;
  linkUrl: string | null;
  linkText: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
}

interface Resource {
  id: string;
  title: string;
}

const defaultFormData = {
  title: '',
  description: '',
  badgeText: '',
  linkUrl: '',
  linkText: '',
  backgroundColor: '#ef4444',
  textColor: '#ffffff',
  isActive: false,
  startDate: '',
  endDate: '',
};

export default function PromoBannerPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchBanners();
    fetchCourses();
    fetchResources();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/promo-banner');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      } else {
        toast.error('Failed to fetch promo banners');
      }
    } catch (error) {
      console.error('Error fetching promo banners:', error);
      toast.error('Failed to fetch promo banners');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses/list');
      if (response.ok) {
        const data = await response.json();
        setCourses(data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/admin/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingBanner ? `/api/admin/promo-banner/${editingBanner.id}` : '/api/admin/promo-banner';
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      });

      if (response.ok) {
        toast.success(editingBanner ? 'Promo banner updated successfully' : 'Promo banner created successfully');
        setDialogOpen(false);
        setEditingBanner(null);
        setFormData(defaultFormData);
        fetchBanners();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save promo banner');
      }
    } catch (error) {
      console.error('Error saving promo banner:', error);
      toast.error('Failed to save promo banner');
    }
  };

  const handleEdit = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      badgeText: banner.badgeText || '',
      linkUrl: banner.linkUrl || '',
      linkText: banner.linkText || '',
      backgroundColor: banner.backgroundColor || '#ef4444',
      textColor: banner.textColor || '#ffffff',
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/promo-banner/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Promo banner deleted successfully');
        fetchBanners();
      } else {
        toast.error('Failed to delete promo banner');
      }
    } catch (error) {
      console.error('Error deleting promo banner:', error);
      toast.error('Failed to delete promo banner');
    }
  };

  const toggleActive = async (banner: PromoBanner) => {
    try {
      const response = await fetch(`/api/admin/promo-banner/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...banner,
          isActive: !banner.isActive,
        }),
      });

      if (response.ok) {
        toast.success(banner.isActive ? 'Promo banner deactivated' : 'Promo banner activated');
        fetchBanners();
      } else {
        toast.error('Failed to update promo banner');
      }
    } catch (error) {
      console.error('Error updating promo banner:', error);
      toast.error('Failed to update promo banner');
    }
  };

  const openCreateDialog = () => {
    setEditingBanner(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Promo Banners
          </h1>
          <p className="text-muted-foreground">
            Manage promotional banners displayed on the homepage
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Promo Banner' : 'Create Promo Banner'}</DialogTitle>
              <DialogDescription>
                {editingBanner ? 'Update the promotional banner details' : 'Create a new promotional banner for the homepage'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 50% OFF on All Courses!"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Limited time offer - Enroll now and save big!"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="badgeText">Badge Text</Label>
                    <Input
                      id="badgeText"
                      placeholder="e.g., 50% OFF, NEW, HOT"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="linkText">Button Text</Label>
                    <Input
                      id="linkText"
                      placeholder="e.g., View Course, Learn More"
                      value={formData.linkText}
                      onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Select
                      onValueChange={(value) => {
                        if (value === 'all-courses') {
                          setFormData({ ...formData, linkUrl: '/courses' });
                        } else if (value && value !== 'none') {
                          setFormData({ ...formData, linkUrl: `/courses/${value}` });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Select Course --</SelectItem>
                        <SelectItem value="all-courses">All Courses (/courses)</SelectItem>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) => {
                        if (value === 'all-resources') {
                          setFormData({ ...formData, linkUrl: '/portal/resources' });
                        } else if (value && value !== 'none') {
                          setFormData({ ...formData, linkUrl: `/portal/resources#${value}` });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resource" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Select Resource --</SelectItem>
                        <SelectItem value="all-resources">All Resources (/portal/resources)</SelectItem>
                        {resources.map((resource) => (
                          <SelectItem key={resource.id} value={resource.id}>
                            {resource.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    id="linkUrl"
                    placeholder="e.g., /courses, /courses/abc123, or type custom URL"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Select from dropdowns above or type a custom URL
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-14 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        placeholder="#ef4444"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-14 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Activate immediately (Only one banner can be active at a time)</Label>
                </div>

                {/* Preview */}
                <div className="grid gap-2">
                  <Label>Preview</Label>
                  <div 
                    className="p-4 rounded-lg text-center"
                    style={{ 
                      backgroundColor: formData.backgroundColor, 
                      color: formData.textColor 
                    }}
                  >
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {formData.badgeText && (
                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold uppercase">
                          {formData.badgeText}
                        </span>
                      )}
                      <span className="font-semibold">{formData.title || 'Your banner title here'}</span>
                      {formData.description && (
                        <span className="text-sm opacity-90">{formData.description}</span>
                      )}
                      {formData.linkText && (
                        <span className="underline text-sm font-medium ml-2">{formData.linkText} →</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBanner ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No promo banners yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first promotional banner to display on the homepage
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner) => (
            <Card key={banner.id} className={banner.isActive ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{banner.title}</CardTitle>
                      {banner.isActive && (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      )}
                      {banner.badgeText && (
                        <Badge variant="outline">{banner.badgeText}</Badge>
                      )}
                    </div>
                    {banner.description && (
                      <CardDescription>{banner.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(banner)}
                      title={banner.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {banner.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Promo Banner?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the promo banner.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(banner.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Banner Preview */}
                <div 
                  className="p-3 rounded-lg text-center mb-3"
                  style={{ 
                    backgroundColor: banner.backgroundColor || '#ef4444', 
                    color: banner.textColor || '#ffffff' 
                  }}
                >
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {banner.badgeText && (
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold uppercase">
                        {banner.badgeText}
                      </span>
                    )}
                    <span className="font-semibold">{banner.title}</span>
                    {banner.description && (
                      <span className="text-sm opacity-90">{banner.description}</span>
                    )}
                    {banner.linkText && (
                      <span className="underline text-sm font-medium">{banner.linkText} →</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {banner.linkUrl && (
                    <div className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      <span>Links to: {banner.linkUrl}</span>
                    </div>
                  )}
                  {banner.startDate && (
                    <div>Start: {new Date(banner.startDate).toLocaleString()}</div>
                  )}
                  {banner.endDate && (
                    <div>End: {new Date(banner.endDate).toLocaleString()}</div>
                  )}
                  <div>Created: {new Date(banner.createdAt).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
