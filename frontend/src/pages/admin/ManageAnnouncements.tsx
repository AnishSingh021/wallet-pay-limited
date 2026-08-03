import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { Bell, Plus, Trash2, Edit } from 'lucide-react';
import api from '../../lib/axios';
import { Announcement } from '../../lib/types';

export function ManageAnnouncements() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'low',
    isActive: true
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: async () => {
      // Include inactive for admin
      const res = await api.get('/announcements?includeInactive=true');
      return res.data.data as Announcement[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/announcements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.put(`/announcements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
  });

  const openModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement._id);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        isActive: announcement.isActive
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', content: '', priority: 'low', isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Manage Announcements</h1>
          <p className="text-surface-600 mt-1">Create and manage internal news broadcasts.</p>
        </div>
        <Button icon={<Plus className="w-5 h-5" />} onClick={() => openModal()}>
          New Announcement
        </Button>
      </header>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : announcements && announcements.length > 0 ? (
          announcements.map((ann) => (
            <Card key={ann._id} className={!ann.isActive ? 'opacity-60' : ''}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-surface-900">{ann.title}</h3>
                    <Badge variant={
                      ann.priority === 'high' ? 'danger' :
                      ann.priority === 'medium' ? 'warning' : 'info'
                    } size="sm">
                      {ann.priority}
                    </Badge>
                    {!ann.isActive && <Badge variant="neutral" size="sm">Inactive</Badge>}
                  </div>
                  <p className="text-surface-600 line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-surface-400 mt-2">
                    Posted by {ann.authorName} • {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />} onClick={() => openModal(ann)}>
                    Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this announcement?')) {
                        deleteMutation.mutate(ann._id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-surface-100 rounded-2xl border border-surface-300">
            <Bell className="w-12 h-12 text-surface-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-surface-700">No announcements yet</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit Announcement' : 'New Announcement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-700">Content</label>
            <textarea
              className="w-full rounded-lg bg-surface-200 border border-surface-300 p-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none min-h-[120px]"
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <Select
            label="Priority"
            options={[
              { value: 'low', label: 'Low (Info)' },
              { value: 'medium', label: 'Medium (Update)' },
              { value: 'high', label: 'High (Important)' },
            ]}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          />

          {editingId && (
            <div className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded bg-surface-200 border-surface-300 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-surface-700">Active (Visible to members)</label>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Save Changes' : 'Post Announcement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
