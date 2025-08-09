import React, { useMemo } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { useResponsiveSidebar } from '@/hooks/useResponsiveSidebar';
import { useNavigate, useLocation } from 'react-router-dom';

type AppShellProps = {
  children: React.ReactNode;
  navItems: Array<{ id: string; label: string; icon?: React.ReactNode; href: string }>;
  rightTopbarSlot?: React.ReactNode; // BusinessSwitcher / חיפוש / אייקונים
};

export default function AppShell({ children, navItems, rightTopbarSlot }: AppShellProps) {
  const nav = useNavigate();
  const loc = useLocation();
  const { isMobile, drawerOpen, toggleDrawer, collapsed, toggleCollapsed, closeDrawer } = useResponsiveSidebar();

  const items = useMemo(
    () =>
      navItems.map((it) => ({
        ...it,
        active: loc.pathname === it.href || loc.pathname.startsWith(it.href + '/'),
      })),
    [navItems, loc.pathname]
  );

  return (
    <div className="min-h-dvh w-full bg-background text-foreground" data-testid="app-shell">
      <Topbar onMenuClick={toggleDrawer} rightSlot={rightTopbarSlot} />

      <div className="relative flex">
        {/* Sidebar — דסקטופ/טאבלט */}
        <div className="hidden sm:block">
          <Sidebar
            items={items}
            collapsed={collapsed}
            onCollapseToggle={toggleCollapsed}
            onNavigate={(href) => nav(href)}
          />
        </div>

        {/* Drawer — מובייל */}
        {isMobile && (
          <>
            <div
              className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={closeDrawer}
              aria-hidden="true"
              data-testid="drawer-overlay"
            />
            <div
              className={`fixed z-50 top-14 bottom-0 right-0 w-[78%] max-w-[280px] border-s border-border bg-card transition-transform duration-200 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
              role="dialog"
              aria-modal="true"
              aria-label="תפריט צד"
              data-testid="drawer"
            >
              <Sidebar
                items={items}
                collapsed={false}
                onNavigate={(href) => {
                  nav(href);
                  closeDrawer();
                }}
              />
            </div>
          </>
        )}

        {/* תוכן */}
        <main className="flex-1 min-w-0">
          <div className="px-3 md:px-6 py-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
