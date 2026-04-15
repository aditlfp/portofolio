import { countProjects, countCertificates, countUnreadContacts } from '@/lib/db';
import React from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { connection } from 'next/server';

async function getStats() {
  const [projects, certificates, unreadMessages] = await Promise.all([
    countProjects(),
    countCertificates(),
    countUnreadContacts(),
  ]);

  return {
    projects,
    certificates,
    unreadMessages,
  };
}

export default async function AdminDashboard() {
  await connection();
  const stats = await getStats();

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Top Stats Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low flex flex-col justify-between h-44 sm:h-48 group hover:bg-surface-container-high transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-label text-primary uppercase tracking-widest">Active Projects</span>
            <AppIcon name="folder" className="text-primary" />
          </div>
          <div className="mt-4">
            <div className="text-4xl font-headline font-bold text-on-surface">{stats.projects}</div>
          </div>
          <p className="text-xs text-on-surface-variant mt-2 font-body">Managed in your inventory.</p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low flex flex-col justify-between h-44 sm:h-48 group hover:bg-surface-container-high transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-label text-secondary uppercase tracking-widest">Certificates</span>
            <AppIcon name="certificate" className="text-secondary" />
          </div>
          <div className="mt-4">
            <div className="text-4xl font-headline font-bold text-on-surface">{stats.certificates}</div>
          </div>
          <p className="text-xs text-secondary font-body">Verified industry credentials.</p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low flex flex-col justify-between h-44 sm:h-48 group hover:bg-surface-container-high transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-label text-tertiary uppercase tracking-widest">Unread Messages</span>
            <AppIcon name="mail" className="text-tertiary" />
          </div>
          <div className="mt-4">
            <div className="text-4xl font-headline font-bold text-on-surface">{stats.unreadMessages}</div>
          </div>
          <p className="text-xs text-on-surface-variant mt-2 font-body">New inquiries from your site.</p>
        </div>
      </section>

      {/* Profile Overview (Read Only) */}
      <section className="bg-surface-container-low p-4 sm:p-8 rounded-3xl space-y-6 ring-1 ring-outline-variant/10">
        <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">System Status</h3>
        <p className="text-on-surface-variant font-body">
          Your portfolio management system is fully operational. All data is securely stored in your local SQLite database. 
          Use the sidebar to manage projects, certifications, and landing page layout.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="p-6 bg-surface-container-high rounded-xl">
             <div className="text-xs font-label text-primary uppercase tracking-widest mb-4">Quick Links</div>
             <ul className="space-y-3">
               <li><a href="/admin/projects" className="text-sm font-body hover:underline flex items-center gap-2"><AppIcon name="add" className="text-sm" /> Create New Project</a></li>
               <li><a href="/admin/sections" className="text-sm font-body hover:underline flex items-center gap-2"><AppIcon name="layers" className="text-sm" /> Reorder Landing Page</a></li>
             </ul>
          </div>
          <div className="p-6 bg-surface-container-high rounded-xl">
            <div className="text-xs font-label text-secondary uppercase tracking-widest mb-4">Latest Logs</div>
            <p className="text-xs text-on-surface-variant font-body italic">No recent system logs to display.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
