'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState({ theme_mode: 'dark', primary_color: '#c3c0ff' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({
          theme_mode: data.theme_mode || 'dark',
          primary_color: data.primary_color || '#c3c0ff'
        });
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Settings saved! Reloading to apply theme...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error('Failed to save settings');
      }
    } catch (e) {
      toast.error('Error saving settings');
    }
    setSaving(false);
  };

  return (
    <div className="py-8 space-y-8 animate-fade-in max-w-3xl">
       <div>
         <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">Site Settings</h3>
         <p className="text-on-surface-variant text-sm mt-1">Configure your global theme and color preferences.</p>
       </div>

       <div className="bg-surface-container-low rounded-3xl p-4 sm:p-8 ring-1 ring-outline-variant/10 space-y-8">
         
         <div className="space-y-4">
           <h4 className="font-bold font-headline text-lg">Theme Engine</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Mode Toggle */}
             <div className="space-y-3">
               <label className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Default Mode</label>
               <div className="flex gap-4">
                 <button 
                   onClick={() => setSettings(s => ({ ...s, theme_mode: 'dark' }))}
                   className={`flex-1 py-4 rounded-xl font-bold outline-none transition-all ${settings.theme_mode === 'dark' ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80'}`}
                 >
                   Dark Mode
                 </button>
                 <button 
                   onClick={() => setSettings(s => ({ ...s, theme_mode: 'light' }))}
                   className={`flex-1 py-4 rounded-xl font-bold outline-none transition-all ${settings.theme_mode === 'light' ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80'}`}
                 >
                   Light Mode
                 </button>
               </div>
             </div>

             {/* Color Picker */}
             <div className="space-y-3">
               <label className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Primary Brand Color</label>
               <div className="flex items-center gap-4">
                 <input 
                   type="color" 
                   value={settings.primary_color}
                   onChange={e => setSettings(s => ({ ...s, primary_color: e.target.value }))}
                   className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                 />
                 <input 
                   type="text" 
                   value={settings.primary_color}
                   onChange={e => setSettings(s => ({ ...s, primary_color: e.target.value }))}
                   className="flex-1 bg-surface-container-highest text-on-surface p-4 rounded-xl font-mono text-sm border-none focus:ring-1 focus:ring-primary outline-none"
                   placeholder="#HEX"
                 />
               </div>
               <p className="text-xs text-on-surface-variant">The system will automatically calculate optimal hover states and container variants based on this color.</p>
             </div>

           </div>
         </div>

         <div className="border-t border-outline-variant/10 pt-8 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="indigo-gradient-bg text-on-primary px-8 py-3 rounded-xl font-headline font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all w-full sm:w-auto"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
         </div>
       </div>
    </div>
  );
}
