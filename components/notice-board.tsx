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
      <div className={compact ? "w-full" : "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <Card className={compact ? "shadow-sm border" : "shadow-lg"}>
          <CardHeader className={compact ? "pb-1 px-2 pt-2" : "text-center sm:text-left"}>
            <CardTitle className={`flex items-center gap-2 ${compact ? "text-sm justify-center sm:justify-start" : "text-xl sm:text-2xl justify-center sm:justify-start"}`}>
              <Bell className={compact ? "h-3 w-3" : "h-5 w-5 sm:h-6 sm:w-6"} />
              <span className={compact ? "text-xs" : ""}>Notice Board</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={compact ? "p-2" : "p-4 sm:p-6"}>
            <div className={`flex justify-center items-center ${compact ? "py-1" : "py-8 sm:py-12"}`}>
              <div className={`animate-spin rounded-full border-b-2 border-primary ${compact ? "h-4 w-4" : "h-8 w-8 sm:h-10 sm:w-10"}`}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={compact ? "w-full" : "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
      <Card className={compact ? "shadow-sm border" : "shadow-lg"}>
        <CardHeader className={compact ? "pb-1 px-2 pt-2" : "text-center sm:text-left"}>
          <CardTitle className={`flex items-center gap-2 ${compact ? "text-sm justify-center sm:justify-start" : "text-xl sm:text-2xl justify-center sm:justify-start"}`}>
            <Bell className={compact ? "h-3 w-3" : "h-5 w-5 sm:h-6 sm:w-6"} />
            <span className={compact ? "text-xs" : ""}>Notice Board</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? "p-2" : "p-4 sm:p-6"}>
          {notices.length === 0 ? (
            <div className={`text-center ${compact ? "py-1" : "py-8 sm:py-12"}`}>
              <Bell className={`mx-auto text-muted-foreground mb-2 ${compact ? "h-6 w-6" : "h-12 w-12 sm:h-16 sm:w-16"}`} />
              <h3 className={`font-semibold mb-1 ${compact ? "text-base" : "text-lg sm:text-xl"}`} style={compact ? {} : {}}>No notices</h3>
              <p className={`text-muted-foreground ${compact ? "text-sm" : "text-sm sm:text-base"}`} style={compact ? {} : {}}>There are no active notices at the moment.</p>
            </div>
          ) : (
            <div className={`space-y-2 ${compact ? "space-y-1" : "sm:space-y-6"}`}>
              {notices.slice(0, compact ? 3 : notices.length).map((notice) => (
                <div key={notice.id} className={`border rounded-md bg-card hover:shadow-sm transition-shadow ${compact ? "p-2 space-y-1" : "p-3 sm:p-4 space-y-3"}`}>
                  <div className={`flex ${compact ? "flex-col gap-1" : "flex-col sm:flex-row sm:items-start sm:justify-between gap-2"}`}>
                    <div className="flex items-center gap-1">
                      {getPriorityIcon(notice.priority)}
                      <h4 className={`font-semibold leading-tight ${compact ? "text-base" : "text-base sm:text-lg"}`} style={compact ? {} : {}}>{notice.title}</h4>
                    </div>
                    <Badge variant={getPriorityColor(notice.priority)} className="self-start text-xs">
                      {notice.priority}
                    </Badge>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className={`whitespace-pre-wrap text-muted-foreground leading-relaxed ${compact ? "text-sm" : "text-sm sm:text-base"}`} style={compact ? { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } : {}}>{notice.content}</p>
                  </div>
                  <div className={`flex ${compact ? "flex-col gap-1" : "flex-col sm:flex-row sm:items-center sm:justify-between gap-2"} text-xs text-muted-foreground ${compact ? "pt-1" : "border-t pt-3"}`}>
                    <span className="font-medium text-xs">By {notice.author.name}</span>
                    <span className="text-xs">{new Date(notice.publishedAt).toLocaleDateString()}</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}