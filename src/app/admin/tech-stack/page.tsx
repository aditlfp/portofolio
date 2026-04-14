'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AppIcon from '@/components/ui/AppIcon';
import { appIconOptions } from '@/lib/icon-registry';

interface TechItem {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
}

const DEFAULT_ICON = 'terminal';

export default function TechStackAdminPage() {
  const [items, setItems] = useState<TechItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [iconSearch, setIconSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    icon: DEFAULT_ICON,
    sort_order: 0,
  });

  const filteredIconOptions = useMemo(() => {
    const query = iconSearch.trim().toLowerCase();
    if (!query) return appIconOptions;
    return appIconOptions.filter((option) => option.label.toLowerCase().includes(query));
  }, [iconSearch]);

  const getIconOptionLabel = (iconValue: string) => {
    return appIconOptions.find((option) => option.value === iconValue)?.label || iconValue;
  };

  const fetchItems = () => {
    fetch('/api/tech-stack')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setIconSearch('');
    setFormData({ name: '', icon: DEFAULT_ICON, sort_order: 0 });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/tech-stack/${editingId}` : '/api/tech-stack';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success(editingId ? 'Tech item updated' : 'Tech item added');
      resetForm();
      fetchItems();
    } else {
      toast.error('Failed to save tech item');
    }
  };

  const handleEdit = (item: TechItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      icon: item.icon || DEFAULT_ICON,
      sort_order: item.sort_order,
    });
    setIconSearch(getIconOptionLabel(item.icon || DEFAULT_ICON));
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/tech-stack/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Tech item deleted');
      fetchItems();
    } else {
      toast.error('Failed to delete tech item');
    }
    setConfirmId(null);
  };

  return (
    <div className="animate-fade-in space-y-12 py-8">
      <ConfirmDialog
        isOpen={confirmId !== null}
        title="Delete Tech Item"
        message="Are you sure you want to delete this technology? This cannot be undone."
        onConfirm={() => confirmId !== null && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <h3 className="border-l-4 border-primary pl-4 font-headline text-xl font-bold">Technologies Ecosystem</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map(item => (
              <div key={item.id} className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 transition-all hover:border-primary/30">
                <AppIcon name={item.icon} className="text-3xl text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface">{item.name}</span>
                <div className="absolute right-2 top-2 flex opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => handleEdit(item)} className="p-1 text-on-surface-variant hover:text-primary"><AppIcon name="edit" className="text-sm" /></button>
                  <button onClick={() => setConfirmId(item.id)} className="p-1 text-on-surface-variant hover:text-error"><AppIcon name="trash" className="text-sm" /></button>
                </div>
              </div>
            ))}
          </div>
          {!loading && items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-outline-variant/20 p-10 text-center text-sm italic text-on-surface-variant">
              No tech stack items yet.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="border-l-4 border-primary pl-4 font-headline text-xl font-bold">{editingId ? 'Edit Technology' : 'Add Technology'}</h3>
          <form onSubmit={handleSave} className="space-y-6 rounded-3xl bg-surface-container-low p-4 sm:p-8 ring-1 ring-outline-variant/10">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase text-on-surface-variant">Tech Name</label>
                <input
                  type="text"
                  className="w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary"
                  placeholder="React"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase text-on-surface-variant">Icon (Search + Select)</label>
                <div className="flex items-center gap-4 rounded-xl bg-surface-container-lowest px-4 py-3 ring-1 ring-outline-variant/20">
                  <AppIcon name={formData.icon} className="text-3xl text-primary" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">{getIconOptionLabel(formData.icon)}</p>
                    <p className="text-[11px] uppercase tracking-wider text-on-surface-variant">Live preview</p>
                  </div>
                </div>
                <input
                  type="text"
                  className="w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary"
                  placeholder="Search icon presets..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                />
                <div className="max-h-56 space-y-2 overflow-auto rounded-xl bg-surface-container-lowest p-2 ring-1 ring-outline-variant/20">
                  {filteredIconOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: option.value })}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${formData.icon === option.value ? 'bg-primary/20 text-primary' : 'text-on-surface hover:bg-surface-container-highest'}`}
                    >
                      <AppIcon name={option.value} className="text-lg" />
                      <span className="text-sm font-semibold">{option.label}</span>
                    </button>
                  ))}
                  {filteredIconOptions.length === 0 && (
                    <p className="p-3 text-xs italic text-on-surface-variant">No icon matched your search.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase text-on-surface-variant">Sort Order</label>
                <input
                  type="number"
                  className="w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              {editingId && <button type="button" onClick={resetForm} className="flex-1 rounded-xl bg-surface-container-highest py-3 text-sm font-bold">Cancel</button>}
              <button type="submit" className="indigo-gradient-bg flex-[2] rounded-xl py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all active:scale-95">
                {editingId ? 'Update' : 'Add Tech'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
