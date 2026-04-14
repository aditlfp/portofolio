'use client';

import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import toast from 'react-hot-toast';

export default function ProfileAdminPage() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    avatar: '',
    email: '',
    location: '',
    years_experience: '',
    resume_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setFormData(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success('Profile updated successfully');
    } else {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading profile data...</div>;

  return (
    <div className="py-8 space-y-12 animate-fade-in">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Profile Details */}
          <div className="lg:col-span-1 space-y-8">
            <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">Identity & Visuals</h3>
            <div className="p-4 sm:p-8 rounded-3xl bg-surface-container-low space-y-8 ring-1 ring-outline-variant/10">
              <ImageUploader 
                label="Profile Avatar" 
                value={formData.avatar} 
                onChange={url => setFormData({...formData, avatar: url})} 
                aspectRatio="aspect-square w-32 mx-auto" 
              />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Professional Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                    value={formData.title || ''}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Experience Label</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                    placeholder="8+ Years"
                    value={formData.years_experience || ''}
                    onChange={e => setFormData({...formData, years_experience: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bio and Narrative */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">Narrative & Contact</h3>
            <form onSubmit={handleSubmit} className="p-4 sm:p-8 rounded-3xl bg-surface-container-low space-y-8 ring-1 ring-outline-variant/10">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Narrative Biography</label>
                    <textarea 
                      className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface resize-none leading-relaxed"
                      rows={8}
                      value={formData.bio || ''}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    ></textarea>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                        value={formData.email || ''}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Location</label>
                      <input 
                        type="text" 
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                        value={formData.location || ''}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Resume URL / Link</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                      placeholder="https://..."
                      value={formData.resume_url || ''}
                      onChange={e => setFormData({...formData, resume_url: e.target.value})}
                    />
                 </div>
              </div>

              <div className="flex justify-end">
                <button 
                  disabled={saving}
                  className="indigo-gradient-bg text-on-primary px-8 sm:px-12 py-3 rounded-xl font-headline font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {saving && <span className="loading loading-spinner loading-xs"></span>}
                  Update Biography
                </button>
              </div>
            </form>
          </div>
       </div>
    </div>
  );
}
