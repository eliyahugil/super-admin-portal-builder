
import React, { useState } from 'react';
import { DynamicSidebar } from './DynamicSidebar';
import { MobileSidebar } from './MobileSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" dir="rtl">
        {/* Desktop Sidebar - Only on desktop */}
        {!isMobile && <DynamicSidebar />}
        
        <SidebarInset className="flex-1">
          {/* Header with mobile menu toggle - Fixed height to prevent layout shift */}
          <div className="h-16 w-full">
            <Header onMobileMenuToggle={isMobile ? handleMobileMenuToggle : undefined} />
          </div>
          
          {/* Mobile Sidebar - Always render when mobile */}
          {isMobile && (
            <MobileSidebar 
              isOpen={mobileMenuOpen} 
              onOpenChange={setMobileMenuOpen} 
            />
          )}
          
          {/* Main Content - Full width utilization */}
          <main className="flex-1 bg-gray-50 w-full max-w-none overflow-visible">
            <div className="w-full max-w-none p-0">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
