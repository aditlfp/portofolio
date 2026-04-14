'use client';

import React from 'react';
import AppIcon from '@/components/ui/AppIcon';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  danger = true,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-surface-container-low rounded-3xl p-8 max-w-sm w-full ring-1 ring-outline-variant/20 shadow-2xl animate-fade-in">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${danger ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
          <AppIcon name={danger ? 'warning' : 'help'} className="text-2xl" />
        </div>
        <h3 className="font-headline text-xl font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-on-surface-variant font-body text-sm mb-8">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all ${danger ? 'bg-error text-on-error hover:bg-error/90' : 'indigo-gradient-bg text-on-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
