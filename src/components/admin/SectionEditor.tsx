'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

import HeroSection from '@/components/landing/HeroSection';
import TechStackSection from '@/components/landing/TechStackSection';
import ProjectsSection from '@/components/landing/ProjectsSection';
import CertificatesSection from '@/components/landing/CertificatesSection';
import ContactSection from '@/components/landing/ContactSection';
import CustomBuilderSection from '@/components/landing/CustomBuilderSection';
import WidgetEditor from '@/components/admin/WidgetEditor';
import AppIcon from '@/components/ui/AppIcon';

interface Section {
  id: string;
  label: string;
  sort_order: number;
  visible: number;
  config?: string;
}

interface LandingData {
  profile: any;
  techStack: any[];
  projects: any[];
  certificates: any[];
}

function SortableItem({ section, onToggleVisibility, data, isActiveEditor, setIsActiveEditor, updateSectionConfig }: { 
  section: Section, 
  onToggleVisibility: (id: string) => void, 
  data: LandingData,
  isActiveEditor: boolean,
  setIsActiveEditor: (id: string | null) => void,
  updateSectionConfig: (id: string, config: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const renderPreview = () => {
    if (section.id.startsWith('custom-builder')) {
      return <CustomBuilderSection encodedConfig={section.config || '[]'} />;
    }
    switch(section.id) {
      case 'hero': return <HeroSection profile={data.profile} />;
      case 'tech-stack': return <div className="py-8 bg-surface"><TechStackSection techStack={data.techStack} /></div>;
      case 'projects': return <div className="py-8 bg-surface"><ProjectsSection projects={data.projects} /></div>;
      case 'certificates': return <div className="py-8 bg-surface"><CertificatesSection certificates={data.certificates} /></div>;
      case 'contact': return <div className="py-8 bg-surface"><ContactSection profile={data.profile} /></div>;
      default: return null;
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group bg-surface-container-lowest rounded-3xl overflow-hidden ring-1 ring-outline-variant/20 transition-all ${isDragging ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02] opacity-80' : 'hover:ring-primary/50'}`}
    >
      {/* Editor Controls Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-black/72 z-20 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 bg-surface/80 backdrop-blur-md rounded-xl hover:bg-surface text-on-surface flex items-center shadow-lg">
            <AppIcon name="drag" />
          </div>
          <span className="px-4 py-2 bg-surface/80 backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg text-primary">{section.label}</span>
        </div>
        <div className="flex gap-2">
          {section.id.startsWith('custom-builder') && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsActiveEditor(isActiveEditor ? null : section.id); }}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-lg transition-all ${isActiveEditor ? 'bg-secondary/90 text-on-secondary hover:bg-secondary' : 'bg-surface-container-highest/90 text-on-surface hover:bg-surface-container-highest'} mr-2`}
            >
              {isActiveEditor ? 'Close Builder' : 'Edit Widgets'}
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(section.id); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-lg transition-all ${section.visible ? 'bg-primary/90 text-on-primary hover:bg-primary' : 'bg-surface-container-highest/90 text-on-surface hover:bg-surface-container-highest'}`}
          >
            {section.visible ? 'Visible' : 'Hidden'}
          </button>
        </div>
      </div>

      {/* Hidden Overlay */}
      {!section.visible && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
           <div className="px-6 py-3 rounded-full bg-surface-container-high/80 text-on-surface-variant font-bold text-sm tracking-widest uppercase flex items-center gap-2">
             <AppIcon name="eyeOff" className="text-sm" /> Section Hidden
           </div>
        </div>
      )}

      {/* Scaled Preview */}
      <div className={`pointer-events-none origin-top-left transition-all ${isActiveEditor ? 'mb-8' : ''}`} style={{ zoom: isActiveEditor ? 1 : 0.6 }}>
        {renderPreview()}
      </div>

      {isActiveEditor && (
        <div className="px-8 pb-8 relative z-30">
          <WidgetEditor 
            widgets={JSON.parse(section.config || '[]')} 
            onChange={(newWidgets) => updateSectionConfig(section.id, JSON.stringify(newWidgets))} 
          />
        </div>
      )}
    </div>
  );
}

export default function SectionsEditor({ data }: { data?: LandingData }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeBuilderId, setActiveBuilderId] = useState<string | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetch('/api/sections')
      .then(res => res.json())
      .then(data => {
        setSections(data);
        setLoading(false);
      });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleVisibility = (id: string) => {
    setSections(items => items.map(i => i.id === id ? { ...i, visible: i.visible ? 0 : 1 } : i));
  };

  const updateSectionConfig = (id: string, config: string) => {
    setSections(items => items.map(i => i.id === id ? { ...i, config } : i));
  };

  const addCustomSection = () => {
    const id = `custom-builder-${Date.now()}`;
    setSections(items => [...items, { id, label: 'Custom Block', visible: 1, sort_order: items.length, config: '[]' }]);
    setActiveBuilderId(id);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const addWidgetToActive = (type: string) => {
    if (!activeBuilderId) return;
    setSections(items => items.map(i => {
      if (i.id !== activeBuilderId) return i;
      const widgets = JSON.parse(i.config || '[]');
      let content = {};
      if (type === 'heading') content = { text: 'New Heading' };
      if (type === 'text') content = { html: 'Your text here...' };
      if (type === 'image') content = { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' };
      if (type === 'button') content = { text: 'Click Me', url: '#' };
      if (type === 'spacer') content = { height: 64 };
      widgets.push({ id: `w-${Date.now()}`, type, content });
      return { ...i, config: JSON.stringify(widgets) };
    }));
  };

  const saveLayout = async () => {
    setSaving(true);
    const apiData = sections.map((s, idx) => ({ id: s.id, label: s.label, sort_order: idx, visible: s.visible, config: s.config }));
    
    const res = await fetch('/api/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData),
    });

    if (res.ok) {
      toast.success('Layout saved successfully');
      router.refresh();
    } else {
      toast.error('Failed to save layout');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading layout data...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8 animate-fade-in relative items-start">
      {/* Main Preview Editor */}
      <div className="xl:col-span-3 space-y-8 bg-surface p-4 sm:p-8 rounded-3xl ring-1 ring-outline-variant/10 shadow-2xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-headline text-2xl font-bold border-l-4 border-primary pl-4">Visual Layout Editor</h3>
            <p className="text-on-surface-variant text-sm mt-2">Hover over a section to reveal drag handles. Drag to reorder your live landing page.</p>
          </div>
          <button 
            onClick={addCustomSection}
            className="flex items-center justify-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform w-full sm:w-auto"
          >
            <AppIcon name="addBox" /> Add Custom Block
          </button>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((section) => (
                <SortableItem 
                  key={section.id} 
                  section={section} 
                  onToggleVisibility={toggleVisibility} 
                  data={data!} 
                  isActiveEditor={activeBuilderId === section.id}
                  setIsActiveEditor={setActiveBuilderId}
                  updateSectionConfig={updateSectionConfig}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Right Sidebar Controls (Sticky) */}
      <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-24">
        
        {/* ELEMENTS CATALOG (Shown only when editing a custom builder) */}
        <div className={`transition-all duration-300 ${activeBuilderId ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none hidden'}`}>
           <div className="bg-surface-container-low p-6 rounded-3xl ring-1 ring-outline-variant/10 space-y-4 ring-primary shadow-[0_0_30px_rgba(79,70,229,0.2)]">
             <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                <h4 className="font-bold font-headline text-primary">Elements Widget</h4>
                <button onClick={() => setActiveBuilderId(null)} className="text-on-surface-variant hover:text-on-surface">
                   <AppIcon name="close" className="text-sm" />
                </button>
             </div>
             <p className="text-xs text-on-surface-variant">Click to add to your active custom block.</p>
             <div className="grid grid-cols-2 gap-3">
               {[
                 { type: 'heading', icon: 'title', label: 'Heading' },
                 { type: 'text', icon: 'notes', label: 'Text Editor' },
                 { type: 'image', icon: 'image', label: 'Image' },
                 { type: 'button', icon: 'button', label: 'Button' },
                 { type: 'spacer', icon: 'spacer', label: 'Spacer' },
               ].map(widget => (
                 <button 
                   key={widget.type}
                   onClick={() => addWidgetToActive(widget.type)}
                   className="bg-surface-container-highest flex flex-col items-center justify-center p-4 rounded-xl gap-2 text-on-surface hover:bg-primary/20 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
                 >
                   <AppIcon name={widget.icon} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{widget.label}</span>
                 </button>
               ))}
             </div>
           </div>
        </div>

        {/* DEFAULT SIDEBAR CONTROLS */}
        <div className={`space-y-6 transition-all duration-300 ${activeBuilderId ? 'opacity-0 hidden' : 'opacity-100'}`}>
          <div className="bg-surface-container-low p-6 rounded-3xl ring-1 ring-outline-variant/10 space-y-6">
             <h4 className="font-bold font-headline border-b border-outline-variant/10 pb-4">Publish Changes</h4>
             <p className="text-xs text-on-surface-variant">Changes made in the visual editor are not live until you save them.</p>
             
             <button 
               onClick={saveLayout}
               disabled={saving}
               className="w-full indigo-gradient-bg text-on-primary py-4 rounded-xl font-headline font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
               {saving ? <span className="loading loading-spinner loading-sm"></span> : <AppIcon name="publish" />}
               Publish Layout
             </button>
          </div>

          <div className="bg-surface-container-low p-6 rounded-3xl ring-1 ring-outline-variant/10 space-y-4">
             <h4 className="font-bold font-headline text-sm uppercase tracking-widest text-on-surface-variant text-center border-b border-outline-variant/10 pb-4">Active Outline</h4>
             <div className="flex flex-col gap-2">
               {sections.map(s => (
                  <div key={s.id} className="flex items-center gap-3 text-xs p-2 rounded-lg bg-surface-container-highest">
                     <div className={`w-2 h-2 rounded-full ${s.visible ? 'bg-green-400' : 'bg-slate-600'}`}></div>
                     <span className={!s.visible ? 'line-through text-on-surface-variant text-ellipsis overflow-hidden whitespace-nowrap' : 'text-ellipsis overflow-hidden whitespace-nowrap'}>{s.label}</span>
                  </div>
               ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
