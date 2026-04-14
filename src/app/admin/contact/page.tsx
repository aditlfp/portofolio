'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import AppIcon from '@/components/ui/AppIcon';

interface Contact {
  id: number;
  name: string;
  email: string;
  interest: string;
  message: string;
  read: number;
  created_at: string;
}

export default function ContactAdminPage() {
  const [messages, setMessages] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchMessages = () => {
    fetch('/api/contact')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();
    // Mark all as read and clear sidebar bubble
    fetch('/api/contact', { method: 'PATCH' }).then(() => {
      window.dispatchEvent(new Event('messagesRead'));
    });
  }, []);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Message deleted');
      setMessages(prev => prev.filter(m => m.id !== id));
    } else {
      toast.error('Failed to delete message');
    }
    setConfirmId(null);
  };

  return (
    <div className="py-8 space-y-8 animate-fade-in">
      <ConfirmDialog
        isOpen={confirmId !== null}
        title="Delete Message"
        message="Are you sure you want to permanently delete this message? This cannot be undone."
        onConfirm={() => confirmId !== null && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-headline text-xl font-bold border-l-4 border-primary pl-4">Inquiry Inbox</h3>
          <p className="text-on-surface-variant text-sm mt-1">Review messages sent from your website&apos;s contact form.</p>
        </div>
        <div className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-widest">
          {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {messages.map((msg) => (
          <div key={`card-${msg.id}`} className="bg-surface-container-low rounded-2xl p-4 ring-1 ring-outline-variant/10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{msg.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{msg.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase">{msg.interest}</span>
                  {!msg.read && <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase">Unread</span>}
                </div>
              </div>
              <button
                onClick={() => setConfirmId(msg.id)}
                className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-error shrink-0"
                title="Delete message"
              >
                <AppIcon name="trash" className="text-lg" />
              </button>
            </div>
            <p className="mt-3 text-[11px] text-on-surface-variant">{new Date(msg.created_at).toLocaleString()}</p>
            <div className="mt-3 rounded-xl bg-surface-container-lowest p-3 text-sm text-on-surface leading-relaxed">
              {msg.message}
            </div>
            <a
              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.interest || 'Your inquiry')}`}
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-widest"
            >
              <AppIcon name="reply" className="text-sm" />
              Reply
            </a>
          </div>
        ))}
        {messages.length === 0 && !loading && (
          <div className="px-4 py-10 text-center rounded-2xl bg-surface-container-low ring-1 ring-outline-variant/10">
            <AppIcon name="inbox" className="mb-3 block text-4xl text-on-surface-variant" />
            <p className="text-on-surface-variant italic font-body">Your inbox is empty.</p>
          </div>
        )}
      </div>

      <div className="hidden md:block bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl ring-1 ring-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high">
              <th className="px-8 py-5 text-xs font-label text-on-surface-variant uppercase tracking-widest">Sender</th>
              <th className="px-8 py-5 text-xs font-label text-on-surface-variant uppercase tracking-widest">Interest</th>
              <th className="px-8 py-5 text-xs font-label text-on-surface-variant uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-xs font-label text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {messages.map(msg => (
              <React.Fragment key={msg.id}>
                <tr
                  className="hover:bg-surface-container-high transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />}
                      <div>
                        <div className="text-sm font-bold text-on-surface">{msg.name}</div>
                        <div className="text-xs text-on-surface-variant font-body">{msg.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-label font-bold uppercase">
                      {msg.interest}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-on-surface-variant font-body">
                    {new Date(msg.created_at).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`mailto:${msg.email}`}
                        onClick={e => e.stopPropagation()}
                        className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant hover:text-primary"
                        title="Reply via email"
                      >
                        <AppIcon name="reply" className="text-lg" />
                      </a>
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmId(msg.id); }}
                        className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant hover:text-error"
                        title="Delete message"
                      >
                        <AppIcon name="trash" className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded message row */}
                {expandedId === msg.id && (
                  <tr className="bg-surface-container-lowest">
                    <td colSpan={4} className="px-8 py-6">
                      <div className="max-w-2xl space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Message</p>
                        <p className="text-sm font-body text-on-surface leading-relaxed bg-surface-container p-4 rounded-xl italic">
                          &quot;{msg.message}&quot;
                        </p>
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.interest || 'Your inquiry')}`}
                          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                        >
                          <AppIcon name="reply" className="text-sm" />
                          Reply to {msg.name}
                        </a>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {messages.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center">
                  <AppIcon name="inbox" className="mb-3 block text-4xl text-on-surface-variant" />
                  <p className="text-on-surface-variant italic font-body">Your inbox is empty.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
