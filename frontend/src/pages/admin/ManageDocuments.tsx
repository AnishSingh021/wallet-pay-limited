import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { FileText, Plus, Trash2, Download, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';
import { UploadedDocument } from '../../lib/types';

export function ManageDocuments() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadError, setUploadError] = useState('');

  const { data: documents, isLoading } = useQuery({
    queryKey: ['admin', 'documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data.data as UploadedDocument[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
      closeModal();
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.message || 'Failed to upload document.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setTitle('');
    setDescription('');
    setUploadError('');
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Manage Documents</h1>
          <p className="text-surface-600 mt-1">Upload and manage resources for members.</p>
        </div>
        <Button icon={<Plus className="w-5 h-5" />} onClick={() => setIsModalOpen(true)}>
          Upload Document
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Resources</CardTitle>
          <CardDescription>Files visible to all users on the public resources page.</CardDescription>
        </CardHeader>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable cols={4} rows={4} /></div>
          ) : documents && documents.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-200 text-surface-600 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Title</th>
                  <th className="px-6 py-3 font-semibold">File Name</th>
                  <th className="px-6 py-3 font-semibold">Size</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-surface-150 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-surface-900">{doc.title}</p>
                      <p className="text-xs text-surface-500 truncate max-w-xs">{doc.description}</p>
                    </td>
                    <td className="px-6 py-4 text-surface-700 font-mono text-xs">{doc.fileName}</td>
                    <td className="px-6 py-4 text-surface-600">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="secondary" icon={<Download className="w-4 h-4" />}>
                            View
                          </Button>
                        </a>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => {
                            if (window.confirm('Delete this document?')) {
                              deleteMutation.mutate(doc._id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-surface-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium text-surface-700">No documents uploaded</p>
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Upload New Document">
        <form onSubmit={handleUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 flex items-center gap-2 text-danger-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{uploadError}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-700">Select File (PDF/DOCX max 10MB)</label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-surface-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>

          <Input
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Employee Handbook"
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-700">Description</label>
            <textarea
              className="w-full rounded-lg bg-surface-200 border border-surface-300 p-3 text-sm focus:border-primary-500 focus:outline-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={uploadMutation.isPending} disabled={!file}>
              Upload File
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
