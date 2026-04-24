'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AppIcon from '@/components/ui/AppIcon';

interface ExperienceItem {
  id: string | number;
  role: string;
  role_en?: string;
  role_id?: string;
  company: string;
  company_en?: string;
  company_id?: string;
  period?: string;
  period_en?: string;
  period_id?: string;
  location?: string;
  location_en?: string;
  location_id?: string;
  description?: string;
  description_en?: string;
  description_id?: string;
  sort_order: number;
}

const initialForm = {
  role_en: '',
  role_id: '',
  company_en: '',
  company_id: '',
  period_en: '',
  period_id: '',
  location_en: '',
  location_id: '',
  description_en: '',
  description_id: '',
  sort_order: 0,
};

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export default function ExperienceAdminPage() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [draggedId, setDraggedId] = useState<string | number | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [confirmId, setConfirmId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState(initialForm);

  const applySortOrder = (nextItems: ExperienceItem[]) =>
    nextItems.map((item, index) => ({ ...item, sort_order: index }));

  const fetchItems = () => {
    fetch('/api/experience')
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setOrderDirty(false);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/experience/${editingId}` : '/api/experience';

    const payload = {
      ...formData,
      role: formData.role_en,
      company: formData.company_en,
      period: formData.period_en,
      location: formData.location_en,
      description: formData.description_en,
    };

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error('Failed to save experience');
      return;
    }

    toast.success(editingId ? 'Experience updated' : 'Experience added');
    resetForm();
    fetchItems();
  };

  const handleEdit = (item: ExperienceItem) => {
    setEditingId(item.id);
    setFormData({
      role_en: item.role_en || item.role || '',
      role_id: item.role_id || '',
      company_en: item.company_en || item.company || '',
      company_id: item.company_id || '',
      period_en: item.period_en || item.period || '',
      period_id: item.period_id || '',
      location_en: item.location_en || item.location || '',
      location_id: item.location_id || '',
      description_en: item.description_en || item.description || '',
      description_id: item.description_id || '',
      sort_order: item.sort_order || 0,
    });
  };

  const handleDelete = async (id: string | number) => {
    const response = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      toast.error('Failed to delete experience');
      setConfirmId(null);
      return;
    }

    toast.success('Experience deleted');
    setConfirmId(null);
    fetchItems();
  };

  const handleDragStart = (id: string | number) => {
    setDraggedId(id);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (targetId: string | number) => {
    if (draggedId === null || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const sourceIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) {
      setDraggedId(null);
      return;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, movedItem);

    setItems(applySortOrder(nextItems));
    setOrderDirty(true);
    setDraggedId(null);
  };

  const handleSaveOrder = async () => {
    if (!orderDirty || savingOrder) return;
    setSavingOrder(true);

    try {
      for (const item of items) {
        const payload = {
          ...item,
          role: item.role_en || item.role || '',
          company: item.company_en || item.company || '',
          period: item.period_en || item.period || '',
          location: item.location_en || item.location || '',
          description: item.description_en || item.description || '',
          sort_order: item.sort_order,
        };

        const response = await fetch(`/api/experience/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to persist order');
        }
      }

      toast.success('Experience order updated');
      setOrderDirty(false);
      fetchItems();
    } catch {
      toast.error('Failed to save new order');
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="py-8 space-y-12 animate-fade-in">
      <ConfirmDialog
        isOpen={confirmId !== null}
        title="Delete Experience"
        message="Are you sure you want to delete this experience item?"
        onConfirm={() => confirmId !== null && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">Experience Timeline</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-on-surface-variant">Drag cards to reorder</p>
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={!orderDirty || savingOrder}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingOrder ? 'Saving...' : 'Save Order'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <article
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(item.id)}
                onDragEnd={() => setDraggedId(null)}
                className={`cursor-grab active:cursor-grabbing p-6 rounded-2xl bg-surface-container-low border transition-all ${
                  draggedId === item.id ? 'border-primary/50 opacity-60' : 'border-outline-variant/10 hover:border-primary/30'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-primary-container/10 text-primary">
                    <AppIcon name="notes" className="text-xl" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 text-on-surface-variant hover:text-primary"><AppIcon name="edit" className="text-sm" /></button>
                    <button onClick={() => setConfirmId(item.id)} className="p-2 text-on-surface-variant hover:text-error"><AppIcon name="trash" className="text-sm" /></button>
                  </div>
                </div>
                <h4 className="font-bold text-on-surface">{item.role_en || item.role}</h4>
                <p className="text-sm text-primary font-semibold">{item.company_en || item.company}</p>
                <p className="text-xs text-on-surface-variant mt-2">{item.period_en || item.period} - {item.location_en || item.location}</p>
                <p className="text-xs text-on-surface-variant mt-2 line-clamp-3">{stripHtml(String(item.description_en || item.description || ''))}</p>
              </article>
            ))}
            {items.length === 0 && !loading && (
              <div className="col-span-full p-12 text-center text-on-surface-variant italic border border-dashed border-outline-variant/20 rounded-2xl">
                No experience items added yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">{editingId ? 'Edit Experience' : 'Add Experience'}</h3>
          <form onSubmit={handleSave} className="p-4 sm:p-8 rounded-3xl bg-surface-container-low space-y-4 ring-1 ring-outline-variant/10">
            <div className="space-y-2">
              <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Role (EN)</label>
              <input className="w-full bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none" value={formData.role_en} onChange={(e) => setFormData({ ...formData, role_en: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Role (ID)</label>
              <input className="w-full bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none" value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Company (EN)</label>
              <input className="w-full bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none" value={formData.company_en} onChange={(e) => setFormData({ ...formData, company_en: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Company (ID)</label>
              <input className="w-full bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none" value={formData.company_id} onChange={(e) => setFormData({ ...formData, company_id: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Period (EN)</label>
                <input className="w-full bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none" value={formData.period_en} onChange={(e) => setFormData({ ...formData, period_en: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Period (ID)</label>
                <input className="w-full bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none" value={formData.period_id} onChange={(e) => setFormData({ ...formData, period_id: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Location (EN)</label>
                <input className="w-full bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none" value={formData.location_en} onChange={(e) => setFormData({ ...formData, location_en: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Location (ID)</label>
                <input className="w-full bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none" value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} />
              </div>
            </div>
            <RichTextEditor
              label="Description (EN)"
              placeholder="Write experience details in English..."
              value={formData.description_en}
              onChange={(nextValue) => setFormData({ ...formData, description_en: nextValue })}
            />
            <RichTextEditor
              label="Description (ID)"
              placeholder="Tulis detail pengalaman dalam Bahasa Indonesia..."
              value={formData.description_id}
              onChange={(nextValue) => setFormData({ ...formData, description_id: nextValue })}
            />
            <div className="space-y-2">
              <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Sort Order</label>
              <input type="number" className="w-full bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-primary outline-none" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value || '0', 10) || 0 })} />
            </div>
            <div className="flex gap-4 pt-2">
              {editingId && <button type="button" onClick={resetForm} className="flex-1 py-3 bg-surface-container-highest rounded-xl text-sm font-bold">Cancel</button>}
              <button type="submit" className="flex-[2] indigo-gradient-bg text-on-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">{editingId ? 'Update' : 'Add Experience'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
