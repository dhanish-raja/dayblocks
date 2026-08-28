import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarDays, Search, LayoutDashboard, BookOpen,
  BarChart3, Layers, Sun, Moon, LogOut, Menu, X, Blocks
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authApi } from '@/api';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', label: 'Today', icon: LayoutDashboard, end: true },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/templates', label: 'Templates', icon: Layers },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(); } catch {}
    logout();
    navigate('/login');
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-200 dark:border-[#2a3347]">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Blocks className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-slate-900 dark:text-slate-100 text-[15px]">DayBlocks</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'sidebar-link-active')
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1 border-t border-slate-200 dark:border-[#2a3347] pt-3">
        <button
          onClick={toggleTheme}
          className="sidebar-link w-full"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-icon p-1.5 text-slate-400 hover:text-red-500"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 h-screen bg-white dark:bg-[#0f1117] border-r border-slate-200 dark:border-[#2a3347] fixed left-0 top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 btn-icon bg-white dark:bg-[#1e2535] shadow-card border border-slate-200 dark:border-[#2a3347]"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-white dark:bg-[#0f1117] border-r border-slate-200 dark:border-[#2a3347] flex flex-col animate-slide-in-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 btn-icon"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
