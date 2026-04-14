'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppIcon from '@/components/ui/AppIcon';

const interestOptions = ['Product Design', 'Web Development', 'Brand Strategy', 'Consultation'] as const;
type InterestOption = (typeof interestOptions)[number];

interface ContactProfile {
  email?: string | null;
  location?: string | null;
}

export default function ContactSection({ profile }: { profile: ContactProfile | null | undefined }) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    interest: InterestOption;
    message: string;
  }>({
    name: '',
    email: '',
    interest: interestOptions[0],
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const interestRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!interestRef.current) return;
      if (!interestRef.current.contains(event.target as Node)) {
        setIsInterestOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInterestOpen(false);
      }
    };

    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', interest: interestOptions[0], message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="contact">
      <div className="editorial-grid overflow-hidden rounded-[2rem] bg-surface-container/60 shadow-2xl ring-1 ring-outline-variant/20 backdrop-blur-xl">
        <div className="col-span-12 relative flex flex-col justify-between p-6 sm:p-10 text-on-surface lg:col-span-5 bg-white/[0.03] ring-1 ring-white/10">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ring-1 ring-white/15 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
              Available Now
            </span>
            <h2 className="text-3xl sm:text-4xl font-headline font-extrabold leading-tight tracking-tight text-on-surface">
              Let&apos;s build something <span className="text-primary">extraordinary</span> together.
            </h2>
            <p className="font-body leading-relaxed text-on-surface-variant">
              Currently accepting new commissions. Reach out for a free consultation or just to say hi.
            </p>
          </div>

          <div className="mt-10 space-y-3 font-body lg:mt-0">
            <div className="group flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15 transition-colors hover:bg-white/10">
              <div className="rounded-xl bg-white/10 p-2.5 transition-colors group-hover:bg-white/15">
                <AppIcon name="mail" className="text-primary" />
              </div>
              <span className="font-semibold text-on-surface text-sm sm:text-base break-all">{profile?.email || 'hello@executive.design'}</span>
            </div>
            <div className="group flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15 transition-colors hover:bg-white/10">
              <div className="rounded-xl bg-white/10 p-2.5 transition-colors group-hover:bg-white/15">
                <AppIcon name="mapPin" className="text-primary" />
              </div>
              <span className="font-semibold text-on-surface text-sm sm:text-base">{profile?.location || 'San Francisco, CA'}</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-8 bg-white/[0.02] p-5 sm:p-10 lg:col-span-7 ring-1 ring-white/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface/80">Full Name</label>
                <input
                  className="w-full rounded-xl border-none bg-surface-container-low p-4 text-on-surface outline-none ring-1 ring-outline-variant/35 transition-all placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/70"
                  placeholder="John Doe"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface/80">Email Address</label>
                <input
                  className="w-full rounded-xl border-none bg-surface-container-low p-4 text-on-surface outline-none ring-1 ring-outline-variant/35 transition-all placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/70"
                  placeholder="john@example.com"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface/80">Project Interest</label>
              <div className="relative" ref={interestRef}>
                <button
                  type="button"
                  onClick={() => setIsInterestOpen((prev) => !prev)}
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-4 text-left text-on-surface outline-none ring-1 ring-outline-variant/35 transition-all hover:ring-primary/40 focus:ring-2 focus:ring-primary/70"
                >
                  <span className="font-semibold text-on-surface">{formData.interest}</span>
                  <AppIcon name="chevronDown" className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-transform ${isInterestOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`absolute z-30 w-full origin-top rounded-xl border border-outline-variant/25 bg-surface-container p-2 shadow-2xl transition-all duration-200 ${
                    isInterestOpen
                      ? 'mt-2 pointer-events-auto scale-100 opacity-100'
                      : 'pointer-events-none mt-1 scale-95 opacity-0'
                  }`}
                >
                  {interestOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, interest: option });
                        setIsInterestOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        formData.interest === option
                          ? 'bg-primary/16 text-primary'
                          : 'text-on-surface hover:bg-surface-container-highest/70'
                      }`}
                    >
                      <span>{option}</span>
                      {formData.interest === option && <AppIcon name="verified" className="text-sm" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface/80">Message</label>
              <textarea
                className="w-full resize-none rounded-xl border-none bg-surface-container-low p-4 text-on-surface outline-none ring-1 ring-outline-variant/35 transition-all placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/70"
                placeholder="Tell me about your vision..."
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button
              disabled={status === 'loading'}
              className={`flex w-full items-center justify-center gap-3 rounded-xl bg-primary-container py-4 font-headline text-lg font-bold tracking-tight text-on-primary shadow-[0_10px_30px_rgba(79,70,229,0.2)] transition-all hover:brightness-110 hover:shadow-[0_16px_34px_rgba(79,70,229,0.3)] active:scale-[0.98] ${status === 'loading' ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {status === 'loading' ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending...
                </>
              ) : 'Send Message'}
            </button>

            {status === 'success' && <p className="text-emerald-400 text-center font-bold animate-fade-in">Message sent successfully.</p>}
            {status === 'error' && <p className="text-error text-center font-bold animate-fade-in">Error sending message. Please try again.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
