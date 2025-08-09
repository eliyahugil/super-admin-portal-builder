import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

type NavItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  href: string;
  active?: boolean;
  onClick?: () => void;
};

type SidebarProps = {
  items: NavItem[];
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  onNavigate?: (href: string) => void;
};

export default function Sidebar({ items, collapsed, onCollapseToggle, onNavigate }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'h-full border-e border-border bg-card text-card-foreground',
        collapsed ? 'w-[64px]' : 'w-[240px]',
        'transition-[width] duration-200 ease-out'
      )}
      data-testid="sidebar"
      aria-label="תפריט צד"
    >
      {/* אזור עליון */}
      <div className="hidden sm:flex items-center justify-between p-3 border-b border-border">
        <div className={clsx('text-sm font-medium truncate', collapsed && 'opacity-0 pointer-events-none')}>
          ניווט
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={onCollapseToggle}
          aria-label={collapsed ? 'הרחב תפריט' : 'צמצם תפריט'}
          data-testid="sidebar-collapse"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </Button>
      </div>

      <nav className="p-2">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = !!item.active;
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="default"
                  className={clsx(
                    'w-full justify-start rounded-2xl hover:bg-accent hover:text-accent-foreground transition-colors',
                    collapsed ? 'px-2' : 'px-3',
                    isActive && 'bg-accent text-accent-foreground',
                    // פס דק בצד (RTL: בצד ימין)
                    isActive && 'relative',
                  )}
                  onClick={() => (item.onClick ? item.onClick() : onNavigate?.(item.href))}
                  data-testid={`nav-${item.id}`}
                  aria-current={isActive ? 'page' : undefined}
                  // Tooltip פשוט כשהתפריט מכווץ
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                >
                  {/* RTL spacing: האייקון לפני הטקסט = inline-start */}
                  {item.icon && <span className="me-2">{item.icon}</span>}
                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 -translate-y-1/2 end-0 w-[4px] h-6 rounded-s bg-primary"
                    />
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
