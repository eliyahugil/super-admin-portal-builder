
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
      <div className="min-h-screen flex flex-col w-full max-w-none" dir="rtl">
        {/* Header - Fixed position for constant visibility during scroll */}
        <div className="fixed top-0 left-0 right-0 h-16 w-full bg-white border-b border-gray-200 z-[100] flex-shrink-0 sticky-header mobile-header-fix">
          <Header onMobileMenuToggle={isMobile ? handleMobileMenuToggle : undefined} />
        </div>
        
        {/* Main Layout with padding top for fixed header */}
        <div className="flex-1 flex w-full max-w-none pt-16">
          {/* Desktop Sidebar - Only on desktop */}
          {!isMobile && <DynamicSidebar />}
          
          <SidebarInset className="flex-1 w-full max-w-none">
            {/* Mobile Sidebar - Always render when mobile */}
            {isMobile && (
              <MobileSidebar 
                isOpen={mobileMenuOpen} 
                onOpenChange={setMobileMenuOpen} 
              />
            )}
            
            {/* Main Content - Full width utilization */}
            <main className="flex-1 bg-gray-50 w-full max-w-none overflow-visible">
              <div className="w-full max-w-none">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};
