'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppIcon from '@/components/ui/AppIcon';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      fetch('/api/contact/unread')
        .then(res => res.json())
        .then(data => {
          if (data.count !== undefined) {
            setUnreadCount(data.count);
          }
        })
        .catch(() => {});
    };

    fetchUnread();

    const handleMessagesRead = () => setUnreadCount(0);
    window.addEventListener('messagesRead', handleMessagesRead);
    return () => window.removeEventListener('messagesRead', handleMessagesRead);
  }, [pathname]); // refetch when navigating

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login-aditya');
    router.refresh();
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: 'dashboard', href: '/admin' },
    { id: 'projects', label: 'Projects', icon: 'folder', href: '/admin/projects' },
    { id: 'sections', label: 'Layout Editor', icon: 'layers', href: '/admin/sections' },
    { id: 'certificates', label: 'Certificates', icon: 'certificate', href: '/admin/certificates' },
    { id: 'tech-stack', label: 'Tech Stack', icon: 'terminal', href: '/admin/tech-stack' },
    { id: 'profile', label: 'Profile', icon: 'user', href: '/admin/profile' },
    { id: 'contact', label: 'Messages', icon: 'mail', href: '/admin/contact' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/admin/settings' },
  ];

  return (
    <aside className={`bg-[#1C1B1B] h-screen w-64 fixed left-0 flex flex-col p-4 space-y-2 z-40 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex justify-between items-center mb-8 px-4 py-2">
        <div>
          <h1 className="text-lg font-bold text-slate-100 font-headline">Portfolio Admin</h1>
          <p className="text-slate-500 text-xs font-medium font-body uppercase tracking-wider">Management Suite</p>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-100"
        >
          <AppIcon name="close" />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.id}
              href={item.href}
              className={`px-4 py-3 rounded-lg flex items-center justify-between font-body text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary-container/10 text-primary border-l-4 border-primary' 
                  : 'text-slate-500 hover:bg-[#2A2A2A] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <AppIcon name={item.icon} />
                {item.label}
              </div>
              {item.id === 'contact' && unreadCount > 0 && (
                <div className="bg-error text-on-error w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {unreadCount}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 space-y-4">
        <div className="flex items-center gap-3 px-4 py-4 border-t border-outline-variant/10">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-primary/20">
            <AppIcon name="user" className="text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-on-surface text-sm font-bold">Admin</span>
            <button 
              onClick={handleLogout}
              className="text-slate-600 hover:text-error transition-colors flex items-center gap-1 font-body text-xs uppercase tracking-[0.05em]"
            >
              <AppIcon name="logout" className="text-xs" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
