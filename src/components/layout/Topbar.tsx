import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

type TopbarProps = {
  onMenuClick: () => void;
  rightSlot?: ReactNode; // BusinessSwitcher / חיפוש / אייקונים
};

export default function Topbar({ onMenuClick, rightSlot }: TopbarProps) {
  return (
    <header
      className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border"
      data-testid="topbar"
      aria-label="סרגל עליון"
    >
      <div className="h-14 px-3 md:px-4 flex items-center gap-2">
        {/* המבורגר במובייל בלבד */}
        <div className="sm:hidden">
          <Button variant="ghost" size="sm" onClick={onMenuClick} aria-label="פתח תפריט צד" data-testid="topbar-menu">
            {/* אייקון המבורגר פשוט (RTL לא משנה כאן) */}
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Button>
        </div>

        {/* כותרת/לוגו – החלף לפי צורך */}
        <h1 className="text-base md:text-lg font-semibold text-foreground ms-1" data-testid="app-title">
          AllForYou
        </h1>

        <div className="ms-auto flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}
