
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthContext';
import { AuthErrorHandler } from '@/components/auth/AuthErrorHandler';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import NotFound from '@/pages/NotFound';
import NotAuthorized from '@/pages/NotAuthorized';
import { PublicRoutes } from '@/components/routes/PublicRoutes';
import { MainRoutes } from '@/components/routes/MainRoutes';
import { BusinessRoutes } from '@/components/routes/BusinessRoutes';
import { ModuleRoutes } from '@/components/routes/ModuleRoutes';
import { AdminRoutes } from '@/components/routes/AdminRoutes';
import { useUserDisplaySettings } from '@/hooks/useUserDisplaySettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  console.log('🚀 App component rendering');
  
  // טעינת הגדרות תצוגה בטעינה הראשונה
  useUserDisplaySettings();
  
  // Runtime guards – לוכד קישורים שבורים ו-unhandled rejections
  React.useEffect(() => {
    // לוכד קישורים שבורים/ריקים
    const handleClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.trim() === '') {
        console.warn('⚠️ קישור ללא יעד תקין:', a);
      }
    };
    
    // לוכד reject לא מטופל
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ Unhandled promise rejection:', event.reason);
    };
    
    document.addEventListener('click', handleClick);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthErrorHandler>
            <Router>
              <Toaster />
              <SonnerToaster richColors closeButton dir="rtl" position="top-center" />
              <Routes>
                {PublicRoutes()}
                {MainRoutes()}
                {ModuleRoutes()}
                {BusinessRoutes()}
                {AdminRoutes()}
                
                {/* Not authorized route */}
                <Route path="/not-authorized" element={<NotAuthorized />} />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AuthErrorHandler>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
