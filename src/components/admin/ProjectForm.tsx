'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import toast from 'react-hot-toast';
import AppIcon from '@/components/ui/AppIcon';

interface TechStackOption {
  name: string;
}

const projectCategoryOptions = [
  'Product Design',
  'Web Development',
  'AI / ML',
  'Fintech Solution',
  'SaaS Platform',
  'Dashboard & Admin Panel',
  'Landing Page',
  'E-commerce',
  'Mobile App',
  'UI/UX Audit',
  'Branding & Identity',
  'Data Visualization',
  'API & Backend',
  'Automation',
  'DevOps & Infrastructure',
  'CMS Integration',
  'Performance Optimization',
  'Security & Authentication',
  'Open Source Tooling',
  'Experimental Lab',
] as const;

export default function ProjectForm({ initialData, id }: { initialData?: any, id?: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '', title_en: '', title_id: '',
    slug: '',
    category: '', category_en: '', category_id: '',
    description: '', description_en: '', description_id: '',
    long_description: '', long_description_en: '', long_description_id: '',
    thumbnail: '',
    hero_image: '',
    live_url: '',
    repo_url: '',
    visibility: 'public',
    tags: [] as string[],
    tech_stack: [] as string[],
    stats: {} as Record<string, string>,
    sort_order: 0,
  });

  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [techStackOptions, setTechStackOptions] = useState<string[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialData) {
      const normalizedData = {
        ...initialData,
        title: initialData.title || '',
        title_en: initialData.title_en || '',
        title_id: initialData.title_id || '',
        slug: initialData.slug || '',
        category: initialData.category || '',
        category_en: initialData.category_en || '',
        category_id: initialData.category_id || '',
        description: initialData.description || '',
        description_en: initialData.description_en || '',
        description_id: initialData.description_id || '',
        long_description: initialData.long_description || '',
        long_description_en: initialData.long_description_en || '',
        long_description_id: initialData.long_description_id || '',
        thumbnail: initialData.thumbnail || '',
        hero_image: initialData.hero_image || '',
        live_url: initialData.live_url || '',
        repo_url: initialData.repo_url || '',
        visibility: initialData.visibility || 'public',
        tags: JSON.parse(initialData.tags || '[]'),
        tech_stack: JSON.parse(initialData.tech_stack || '[]'),
        stats: JSON.parse(initialData.stats || '{}'),
        sort_order: initialData.sort_order || 0,
      };
      setFormData(normalizedData);
    }
  }, [initialData]);

  useEffect(() => {
    fetch('/api/tech-stack')
      .then((res) => res.json())
      .then((data: TechStackOption[]) => {
        if (Array.isArray(data)) {
          const names = data
            .map((item) => item?.name?.trim())
            .filter((name): name is string => Boolean(name));
          setTechStackOptions(Array.from(new Set(names)));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = id ? `/api/projects/${id}` : '/api/projects';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success(id ? 'Project updated' : 'Project published');
      router.push('/admin/projects');
      router.refresh();
    } else {
      toast.error('Error saving project');
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const addTech = (nextTech?: string) => {
    const value = (nextTech ?? techInput).trim();
    if (value && !formData.tech_stack.includes(value)) {
      setFormData({ ...formData, tech_stack: [...formData.tech_stack, value] });
      setTechInput('');
    }
  };

  const filteredTechOptions = techStackOptions
    .filter((tech) => !formData.tech_stack.includes(tech))
    .filter((tech) => tech.toLowerCase().includes(techInput.trim().toLowerCase()))
    .slice(0, 8);

  const filteredCategoryOptions = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    if (!query) return projectCategoryOptions;
    return projectCategoryOptions.filter((option) => option.toLowerCase().includes(query));
  }, [categoryQuery]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!categoryDropdownRef.current) return;
      if (!categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const addStat = (label: string, value: string) => {
     if (label && value) {
       setFormData({ ...formData, stats: { ...formData.stats, [label]: value } });
     }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-24 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-surface md:sticky md:top-28 z-20 py-4 border-b border-outline-variant/10">
        <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">
          {id ? 'Edit Project' : 'New Project'}
        </h3>
        <div className="flex gap-3 w-full sm:w-auto">
           <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-xl text-sm font-bold border border-outline-variant/20 hover:bg-surface-container-high transition-all flex-1 sm:flex-none">Cancel</button>
           <button type="submit" disabled={saving} className="indigo-gradient-bg text-on-primary px-6 sm:px-10 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none">
             {saving && <span className="loading loading-spinner loading-xs"></span>}
             {id ? 'Update Project' : 'Publish Project'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface-container-low p-4 sm:p-8 rounded-3xl space-y-6">
            <h4 className="text-sm font-label uppercase tracking-widest text-primary font-bold">General Narrative</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Project Title (EN)</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none" 
                  placeholder="Lumina Analytics"
                  value={formData.title_en}
                  onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Project Title (ID)</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none" 
                  placeholder="Lumina Analytics"
                  value={formData.title_id}
                  onChange={(e) => setFormData({...formData, title_id: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">URL Slug</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none" 
                  placeholder="lumina-analytics"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Category (EN)</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none" 
                  placeholder="Product Design"
                  value={formData.category_en}
                  onChange={(e) => setFormData({...formData, category_en: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Category (ID)</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none" 
                  placeholder="Desain Produk"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Short Description (EN)</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none" 
                  placeholder="SaaS platform for predictive market movements."
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Short Description (ID)</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none" 
                  placeholder="Platform SaaS untuk gerakan pasar prediktif."
                  value={formData.description_id}
                  onChange={(e) => setFormData({...formData, description_id: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Detailed Narrative (EN)</label>
                <textarea 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none resize-none" 
                  rows={10}
                  placeholder="Describe the challenge, solution, and results..."
                  value={formData.long_description_en}
                  onChange={(e) => setFormData({...formData, long_description_en: e.target.value})}
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Detailed Narrative (ID)</label>
                <textarea 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none resize-none" 
                  rows={10}
                  placeholder="Jelaskan tantangan, solusi, dan hasil..."
                  value={formData.long_description_id}
                  onChange={(e) => setFormData({...formData, long_description_id: e.target.value})}
                ></textarea>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low p-4 sm:p-8 rounded-3xl space-y-6">
            <h4 className="text-sm font-label uppercase tracking-widest text-primary font-bold">Visual Assets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImageUploader label="Front Thumbnail" value={formData.thumbnail} onChange={(url) => setFormData({...formData, thumbnail: url})} />
              <ImageUploader label="Detail Hero Header" value={formData.hero_image} onChange={(url) => setFormData({...formData, hero_image: url})} />
            </div>
          </section>
        </div>

        {/* Right: Sidebar Specs */}
        <div className="space-y-8">
          <section className="bg-surface-container-low p-4 sm:p-8 rounded-3xl space-y-6">
            <h4 className="text-sm font-label uppercase tracking-widest text-primary font-bold">Configuration</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Category</label>
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen((prev) => !prev)}
                    className="w-full rounded-xl bg-surface-container-lowest py-4 pl-11 pr-11 text-left text-sm font-semibold text-on-surface outline-none ring-1 ring-outline-variant/20 transition-all hover:ring-primary/40 focus:ring-2 focus:ring-primary"
                  >
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-primary">
                      <AppIcon name="folder" className="text-base" />
                    </span>
                    {formData.category}
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-on-surface-variant">
                      <AppIcon name="chevronDown" className={`text-base transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  {isCategoryOpen && (
                    <div className="absolute z-40 mt-2 w-full rounded-xl border border-outline-variant/20 bg-surface-container shadow-2xl">
                      <div className="border-b border-outline-variant/10 p-3">
                        <div className="relative">
                          <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant" />
                          <input
                            type="text"
                            value={categoryQuery}
                            onChange={(e) => setCategoryQuery(e.target.value)}
                            placeholder="Search category..."
                            className="w-full rounded-lg bg-surface-container-lowest py-2 pl-9 pr-3 text-xs text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-auto p-2">
                        {filteredCategoryOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category: option });
                              setIsCategoryOpen(false);
                              setCategoryQuery('');
                            }}
                            className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              formData.category === option
                                ? 'bg-primary/20 text-primary'
                                : 'text-on-surface hover:bg-surface-container-high'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                        {filteredCategoryOptions.length === 0 && (
                          <div className="px-3 py-2 text-xs italic text-on-surface-variant">
                            No matching category
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {projectCategoryOptions.slice(0, 6).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: option })}
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        formData.category === option
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Visibility</label>
                <div className="flex bg-surface-container-lowest p-1 rounded-xl ring-1 ring-outline-variant/20">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, visibility: 'public'})}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${formData.visibility === 'public' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant'}`}
                  >Public</button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, visibility: 'draft'})}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${formData.visibility === 'draft' ? 'bg-amber-500 text-white shadow-lg' : 'text-on-surface-variant'}`}
                  >Draft</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-label uppercase font-bold text-on-surface-variant">External Links</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none text-sm mb-2" 
                  placeholder="Live URL"
                  value={formData.live_url}
                  onChange={(e) => setFormData({...formData, live_url: e.target.value})}
                />
                <input 
                   type="text" 
                   className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 focus:ring-primary focus:ring-2 outline-none text-sm" 
                   placeholder="Repository URL"
                   value={formData.repo_url}
                   onChange={(e) => setFormData({...formData, repo_url: e.target.value})}
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low p-4 sm:p-8 rounded-3xl space-y-6">
             <h4 className="text-sm font-label uppercase tracking-widest text-primary font-bold">Tags & Tech</h4>
             
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Tags</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:ring-primary outline-none" 
                      placeholder="React, SaaS..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <button type="button" onClick={addTag} className="p-2 bg-primary text-on-primary rounded-xl"><AppIcon name="add" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-surface-container-high rounded-md text-[10px] uppercase font-bold text-primary">
                        {tag} <button type="button" onClick={() => setFormData({...formData, tags: formData.tags.filter(t => t !== tag)})} className="hover:text-error"><AppIcon name="close" className="text-[12px]" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-label uppercase font-bold text-on-surface-variant">Tech Stack Items</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      list="project-tech-stack-options"
                      className="flex-1 bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:ring-primary outline-none" 
                      placeholder="Pick from your tech stack or type manually..."
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                    />
                    <button type="button" onClick={() => addTech()} className="p-2 bg-primary text-on-primary rounded-xl"><AppIcon name="add" /></button>
                  </div>
                  <datalist id="project-tech-stack-options">
                    {techStackOptions.map((tech) => (
                      <option key={tech} value={tech} />
                    ))}
                  </datalist>
                  {filteredTechOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {filteredTechOptions.map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => addTech(tech)}
                          className="rounded-md bg-surface-container-high px-2 py-1 text-[10px] font-bold uppercase text-on-surface-variant transition-colors hover:text-primary"
                        >
                          + {tech}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.tech_stack.map(tech => (
                      <span key={tech} className="flex items-center gap-1 px-2 py-1 bg-surface-container-high rounded-md text-[10px] uppercase font-bold text-slate-200">
                        {tech} <button type="button" onClick={() => setFormData({...formData, tech_stack: formData.tech_stack.filter(t => t !== tech)})} className="hover:text-error"><AppIcon name="close" className="text-[12px]" /></button>
                      </span>
                    ))}
                  </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </form>
  );
}
