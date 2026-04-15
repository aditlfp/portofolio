'use client';

import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import toast from 'react-hot-toast';

export default function ProfileAdminPage() {
  const [formData, setFormData] = useState({
    name: '', name_en: '', name_id: '',
    title: '', title_en: '', title_id: '',
    bio: '', bio_en: '', bio_id: '',
    avatar: '',
    email: '',
    location: '', location_en: '', location_id: '',
    years_experience: '', years_experience_en: '', years_experience_id: '',
    resume_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        const normalizedData = {
          name: data.name || '',
          name_en: data.name_en || '',
          name_id: data.name_id || '',
          title: data.title || '',
          title_en: data.title_en || '',
          title_id: data.title_id || '',
          bio: data.bio || '',
          bio_en: data.bio_en || '',
          bio_id: data.bio_id || '',
          avatar: data.avatar || '',
          email: data.email || '',
          location: data.location || '',
          location_en: data.location_en || '',
          location_id: data.location_id || '',
          years_experience: data.years_experience || '',
          years_experience_en: data.years_experience_en || '',
          years_experience_id: data.years_experience_id || '',
          resume_url: data.resume_url || '',
        };
        setFormData(normalizedData);
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
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Full Name (EN)</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                    value={formData.name_en || ''}
                    onChange={e => setFormData({...formData, name_en: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Full Name (ID)</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                    value={formData.name_id || ''}
                    onChange={e => setFormData({...formData, name_id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Professional Title (EN)</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                    value={formData.title_en || ''}
                    onChange={e => setFormData({...formData, title_en: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Professional Title (ID)</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                    value={formData.title_id || ''}
                    onChange={e => setFormData({...formData, title_id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Experience Label (EN)</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                    placeholder="8+ Years"
                    value={formData.years_experience_en || ''}
                    onChange={e => setFormData({...formData, years_experience_en: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Experience Label (ID)</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                    placeholder="8+ Tahun"
                    value={formData.years_experience_id || ''}
                    onChange={e => setFormData({...formData, years_experience_id: e.target.value})}
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
                    <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Narrative Biography (EN)</label>
                    <textarea 
                      className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface resize-none leading-relaxed"
                      rows={8}
                      value={formData.bio_en || ''}
                      onChange={e => setFormData({...formData, bio_en: e.target.value})}
                    ></textarea>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Narrative Biography (ID)</label>
                    <textarea 
                      className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface resize-none leading-relaxed"
                      rows={8}
                      value={formData.bio_id || ''}
                      onChange={e => setFormData({...formData, bio_id: e.target.value})}
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
                      <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Location (EN)</label>
                      <input 
                        type="text" 
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                        value={formData.location_en || ''}
                        onChange={e => setFormData({...formData, location_en: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Location (ID)</label>
                      <input 
                        type="text" 
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none text-on-surface"
                        value={formData.location_id || ''}
                        onChange={e => setFormData({...formData, location_id: e.target.value})}
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
