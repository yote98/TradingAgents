/**
 * DashboardLayout Example Usage
 * 
 * This file demonstrates how to use the DashboardLayout component
 * with different sections and content.
 */

'use client';

import DashboardLayout from './DashboardLayout';

/**
 * Example: Basic usage with simple content
 */
export function BasicExample() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome to C1 Dashboard</h1>
        <p className="text-gray-600">
          Use the sidebar to navigate between different sections.
        </p>
      </div>
    </DashboardLayout>
  );
}

/**
 * Example: With section-specific content
 */
export function SectionExample() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* This content would be dynamically rendered based on activeSection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Home Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">24</div>
              <div className="text-sm text-gray-600">Total Analyses</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">65%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">+2.3%</div>
              <div className="text-sm text-gray-600">Recent Return</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Example: Mobile-optimized content
 */
export function MobileExample() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        
        {/* Mobile-friendly cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Recent Activity</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">📊</span>
                <span>AAPL analysis completed</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">👥</span>
                <span>New coach plan available</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Example: Testing responsive behavior
 */
export function ResponsiveExample() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            📱 Responsive Testing
          </h3>
          <p className="text-sm text-yellow-700">
            Resize your browser window to see the layout adapt:
          </p>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1">
            <li>• Desktop (≥768px): Sidebar always visible</li>
            <li>• Mobile (&lt;768px): Sidebar as overlay with menu button</li>
            <li>• Tap outside sidebar to close on mobile</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Content Area</h2>
          <p className="text-gray-600">
            This content area is responsive and adjusts its padding based on screen size.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Example: With loading state
 */
export function LoadingExample() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Example: Accessibility demonstration
 */
export function AccessibilityExample() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            ♿ Accessibility Features
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use Tab key to navigate through sidebar items</li>
            <li>• Press Enter to activate focused item</li>
            <li>• Screen readers announce active section</li>
            <li>• Focus indicators visible on all interactive elements</li>
            <li>• Proper heading hierarchy maintained</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Default export for easy importing
export default BasicExample;
