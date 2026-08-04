import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Gift } from 'lucide-react';
import api from '../lib/axios';

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    // Refetch every minute to keep notifications up to date
    refetchInterval: 60000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAsReadMutation.mutate('all');
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        className="p-2 text-surface-500 hover:text-primary-500 transition-colors relative focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger-500 rounded-full border-2 border-surface-50"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-100 border border-surface-300 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-surface-200 flex items-center justify-between bg-surface-50">
            <h3 className="font-semibold text-surface-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-surface-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">You have no notifications.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-200">
                {notifications.map((notification: any) => (
                  <div
                    key={notification._id}
                    className={`p-4 flex gap-3 transition-colors ${
                      notification.isRead ? 'bg-surface-50 opacity-70' : 'bg-surface-100'
                    } hover:bg-surface-200`}
                  >
                    <div className="shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center">
                        <Gift className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 mb-0.5">
                        {notification.title}
                      </p>
                      <p className="text-xs text-surface-600 leading-relaxed mb-1">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-surface-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-surface-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
