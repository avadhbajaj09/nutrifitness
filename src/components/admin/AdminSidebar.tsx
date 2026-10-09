'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Store,
  Package,
  MapPin,
  Receipt,
  Truck,
  ExternalLink,
  LogOut,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab?: 'pos' | 'catalog' | 'sales' | 'fulfillment' | 'locations';
  onSelectTab?: (tab: 'pos' | 'catalog' | 'sales' | 'fulfillment') => void;
  posCount?: number;
  catalogCount?: number;
  salesCount?: number;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  posCount,
  catalogCount,
  salesCount,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isLocationPage = pathname?.startsWith('/admin/products');

  const navItems = [
    {
      id: 'pos',
      label: 'POS Register',
      icon: Store,
      badge: posCount,
      href: '/wp-admin?tab=pos',
      isRoute: false,
    },
    {
      id: 'catalog',
      label: 'Products Catalog',
      icon: Package,
      badge: catalogCount,
      href: '/wp-admin?tab=catalog',
      isRoute: false,
    },
    {
      id: 'locations',
      label: 'Inventory & Locations',
      icon: MapPin,
      badge: undefined,
      href: '/admin/products',
      isRoute: true,
    },
    {
      id: 'sales',
      label: 'Orders & Sales',
      icon: Receipt,
      badge: salesCount,
      href: '/wp-admin?tab=sales',
      isRoute: false,
    },
    {
      id: 'fulfillment',
      label: 'Fulfillment Queue',
      icon: Truck,
      badge: undefined,
      href: '/wp-admin?tab=fulfillment',
      isRoute: false,
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.isRoute) {
      router.push(item.href);
    } else {
      if (pathname?.startsWith('/wp-admin') && onSelectTab) {
        onSelectTab(item.id as 'pos' | 'catalog' | 'sales' | 'fulfillment');
      } else {
        router.push(item.href);
      }
    }
  };

  const isItemActive = (id: string) => {
    if (isLocationPage) {
      return id === 'locations';
    }
    return activeTab === id;
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('nutrifitness_admin_auth');
    } catch {}
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Top Header / Brand */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-md shrink-0">
            NF
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white tracking-tight truncate">
              NutriFitness Admin
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[11px] text-slate-400 font-medium truncate">
                Geneva Store Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Management
        </div>

        {navItems.map((item) => {
          const active = isItemActive(item.id);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                active
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Online Store
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate">View Public Store</span>
          </div>
          <span className="text-[10px] text-slate-500">↗</span>
        </a>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="min-w-0">
            <p className="text-white font-bold truncate">Admin Manager</p>
            <p className="text-[11px] text-slate-500 truncate">Marco &amp; Omar Team</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
