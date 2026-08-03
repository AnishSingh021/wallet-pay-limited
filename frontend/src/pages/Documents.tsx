import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download } from 'lucide-react';
import api from '../lib/axios';
import { UploadedDocument } from '../lib/types';

export function PublicDocuments() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['public', 'documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data.data as UploadedDocument[];
    },
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-surface-900">Company Resources</h1>
        <p className="mt-4 text-lg text-surface-600 max-w-2xl mx-auto">
          Access important policies, guidelines, and handbooks for the Wallet Pay platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="animate-shimmer min-h-[160px]">
              <div className="w-full h-full" />
            </Card>
          ))
        ) : documents && documents.length > 0 ? (
          documents.map((doc) => (
            <Card key={doc._id} hover className="flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/15 text-primary-500 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 text-lg leading-tight">{doc.title}</h3>
                  <p className="text-sm text-surface-500 mt-1">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <p className="text-surface-600 text-sm flex-1 mb-6">
                {doc.description || 'No description provided.'}
              </p>
              <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noopener noreferrer" className="block mt-auto">
                <Button fullWidth variant="secondary" icon={<Download className="w-4 h-4" />}>
                  Download PDF
                </Button>
              </a>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <FileText className="w-16 h-16 mx-auto text-surface-400 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-surface-800">No resources available</h3>
            <p className="text-surface-500 mt-2">Check back later for updated company documents.</p>
          </div>
        )}
      </div>
    </div>
  );
}
