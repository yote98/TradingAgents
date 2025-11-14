'use client';

import { SectionType } from '@/types/navigation';

interface NavItemProps {
  section: SectionType;
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}

/**
 * Individual navigation item component
 * Displays icon and label with active state highlighting
 * Supports keyboard navigation: Tab to focus, Enter/Space to activate
 */
export default function NavItem({
  section,
  label,
  icon,
  active,
  onClick,
  collapsed,
}: NavItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enter or Space key activates the item
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        w-full flex items-center space-x-3 px-4 py-3 rounded-lg
        min-h-[44px]
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800
        ${
          active
            ? 'bg-blue-600 text-white border-l-4 border-blue-400 shadow-lg'
            : 'text-gray-300 hover:bg-white/10 hover:text-gray-100 active:bg-white/20'
        }
      `}
      aria-label={`Navigate to ${label} section`}
      aria-current={active ? 'page' : undefined}
      type="button"
      tabIndex={0}
    >
      {/* Icon */}
      <span className="text-2xl flex-shrink-0" aria-hidden="true">
        {icon}
      </span>

      {/* Label */}
      {!collapsed && (
        <span className="font-medium text-left flex-1">{label}</span>
      )}

      {/* Active indicator */}
      {active && !collapsed && (
        <span className="w-2 h-2 bg-white rounded-full" aria-hidden="true" />
      )}
    </button>
  );
}
