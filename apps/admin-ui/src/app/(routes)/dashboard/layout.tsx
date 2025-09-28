import SidebarWrapper from 'apps/admin-ui/src/shared/sidebar/sidebar';
import React from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full bg-black min-h-screen">
      <aside className="w-[280px] min-w-[250px] max-w-[300px] border-r border-r-slate-900">
        <div className="sticky top-0">
          <SidebarWrapper />
        </div>
      </aside>
      <main className="flex-1">
        <div className="overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
