import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      <Sidebar />
      {/* Desktop: offset by sidebar width. Mobile: full width, padded bottom for bottom nav */}
      <main className="flex-1 md:ml-64 min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}