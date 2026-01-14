'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: string;
  publishedAt: string;
  author: {
    name: string;
  };
}

interface NoticeBoardProps {
  compact?: boolean;
}

export default function NoticeBoard({ compact = false }: NoticeBoardProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
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
      <div className="w-full">
        <Card className="shadow-sm border bg-muted/30">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Notice Board</span>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent ml-2"></div>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={compact ? "w-full" : "w-full"}>
      <Card className={`shadow-sm border transition-all duration-300 ${notices.length === 0 ? "bg-muted/30" : ""}`}>
        <CardHeader className={`${notices.length === 0 ? "py-3 px-4" : compact ? "pb-1 px-2 pt-2" : "py-4 px-4 sm:px-6"}`}>
          <CardTitle className={`flex items-center gap-2 ${notices.length === 0 ? "text-base" : compact ? "text-sm justify-center sm:justify-start" : "text-lg sm:text-xl"}`}>
            <Bell className={notices.length === 0 ? "h-4 w-4 text-muted-foreground" : compact ? "h-3 w-3" : "h-5 w-5"} />
            <span className={notices.length === 0 ? "text-muted-foreground" : ""}>Notice Board</span>
            {notices.length === 0 && (
              <span className="text-sm text-muted-foreground font-normal ml-2">— No active notices</span>
            )}
          </CardTitle>
        </CardHeader>
        {notices.length > 0 && (
          <CardContent className={compact ? "p-2" : "px-4 sm:px-6 pb-4 sm:pb-6 pt-0"}>
            <div className={`space-y-2 ${compact ? "space-y-1" : "sm:space-y-4"}`}>
              {notices.slice(0, compact ? 3 : notices.length).map((notice) => (
                <div key={notice.id} className={`border rounded-lg bg-card hover:shadow-sm transition-shadow ${compact ? "p-2 space-y-1" : "p-3 sm:p-4 space-y-2"}`}>
                  <div className={`flex ${compact ? "flex-col gap-1" : "flex-col sm:flex-row sm:items-start sm:justify-between gap-2"}`}>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(notice.priority)}
                      <h4 className={`font-semibold leading-tight ${compact ? "text-base" : "text-base sm:text-lg"}`}>{notice.title}</h4>
                    </div>
                    <Badge variant={getPriorityColor(notice.priority)} className="self-start text-xs">
                      {notice.priority}
                    </Badge>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className={`whitespace-pre-wrap text-muted-foreground leading-relaxed ${compact ? "text-sm line-clamp-2" : "text-sm sm:text-base"}`}>{notice.content}</p>
                  </div>
                  <div className={`flex ${compact ? "flex-col gap-1" : "flex-col sm:flex-row sm:items-center sm:justify-between gap-2"} text-xs text-muted-foreground ${compact ? "pt-1" : "border-t pt-2"}`}>
                    <span className="font-medium">By {notice.author.name}</span>
                    <span>{new Date(notice.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {compact && notices.length > 3 && (
                <div className="text-center pt-1">
                  <p className="text-xs text-muted-foreground">
                    And {notices.length - 3} more notice{notices.length - 3 !== 1 ? 's' : ''}...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}