'use client';

import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AppIcon from '@/components/ui/AppIcon';

interface Certificate {
  id: number;
  title: string;
  year: string;
  image: string;
  sort_order: number;
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    image: '',
    sort_order: 0,
  });

  const fetchCerts = () => {
    fetch('/api/certificates')
      .then(res => res.json())
      .then(data => {
        setCerts(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/certificates/${editingId}` : '/api/certificates';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success(editingId ? 'Certificate updated' : 'Certificate added');
      setEditingId(null);
      setFormData({ title: '', year: '', image: '', sort_order: 0 });
      fetchCerts();
    } else {
      toast.error('Failed to save certificate');
    }
  };

  const handleEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setFormData({
      title: cert.title,
      year: cert.year,
      image: cert.image,
      sort_order: cert.sort_order,
    });
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/certificates/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Certificate deleted');
      fetchCerts();
    } else {
      toast.error('Failed to delete certificate');
    }
    setConfirmId(null);
  };

  return (
    <div className="py-8 space-y-12 animate-fade-in">
      <ConfirmDialog
        isOpen={confirmId !== null}
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate? This cannot be undone."
        onConfirm={() => confirmId !== null && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Management List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">Existing Certificates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certs.map(cert => (
              <div key={cert.id} className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:border-primary/30 transition-all flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-xl bg-primary-container/10 text-primary">
                    <AppIcon name="certificate" className="text-2xl" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(cert)} className="p-2 text-on-surface-variant hover:text-primary"><AppIcon name="edit" className="text-sm" /></button>
                    <button onClick={() => setConfirmId(cert.id)} className="p-2 text-on-surface-variant hover:text-error"><AppIcon name="trash" className="text-sm" /></button>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">{cert.title}</h4>
                  <p className="text-xs text-on-surface-variant font-body mb-4">{cert.year || 'No date set'}</p>
                </div>
              </div>
            ))}
            {certs.length === 0 && !loading && (
               <div className="col-span-full p-12 text-center text-on-surface-variant italic border border-dashed border-outline-variant/20 rounded-2xl">
                 No certificates added yet.
               </div>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="space-y-6">
          <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">{editingId ? 'Edit Certificate' : 'Add New Certificate'}</h3>
          <form onSubmit={handleSave} className="p-4 sm:p-8 rounded-3xl bg-surface-container-low space-y-6 ring-1 ring-outline-variant/10">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Certificate Title</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                  placeholder="AWS Solutions Architect"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Year / Period</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                  placeholder="2023 - Present"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: e.target.value})}
                />
              </div>
              <ImageUploader label="Certificate Logo" value={formData.image} onChange={url => setFormData({...formData, image: url})} aspectRatio="aspect-square w-32 mx-auto" />
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Sort Order</label>
                <input 
                  type="number" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                  value={formData.sort_order}
                  onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex gap-4">
              {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({title:'', year:'', image:'', sort_order:0})}} className="flex-1 py-3 bg-surface-container-highest rounded-xl text-sm font-bold">Cancel</button>}
              <button type="submit" className="flex-[2] indigo-gradient-bg text-on-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                {editingId ? 'Update' : 'Add Certificate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
