
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
          
          {/* Main Content - Fixed height calculation to prevent shifts */}
          <main className="flex-1 p-4 sm:p-6 bg-gray-50 h-[calc(100vh-4rem)] overflow-auto">
            <div className="w-full h-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
