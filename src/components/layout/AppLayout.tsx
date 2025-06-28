
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
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar - Only on desktop */}
        {!isMobile && <DynamicSidebar />}
        
        <SidebarInset className="flex-1">
          {/* Header with mobile menu toggle */}
          <Header onMobileMenuToggle={isMobile ? handleMobileMenuToggle : undefined} />
          
          {/* Mobile Sidebar - Always render when mobile */}
          {isMobile && (
            <MobileSidebar 
              isOpen={mobileMenuOpen} 
              onOpenChange={setMobileMenuOpen} 
            />
          )}
          
          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
