'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';

export default function ToastContainer() {
  const { toasts } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className="bg-[#181818] border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 pointer-events-auto animate-in slide-in-from-bottom duration-300"
          role="alert"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F80404]/20 border border-[#F80404]/40 flex items-center justify-center shrink-0 text-[#F80404]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black uppercase text-white font-heading tracking-wide">
              {toast.title}
            </h4>
            <p className="text-xs text-white/70 truncate">
              {toast.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
