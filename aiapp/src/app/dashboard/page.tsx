'use client';

import dynamic from 'next/dynamic';

// Dynamically import the DashboardLayout with no SSR to avoid hydration issues
const DashboardLayout = dynamic(
  () => import('../../components/DashboardLayout'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }
);

export default function Dashboard() {
  return <DashboardLayout renderSections={true} />;
}
