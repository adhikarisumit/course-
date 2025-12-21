'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    isPublished: false,
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/admin/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      } else {
        toast.error('Failed to fetch notices');
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingNotice ? `/api/admin/notices/${editingNotice.id}` : '/api/admin/notices';
      const method = editingNotice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingNotice ? 'Notice updated successfully' : 'Notice created successfully');
        setDialogOpen(false);
        setEditingNotice(null);
        setFormData({ title: '', content: '', priority: 'normal', isPublished: false });
        fetchNotices();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save notice');
      }
    } catch (error) {
      console.error('Error saving notice:', error);
      toast.error('Failed to save notice');
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      isPublished: notice.isPublished,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (noticeId: string) => {
    try {
      const response = await fetch(`/api/admin/notices/${noticeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Notice deleted successfully');
        fetchNotices();
      } else {
        toast.error('Failed to delete notice');
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice');
    }
  };

  const togglePublish = async (notice: Notice) => {
    try {
      const response = await fetch(`/api/admin/notices/${notice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...notice,
          isPublished: !notice.isPublished,
        }),
      });

      if (response.ok) {
        toast.success(`Notice ${!notice.isPublished ? 'published' : 'unpublished'} successfully`);
        fetchNotices();
      } else {
        toast.error('Failed to update notice');
      }
    } catch (error) {
      console.error('Error updating notice:', error);
      toast.error('Failed to update notice');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'important':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notice Board Management</h1>
          <p className="text-muted-foreground">Create and manage notices for students</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingNotice(null);
              setFormData({ title: '', content: '', priority: 'normal', isPublished: false });
            }} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingNotice ? 'Edit Notice' : 'Create Notice'}</DialogTitle>
                <DialogDescription>
                  {editingNotice ? 'Update the notice details below.' : 'Fill in the details to create a new notice.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter notice title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter notice content"
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isPublished">Publish immediately</Label>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <CardTitle className="text-lg break-words">{notice.title}</CardTitle>
                    <Badge variant={getPriorityColor(notice.priority)} className="shrink-0">
                      {notice.priority}
                    </Badge>
                    <Badge variant={notice.isPublished ? 'default' : 'secondary'} className="shrink-0">
                      {notice.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <CardDescription className="break-words">
                    By {notice.author.name} • Created {new Date(notice.createdAt).toLocaleDateString()}
                    {notice.publishedAt && ` • Published ${new Date(notice.publishedAt).toLocaleDateString()}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(notice)}
                    className="flex-1 sm:flex-none"
                  >
                    {notice.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only sm:not-sr-only sm:ml-2">
                      {notice.isPublished ? 'Unpublish' : 'Publish'}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(notice)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this notice? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(notice.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{notice.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {notices.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold mb-2">No notices yet</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">Create your first notice to get started.</p>
                <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Notice
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}