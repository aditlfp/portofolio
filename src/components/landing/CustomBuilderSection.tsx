import React from 'react';
import Image from 'next/image';

interface Widget {
  id: string;
  type: string;
  content: any; // specific to widget type
}

export default function CustomBuilderSection({ encodedConfig }: { encodedConfig: unknown }) {
  let widgets: Widget[] = [];
  try {
    widgets = Array.isArray(encodedConfig)
      ? (encodedConfig as Widget[])
      : JSON.parse((encodedConfig as string) || '[]');
  } catch {}

  if (widgets.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="flex flex-col">
        {widgets.map(w => {
          switch (w.type) {
            case 'heading':
              return <h2 key={w.id} className="text-4xl md:text-5xl font-headline font-bold text-on-surface my-4">{w.content.text}</h2>;
            case 'text':
              return <p key={w.id} className="text-lg text-on-surface-variant font-body my-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: w.content.html || '' }} />;
            case 'image':
              return (
                <div key={w.id} className="w-full relative aspect-video rounded-3xl overflow-hidden my-6 ring-1 ring-outline-variant/10 shadow-2xl">
                  <Image src={w.content.url || 'https://via.placeholder.com/800x400'} alt="Custom element" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
                </div>
              );
            case 'button':
              return (
                <div key={w.id} className="my-6">
                  <a href={w.content.url || '#'} className="inline-block indigo-gradient-bg text-on-primary px-8 py-4 rounded-xl font-bold font-headline transition-all hover:scale-105 shadow-xl">
                    {w.content.text || 'Click Here'}
                  </a>
                </div>
              );
            case 'spacer':
              return <div key={w.id} style={{ height: `${w.content.height || 64}px` }} aria-hidden="true" />;
            default:
              return null;
          }
        })}
      </div>
    </section>
  );
}
