
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
      <div className="min-h-screen w-full max-w-none relative" dir="rtl">
        {/* Header - Fixed position with enhanced mobile stability */}
        <header className="fixed top-0 left-0 right-0 h-16 w-full bg-white border-b border-gray-200 z-[9999] shadow-sm">
          <div className="h-full w-full">
            <Header onMobileMenuToggle={isMobile ? handleMobileMenuToggle : undefined} />
          </div>
        </header>
        
        {/* Main Layout Container */}
        <div className="flex min-h-screen w-full pt-16">
          {/* Desktop Sidebar - Only on desktop */}
          {!isMobile && <DynamicSidebar />}
          
          <SidebarInset className="flex-1 w-full max-w-none min-h-screen">
            {/* Mobile Sidebar - Always render when mobile */}
            {isMobile && (
              <MobileSidebar 
                isOpen={mobileMenuOpen} 
                onOpenChange={setMobileMenuOpen} 
              />
            )}
            
            {/* Main Content */}
            <main className="flex-1 bg-gray-50 w-full max-w-none min-h-screen">
              <div className="w-full max-w-none h-full">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};
