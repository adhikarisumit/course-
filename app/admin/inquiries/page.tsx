'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Inbox, Eye, Trash2, Mail, MailOpen, Archive, Reply, Search, RefreshCw, ChevronLeft, ChevronRight, MessageSquare, Phone, Clock, StickyNote, Plus, BookOpen, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  course: string | null;
  jlptLevel: string | null;
  codingLevel: string | null;
  message: string;
  status: string;
  adminNote: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', icon: Inbox },
  { value: 'unread', label: 'Unread', icon: Mail },
  { value: 'read', label: 'Read', icon: MailOpen },
  { value: 'replied', label: 'Replied', icon: Reply },
  { value: 'archived', label: 'Archived', icon: Archive },
];

const STATUS_COLORS: Record<string, string> = {
  unread: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  read: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  replied: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [adminNote, setAdminNote] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Course management state
  const [inquiryCourses, setInquiryCourses] = useState<string[]>([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [courseSettingsOpen, setCourseSettingsOpen] = useState(false);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(page));

      const response = await fetch(`/api/admin/inquiries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.inquiries);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        toast.error('Failed to fetch inquiries');
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchQuery, page]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Fetch inquiry course options
  const fetchInquiryCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/inquiries/courses');
      if (response.ok) {
        const data = await response.json();
        setInquiryCourses(data.courses || []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchInquiryCourses();
  }, [fetchInquiryCourses]);

  const addCourse = async () => {
    const name = newCourseName.trim();
    if (!name) return;
    setIsAddingCourse(true);
    try {
      const response = await fetch('/api/admin/inquiries/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: name }),
      });
      if (response.ok) {
        const data = await response.json();
        setInquiryCourses(data.courses);
        setNewCourseName('');
        toast.success(`"${name}" added`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add course');
      }
    } catch {
      toast.error('Failed to add course');
    } finally {
      setIsAddingCourse(false);
    }
  };

  const removeCourse = async (course: string) => {
    try {
      const response = await fetch('/api/admin/inquiries/courses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course }),
      });
      if (response.ok) {
        const data = await response.json();
        setInquiryCourses(data.courses);
        toast.success(`"${course}" removed`);
      }
    } catch {
      toast.error('Failed to remove course');
    }
  };

  const viewInquiry = async (inquiry: Inquiry) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedInquiry(data);
        setAdminNote(data.adminNote || '');
        setDetailOpen(true);
        // Refresh list to update status badges
        if (inquiry.status === 'unread') {
          fetchInquiries();
        }
      }
    } catch {
      toast.error('Failed to load inquiry details');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success(`Marked as ${status}`);
        fetchInquiries();
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const saveAdminNote = async () => {
    if (!selectedInquiry) return;
    try {
      const response = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      });
      if (response.ok) {
        toast.success('Note saved');
        setSelectedInquiry(prev => prev ? { ...prev, adminNote } : null);
      }
    } catch {
      toast.error('Failed to save note');
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Inquiry deleted');
        setDetailOpen(false);
        fetchInquiries();
      }
    } catch {
      toast.error('Failed to delete inquiry');
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    try {
      const response = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      if (response.ok) {
        toast.success(`${selectedIds.length} inquiries updated`);
        setSelectedIds([]);
        fetchInquiries();
      }
    } catch {
      toast.error('Failed to update inquiries');
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const response = await fetch('/api/admin/inquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (response.ok) {
        toast.success(`${selectedIds.length} inquiries deleted`);
        setSelectedIds([]);
        fetchInquiries();
      }
    } catch {
      toast.error('Failed to delete inquiries');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === inquiries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inquiries.map(i => i.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = inquiries.filter(i => i.status === 'unread').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            Inquiries
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage contact form submissions ({total} total)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInquiries} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Course Settings */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setCourseSettingsOpen(!courseSettingsOpen)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Inquiry Course Options</CardTitle>
                <CardDescription className="mt-0.5">
                  Manage courses shown in the inquiry form dropdown ({inquiryCourses.length} courses)
                </CardDescription>
              </div>
            </div>
            {courseSettingsOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {courseSettingsOpen && (
          <CardContent className="pt-0 space-y-3">
            {/* Add new course */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter course name..."
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCourse();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={addCourse} disabled={isAddingCourse || !newCourseName.trim()} size="sm">
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Add Course</span>
              </Button>
            </div>
            {/* Course list */}
            {inquiryCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No courses added yet. Add courses above to show them in the inquiry form.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {inquiryCourses.map((course) => (
                  <Badge
                    key={course}
                    variant="secondary"
                    className="pl-3 pr-1.5 py-1.5 text-sm gap-1.5"
                  >
                    {course}
                    <button
                      onClick={() => removeCourse(course)}
                      className="rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, subject..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('read')}>
                <MailOpen className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Mark Read</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('archived')}>
                <Archive className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Archive</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.length} inquiries?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. These inquiries will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={bulkDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inquiries List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Submissions</CardTitle>
            {inquiries.length > 0 && (
              <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                {selectedIds.length === inquiries.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No inquiries found</p>
              <p className="text-sm mt-1">
                {filterStatus !== 'all' || searchQuery
                  ? 'Try adjusting your filters'
                  : 'Inquiries from the contact form will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className={`relative flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-3 rounded-lg border transition-colors hover:bg-accent/50 cursor-pointer ${
                    inquiry.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''
                  } ${selectedIds.includes(inquiry.id) ? 'ring-2 ring-primary' : ''}`}
                >
                  {/* Top row on mobile: checkbox + name + badge + actions */}
                  <div className="flex items-center gap-2 sm:contents">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(inquiry.id)}
                      onChange={() => toggleSelect(inquiry.id)}
                      className="h-4 w-4 rounded border-gray-300 shrink-0 sm:mt-1.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {/* Mobile: show name + badge inline with checkbox */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 sm:hidden" onClick={() => viewInquiry(inquiry)}>
                      <span className={`font-medium truncate ${inquiry.status === 'unread' ? 'font-bold' : ''}`}>
                        {inquiry.name}
                      </span>
                      <Badge className={`text-xs shrink-0 ${STATUS_COLORS[inquiry.status] || ''}`}>
                        {inquiry.status}
                      </Badge>
                    </div>
                    {/* Mobile: action buttons inline */}
                    <div className="flex items-center gap-1 shrink-0 sm:hidden">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewInquiry(inquiry)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the inquiry from {inquiry.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteInquiry(inquiry.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 min-w-0" onClick={() => viewInquiry(inquiry)}>
                    {/* Desktop: name + badge + subject in row */}
                    <div className="hidden sm:flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${inquiry.status === 'unread' ? 'font-bold' : ''}`}>
                        {inquiry.name}
                      </span>
                      <Badge className={`text-xs ${STATUS_COLORS[inquiry.status] || ''}`}>
                        {inquiry.status}
                      </Badge>
                      {inquiry.subject && (
                        <span className="text-sm text-muted-foreground truncate">— {inquiry.subject}</span>
                      )}
                    </div>
                    {/* Mobile: subject on its own line */}
                    {inquiry.subject && (
                      <p className="text-sm text-muted-foreground truncate sm:hidden">
                        {inquiry.subject}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{inquiry.email}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {inquiry.message.substring(0, 100)}
                      {inquiry.message.length > 100 ? '...' : ''}
                    </p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        {formatDate(inquiry.createdAt)}
                      </span>
                      {inquiry.phone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3 shrink-0" />
                          {inquiry.phone}
                        </span>
                      )}
                      {inquiry.adminNote && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <StickyNote className="h-3 w-3 shrink-0" />
                          Has note
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desktop: action buttons */}
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => viewInquiry(inquiry)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the inquiry from {inquiry.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteInquiry(inquiry.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t gap-2">
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          {selectedInquiry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Inquiry from {selectedInquiry.name}
                </DialogTitle>
                <DialogDescription>
                  Received {formatDate(selectedInquiry.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Status & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Badge className={`w-fit ${STATUS_COLORS[selectedInquiry.status] || ''}`}>
                    {selectedInquiry.status}
                  </Badge>
                  <div className="flex flex-wrap gap-1 sm:ml-auto">
                    {selectedInquiry.status !== 'unread' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selectedInquiry.id, 'unread')}>
                        <Mail className="h-3 w-3 mr-1" /> <span className="text-xs sm:text-sm">Unread</span>
                      </Button>
                    )}
                    {selectedInquiry.status !== 'replied' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selectedInquiry.id, 'replied')}>
                        <Reply className="h-3 w-3 mr-1" /> <span className="text-xs sm:text-sm">Replied</span>
                      </Button>
                    )}
                    {selectedInquiry.status !== 'archived' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selectedInquiry.id, 'archived')}>
                        <Archive className="h-3 w-3 mr-1" /> <span className="text-xs sm:text-sm">Archive</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Contact Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <p className="font-medium">{selectedInquiry.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p>
                          <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                            {selectedInquiry.email}
                          </a>
                        </p>
                      </div>
                      {selectedInquiry.phone && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Phone</Label>
                          <p>
                            <a href={`tel:${selectedInquiry.phone}`} className="text-primary hover:underline">
                              {selectedInquiry.phone}
                            </a>
                          </p>
                        </div>
                      )}
                      {selectedInquiry.subject && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Subject</Label>
                          <p className="font-medium">{selectedInquiry.subject}</p>
                        </div>
                      )}
                    </div>
                    {/* Course & Level Info */}
                    {(selectedInquiry.course || selectedInquiry.jlptLevel || selectedInquiry.codingLevel) && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t">
                        {selectedInquiry.course && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Interested Course</Label>
                            <p className="font-medium">{selectedInquiry.course}</p>
                          </div>
                        )}
                        {selectedInquiry.jlptLevel && (
                          <div>
                            <Label className="text-xs text-muted-foreground">JLPT Level</Label>
                            <p className="font-medium">{selectedInquiry.jlptLevel}</p>
                          </div>
                        )}
                        {selectedInquiry.codingLevel && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Coding Level</Label>
                            <p className="font-medium">{selectedInquiry.codingLevel}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Message */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md">
                      {selectedInquiry.message}
                    </div>
                  </CardContent>
                </Card>

                {/* Reply via Email */}
                <div>
                  <Button asChild className="w-full" size="default">
                    <a href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject || 'Your Inquiry'}`}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply via Email
                    </a>
                  </Button>
                </div>

                {/* Admin Note */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Admin Note
                    </CardTitle>
                    <CardDescription>Internal note (not visible to the user)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Textarea
                      placeholder="Add a private note about this inquiry..."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={3}
                    />
                    <Button size="sm" onClick={saveAdminNote}>
                      Save Note
                    </Button>
                  </CardContent>
                </Card>

                {/* Replied At */}
                {selectedInquiry.repliedAt && (
                  <p className="text-xs text-muted-foreground text-center">
                    Replied on {formatDate(selectedInquiry.repliedAt)}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
