import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Bell, AlertTriangle, Info, Zap } from 'lucide-react';
import api from '../../lib/axios';
import { Announcement } from '../../lib/types';

export function AnnouncementsPage() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await api.get('/announcements');
      return res.data.data as Announcement[];
    },
  });

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { icon: <AlertTriangle className="w-5 h-5" />, color: 'danger', label: 'Important' };
      case 'medium':
        return { icon: <Zap className="w-5 h-5" />, color: 'warning', label: 'Update' };
      default:
        return { icon: <Info className="w-5 h-5" />, color: 'info', label: 'News' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <header>
        <h1 className="text-2xl font-display font-bold text-surface-900">Announcements</h1>
        <p className="text-surface-600 mt-1">Stay updated with the latest news from Wallet Pay.</p>
      </header>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : announcements && announcements.length > 0 ? (
          announcements.map((announcement) => {
            const config = getPriorityConfig(announcement.priority);
            return (
              <Card key={announcement._id} className="relative overflow-hidden group transition-all duration-300">
                {/* Priority edge color */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${config.color}-500`} />
                
                <div className="flex gap-4">
                  <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-${config.color}-500/15 text-${config.color}-500`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-surface-900 truncate">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm shrink-0">
                        <Badge variant={config.color as any} size="sm">{config.label}</Badge>
                        <span className="text-surface-500">
                          {new Date(announcement.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-surface-700 whitespace-pre-wrap leading-relaxed">
                      {announcement.content}
                    </p>
                    <div className="mt-4 pt-4 border-t border-surface-200 flex items-center justify-between text-sm text-surface-500">
                      <span>Posted by {announcement.authorName}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-16 bg-surface-100 rounded-2xl border border-surface-300">
            <Bell className="w-12 h-12 text-surface-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-surface-700">No announcements right now</p>
            <p className="text-surface-500 mt-1">Check back later for updates!</p>
          </div>
        )}
      </div>
    </div>
  );
}
