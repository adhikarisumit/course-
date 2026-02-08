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
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, MessageCircle, Hash, Users, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    messages: number;
  };
}

export default function ChatRoomsPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ChatRoom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'general',
    isActive: true,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/admin/chat-rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        toast.error('Failed to fetch chat rooms');
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to fetch chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingRoom ? `/api/admin/chat-rooms/${editingRoom.id}` : '/api/admin/chat-rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingRoom ? 'Chat room updated successfully' : 'Chat room created successfully');
        setDialogOpen(false);
        setEditingRoom(null);
        setFormData({ name: '', description: '', type: 'general', isActive: true });
        fetchRooms();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save chat room');
      }
    } catch (error) {
      console.error('Error saving chat room:', error);
      toast.error('Failed to save chat room');
    }
  };

  const handleEdit = (room: ChatRoom) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      type: room.type,
      isActive: room.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (roomId: string) => {
    try {
      const response = await fetch(`/api/admin/chat-rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Chat room deleted successfully');
        fetchRooms();
      } else {
        toast.error('Failed to delete chat room');
      }
    } catch (error) {
      console.error('Error deleting chat room:', error);
      toast.error('Failed to delete chat room');
    }
  };

  const toggleActive = async (room: ChatRoom) => {
    try {
      const response = await fetch(`/api/admin/chat-rooms/${room.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...room,
          isActive: !room.isActive,
        }),
      });

      if (response.ok) {
        toast.success(`Chat room ${!room.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchRooms();
      } else {
        toast.error('Failed to update chat room');
      }
    } catch (error) {
      console.error('Error updating chat room:', error);
      toast.error('Failed to update chat room');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'support':
        return 'destructive';
      case 'course':
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
          <p className="text-muted-foreground">Loading chat rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Chat Room Management</h1>
          <p className="text-muted-foreground">Create and manage community chat rooms for students</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingRoom(null);
              setFormData({ name: '', description: '', type: 'general', isActive: true });
            }} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Chat Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingRoom ? 'Edit Chat Room' : 'Create Chat Room'}</DialogTitle>
                <DialogDescription>
                  {editingRoom ? 'Update the chat room details below.' : 'Fill in the details to create a new chat room.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., General Discussion"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the chat room..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Room Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="course">Course Discussion</SelectItem>
                      <SelectItem value="announcement">Announcements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRoom ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Chat Rooms Yet</h2>
            <p className="text-muted-foreground mb-4">
              Create your first chat room for students to start conversations.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Chat Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} className={!room.isActive ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                  </div>
                  <Badge variant={getTypeColor(room.type)}>{room.type}</Badge>
                </div>
                {room.description && (
                  <CardDescription className="mt-1">{room.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{room._count.messages} messages</span>
                  </div>
                  <Badge variant={room.isActive ? 'default' : 'secondary'}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/admin/chat-rooms/${room.id}`}>
                      <LogIn className="h-4 w-4 mr-1" />
                      Enter
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(room)}
                  >
                    {room.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat Room</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{room.name}&quot;? This will also delete all messages in this room. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(room.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
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
