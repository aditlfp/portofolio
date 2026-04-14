import React, { useState } from 'react';
import AppIcon from '@/components/ui/AppIcon';

// This is the inline widget editor shown when a CustomBuilderSection is active in the layout editor.
export default function WidgetEditor({ 
  widgets, 
  onChange 
}: { 
  widgets: any[], 
  onChange: (widgets: any[]) => void 
}) {
  const updateWidget = (id: string, newContent: any) => {
    onChange(widgets.map(w => w.id === id ? { ...w, content: newContent } : w));
  };

  const removeWidget = (id: string) => {
    onChange(widgets.filter(w => w.id !== id));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-outline-variant/10 mt-8">
      <h4 className="text-secondary font-bold font-headline uppercase tracking-widest text-xs mb-4">Editing Custom Section Widgets</h4>
      {widgets.length === 0 && (
        <div className="p-8 border-2 border-dashed border-outline-variant/30 rounded-xl text-center text-on-surface-variant font-body text-sm">
          No widgets yet. Click an Element on the right sidebar to add one.
        </div>
      )}
      {widgets.map((w, index) => (
        <div key={w.id} className="p-4 bg-surface-container rounded-xl ring-1 ring-outline-variant/20 relative group">
        <div className="absolute top-2 right-2">
            <button onClick={() => removeWidget(w.id)} className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors">
              <AppIcon name="trash" className="text-sm" />
            </button>
          </div>
          
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{w.type}</div>
          
          {w.type === 'heading' && (
            <input 
              value={w.content.text} 
              onChange={e => updateWidget(w.id, { ...w.content, text: e.target.value })}
              className="w-full bg-surface-container-highest p-3 rounded-lg text-xl font-bold font-headline outline-none focus:ring-1 focus:ring-primary"
            />
          )}

          {w.type === 'text' && (
            <textarea 
              value={w.content.html} 
              onChange={e => updateWidget(w.id, { ...w.content, html: e.target.value })}
              rows={4}
              className="w-full bg-surface-container-highest p-3 rounded-lg font-body outline-none focus:ring-1 focus:ring-primary"
            />
          )}

          {w.type === 'image' && (
            <input 
              value={w.content.url} 
              placeholder="Image URL"
              onChange={e => updateWidget(w.id, { ...w.content, url: e.target.value })}
              className="w-full bg-surface-container-highest p-3 rounded-lg font-body outline-none focus:ring-1 focus:ring-primary"
            />
          )}

          {w.type === 'button' && (
            <div className="flex gap-2">
              <input 
                value={w.content.text} 
                placeholder="Button Text"
                onChange={e => updateWidget(w.id, { ...w.content, text: e.target.value })}
                className="w-1/2 bg-surface-container-highest p-3 rounded-lg font-body outline-none focus:ring-1 focus:ring-primary"
              />
              <input 
                value={w.content.url} 
                placeholder="Button URL"
                onChange={e => updateWidget(w.id, { ...w.content, url: e.target.value })}
                className="w-1/2 bg-surface-container-highest p-3 rounded-lg font-body outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {w.type === 'spacer' && (
            <input 
              type="number"
              value={w.content.height} 
              onChange={e => updateWidget(w.id, { ...w.content, height: parseInt(e.target.value) || 64 })}
              className="w-full bg-surface-container-highest p-3 rounded-lg font-body outline-none focus:ring-1 focus:ring-primary"
            />
          )}
        </div>
      ))}
    </div>
  );
}
