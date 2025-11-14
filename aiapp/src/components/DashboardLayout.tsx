'use client';

import { useState, useEffect, ReactNode, lazy, Suspense } from 'react';
import { SectionType } from '@/types/navigation';
import Sidebar from './Sidebar';
import { ErrorBoundary } from './ErrorBoundary';
import LoadingSpinner, { CardSkeleton } from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface DashboardLayoutProps {
  children?: ReactNode;
  /** Whether to render sections internally (true) or use children (false) */
  renderSections?: boolean;
}

// Lazy load section components for better performance
const HomeSection = lazy(() => import('./sections/HomeSection'));
const CoachesSection = lazy(() => import('./sections/CoachesSection'));
const SocialSection = lazy(() => import('./sections/SocialSection'));
const AnalyzeSection = lazy(() => import('./sections/AnalyzeSection'));
const BacktestSection = lazy(() => import('./sections/BacktestSection'));
const RiskSection = lazy(() => import('./sections/RiskSection'));
const SettingsSection = lazy(() => import('./sections/SettingsSection'));

// Map of keyboard shortcuts to sections
const SECTION_SHORTCUTS: Record<string, SectionType> = {
  '1': 'home',
  '2': 'coaches',
  '3': 'social',
  '4': 'analyze',
  '5': 'backtest',
  '6': 'risk',
  '7': 'settings',
};

/**
 * Section error fallback component
 */
function SectionErrorFallback({ 
  sectionName, 
  error, 
  onRetry 
}: { 
  sectionName: string; 
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div className="p-6">
      <ErrorMessage
        error={error}
        title={`${sectionName} Section Error`}
        onRetry={onRetry}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    </div>
  );
}

/**
 * Section loading fallback component
 */
function SectionLoadingFallback() {
  return (
    <div className="p-6">
      <CardSkeleton />
    </div>
  );
}

/**
 * Render a section wrapped with error boundary and suspense
 */
function SectionWrapper({ 
  section, 
  children 
}: { 
  section: SectionType; 
  children: ReactNode;
}) {
  const [errorKey, setErrorKey] = useState(0);
  
  const handleRetry = () => {
    // Reset error boundary by changing key
    setErrorKey(prev => prev + 1);
  };
  
  const sectionNames: Record<SectionType, string> = {
    home: 'Home',
    coaches: 'Coaches',
    social: 'Social',
    analyze: 'Analyze',
    backtest: 'Backtest',
    risk: 'Risk Management',
    settings: 'Settings',
  };
  
  return (
    <ErrorBoundary
      key={errorKey}
      fallback={
        <SectionErrorFallback
          sectionName={sectionNames[section]}
          error={new Error('Section failed to load')}
          onRetry={handleRetry}
        />
      }
      onError={(error, errorInfo) => {
        console.error(`[${sectionNames[section]} Section] Error:`, error, errorInfo);
      }}
    >
      <Suspense fallback={<SectionLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Main dashboard layout component with sidebar navigation
 * Manages active section state and responsive behavior
 * Supports keyboard shortcuts: Alt+1-7 for section navigation, Escape to close mobile sidebar
 */
export default function DashboardLayout({ 
  children, 
  renderSections = false 
}: DashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted flag to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect mobile breakpoint (768px)
  useEffect(() => {
    if (!mounted) return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  // Load active section from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    
    const savedState = localStorage.getItem('dashboard_state');
    if (savedState) {
      try {
        const { activeSection: saved } = JSON.parse(savedState);
        if (saved) {
          setActiveSection(saved);
        }
      } catch (error) {
        console.error('Failed to load dashboard state:', error);
      }
    }
  }, [mounted]);

  // Save active section to localStorage when it changes
  useEffect(() => {
    if (!mounted) return;
    
    const state = {
      activeSection,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('dashboard_state', JSON.stringify(state));
  }, [activeSection, mounted]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+1 through Alt+7 for section navigation
      if (e.altKey && SECTION_SHORTCUTS[e.key]) {
        e.preventDefault();
        const section = SECTION_SHORTCUTS[e.key];
        handleSectionChange(section);
      }

      // Escape key to close mobile sidebar
      if (e.key === 'Escape' && isMobile && !sidebarCollapsed) {
        e.preventDefault();
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, sidebarCollapsed]);

  const handleSectionChange = (section: SectionType) => {
    setActiveSection(section);
    // Auto-close sidebar on mobile after selection
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  /**
   * Render the active section component
   */
  const renderActiveSection = () => {
    if (!renderSections) {
      return children;
    }

    switch (activeSection) {
      case 'home':
        return (
          <SectionWrapper section="home">
            <HomeSection />
          </SectionWrapper>
        );
      
      case 'coaches':
        return (
          <SectionWrapper section="coaches">
            <CoachesSection />
          </SectionWrapper>
        );
      
      case 'social':
        return (
          <SectionWrapper section="social">
            <SocialSection />
          </SectionWrapper>
        );
      
      case 'analyze':
        return (
          <SectionWrapper section="analyze">
            <AnalyzeSection />
          </SectionWrapper>
        );
      
      case 'backtest':
        return (
          <SectionWrapper section="backtest">
            <BacktestSection />
          </SectionWrapper>
        );
      
      case 'risk':
        return (
          <SectionWrapper section="risk">
            <RiskSection />
          </SectionWrapper>
        );
      
      case 'settings':
        return (
          <SectionWrapper section="settings">
            <SettingsSection />
          </SectionWrapper>
        );
      
      default:
        return (
          <div className="p-6">
            <ErrorMessage
              error={`Unknown section: ${activeSection}`}
              variant="compact"
            />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-8">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
}
