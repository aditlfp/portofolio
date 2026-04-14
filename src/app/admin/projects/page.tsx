'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AppIcon from '@/components/ui/AppIcon';

interface Project {
  id: number;
  title: string;
  slug: string;
  category: string;
  visibility: string;
  thumbnail: string;
  updated_at: string;
}

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const fetchProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Project deleted');
      fetchProjects();
    } else {
      toast.error('Failed to delete project');
    }
    setConfirmId(null);
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-8 space-y-6 animate-fade-in">
      <ConfirmDialog
        isOpen={confirmId !== null}
        title="Delete Project"
        message="Are you sure you want to permanently delete this project? This action cannot be undone."
        onConfirm={() => confirmId !== null && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">Project Inventory</h3>
          <p className="text-on-surface-variant text-sm mt-1">Manage all projects that appear in your portfolio.</p>
        </div>
        <Link 
          href="/admin/projects/new" 
          className="bg-primary-container text-white px-6 py-3 rounded-xl font-headline font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all active:scale-95 shadow-lg shadow-primary-container/20 w-full sm:w-auto"
        >
          <AppIcon name="add" className="text-sm" />
          New Project
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative">
          <AppIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant" />
          <input 
            className="bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary w-full sm:w-64 text-on-surface" 
            placeholder="Search projects..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {filteredProjects.map((project) => (
          <div key={`card-${project.id}`} className="bg-surface-container-low rounded-2xl p-4 ring-1 ring-outline-variant/10">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden relative shrink-0">
                <Image
                  src={project.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop'}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-on-surface truncate">{project.title}</p>
                <p className="text-xs text-on-surface-variant truncate">/{project.slug}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">{project.category || 'Uncategorized'}</span>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${project.visibility === 'public' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {project.visibility}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[11px] text-on-surface-variant">{new Date(project.updated_at).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <Link href={`/admin/projects/${project.id}`} className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary">
                  <AppIcon name="edit" className="text-lg" />
                </Link>
                <button onClick={() => setConfirmId(project.id)} className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-error">
                  <AppIcon name="trash" className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && filteredProjects.length === 0 && (
          <div className="px-4 py-10 text-center text-on-surface-variant italic font-body rounded-2xl bg-surface-container-low ring-1 ring-outline-variant/10">
            No projects found.
          </div>
        )}
      </div>

      <div className="hidden md:block bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl ring-1 ring-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high">
              <th className="px-8 py-5 text-xs font-label text-on-surface-variant uppercase tracking-widest">Project Name</th>
              <th className="px-8 py-5 text-xs font-label text-on-surface-variant uppercase tracking-widest">Category</th>
              <th className="px-8 py-5 text-xs font-label text-on-surface-variant uppercase tracking-widest">Visibility</th>
              <th className="px-8 py-5 text-xs font-label text-on-surface-variant uppercase tracking-widest">Last Updated</th>
              <th className="px-8 py-5 text-xs font-label text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-surface-container-high transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest overflow-hidden relative">
                      <Image 
                        src={project.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop'} 
                        alt={project.title} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">{project.title}</div>
                      <div className="text-xs text-on-surface-variant font-body">/{project.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-label font-bold uppercase">
                    {project.category || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-body text-on-surface">
                    <span className={`w-2 h-2 rounded-full ${project.visibility === 'public' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {project.visibility.charAt(0).toUpperCase() + project.visibility.slice(1)}
                  </div>
                </td>
                <td className="px-8 py-6 text-xs text-on-surface-variant font-body">
                  {new Date(project.updated_at).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/admin/projects/${project.id}`}
                      className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant hover:text-primary"
                    >
                      <AppIcon name="edit" className="text-lg" />
                    </Link>
                    <button 
                      onClick={() => setConfirmId(project.id)}
                      className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant hover:text-error"
                    >
                      <AppIcon name="trash" className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && filteredProjects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant italic font-body">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
