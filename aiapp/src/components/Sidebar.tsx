'use client';

import { useRef, useEffect } from 'react';
import { SectionType } from '@/types/navigation';
import NavItem from './NavItem';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

interface SidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobile: boolean;
}

/**
 * Navigation sidebar component
 * Displays navigation items and handles collapse/expand functionality
 * Includes mobile overlay and swipe-to-close gesture support
 */
export default function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  isMobile,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);

  // Handle swipe-to-close gesture on mobile
  useEffect(() => {
    if (!isMobile || collapsed) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchCurrentX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchCurrentX.current = e.touches[0].clientX;
      const diff = touchCurrentX.current - touchStartX.current;

      // Only allow swipe left (negative diff)
      if (diff < 0) {
        const translateX = Math.max(diff, -256); // Max swipe distance
        sidebar.style.transform = `translateX(${translateX}px)`;
      }
    };

    const handleTouchEnd = () => {
      const diff = touchCurrentX.current - touchStartX.current;
      
      // If swiped more than 100px to the left, close sidebar
      if (diff < -100) {
        onToggleCollapse();
      }
      
      // Reset transform
      if (sidebar) {
        sidebar.style.transform = '';
      }
    };

    sidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
    sidebar.addEventListener('touchmove', handleTouchMove, { passive: true });
    sidebar.addEventListener('touchend', handleTouchEnd);

    return () => {
      sidebar.removeEventListener('touchstart', handleTouchStart);
      sidebar.removeEventListener('touchmove', handleTouchMove);
      sidebar.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, collapsed, onToggleCollapse]);
  const navigationItems: Array<{
    section: SectionType;
    label: string;
    icon: string;
  }> = [
    { section: 'home', label: 'Home', icon: '🏠' },
    { section: 'coaches', label: 'Coaches', icon: '👥' },
    { section: 'social', label: 'Social', icon: '💬' },
    { section: 'analyze', label: 'Analyze', icon: '📊' },
    { section: 'backtest', label: 'Backtest', icon: '📈' },
    { section: 'risk', label: 'Risk', icon: '⚠️' },
    { section: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile overlay background */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onToggleCollapse}
          aria-hidden="true"
          role="presentation"
        />
      )}

      {/* Sidebar container */}
      <aside
        ref={sidebarRef}
        className={`
          fixed md:relative
          top-0 left-0 h-full
          bg-gradient-to-b from-slate-800 to-slate-900
          text-white
          transition-all duration-300 ease-in-out
          z-50
          ${isMobile ? (collapsed ? '-translate-x-full' : 'translate-x-0 w-64') : 'w-64'}
          ${!isMobile && 'shadow-lg'}
        `}
        aria-label="Main navigation"
        aria-hidden={isMobile && collapsed}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" aria-hidden="true">📈</span>
            <h2 className="text-xl font-bold">C1 Dashboard</h2>
          </div>
          {isMobile && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close sidebar"
              type="button"
            >
              <span className="text-xl" aria-hidden="true">✕</span>
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-3">
          {navigationItems.map((item) => (
            <NavItem
              key={item.section}
              section={item.section}
              label={item.label}
              icon={item.icon}
              active={activeSection === item.section}
              onClick={() => onSectionChange(item.section)}
              collapsed={false}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-400">
              TradingAgents v1.0
            </div>
            <KeyboardShortcutsHelp />
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      {isMobile && collapsed && (
        <button
          onClick={onToggleCollapse}
          className="fixed top-4 left-4 z-40 p-3 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open sidebar"
          aria-expanded="false"
          type="button"
        >
          <span className="text-xl" aria-hidden="true">☰</span>
        </button>
      )}
    </>
  );
}
