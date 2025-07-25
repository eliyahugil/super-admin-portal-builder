
import React, { useState, useEffect } from 'react';
import { ModernEmployeeHeader } from './ModernEmployeeHeader';
import { ModernEmployeeStatsCards } from './ModernEmployeeStatsCards';
import { EmployeeManagementLoading } from './EmployeeManagementLoading';
import { EmployeeManagementEmptyState } from './EmployeeManagementEmptyState';
import { ModernEmployeesList } from './ModernEmployeesList';
import { ArchivedEmployeesList } from './ArchivedEmployeesList';
import { InactiveEmployeesList } from './InactiveEmployeesList';
import { ManagementToolsSection } from './ManagementToolsSection/ManagementToolsSection';
import { useEmployees } from '@/hooks/useEmployees';
import { useEmployeeStats } from '@/hooks/useEmployeeStats';
import { useBusinessId } from '@/hooks/useBusinessId';

interface EmployeeManagementProps {
  selectedBusinessId?: string | null;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ 
  selectedBusinessId 
}) => {
  // השתמש ב-useBusinessId לקבלת business ID עדכני
  const currentBusinessId = useBusinessId();
  // השתמש תמיד ב-business ID מהקונטקסט כדי להבטיח עדכון אוטומטי
  const effectiveBusinessId = currentBusinessId;
  
  console.log('📊 EmployeeManagement: Business ID comparison:', {
    selectedBusinessId,
    currentBusinessId,
    effectiveBusinessId,
    timestamp: new Date().toISOString()
  });
  
  // עדכון רענון אוטומטי כשמשתנה business ID
  useEffect(() => {
    console.log('🔄 EmployeeManagement: Business ID changed to:', effectiveBusinessId);
    setRefreshKey(prev => prev + 1);
  }, [effectiveBusinessId]);
  
  const [currentView, setCurrentView] = useState<'active' | 'inactive' | 'archived'>('active');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch employees data - זה כבר מחזיר רק עובדים פעילים
  const { 
    data: activeEmployees = [], 
    isLoading: employeesLoading, 
    error: employeesError,
    refetch: refetchEmployees 
  } = useEmployees(effectiveBusinessId);

  console.log('📊 EmployeeManagement - Employee data:', {
    activeEmployees: activeEmployees.length,
    currentView,
    refreshKey
  });

  // Fetch employee statistics
  const { 
    data: stats = {
      totalEmployees: 0,
      activeEmployees: 0,
      inactiveEmployees: 0,
      archivedEmployees: 0,
    }, 
    isLoading: statsLoading,
    refetch: refetchStats
  } = useEmployeeStats(effectiveBusinessId);

  const handleRefetch = async () => {
    console.log('🔄 Manual refetch triggered - incrementing refresh key');
    setRefreshKey(prev => prev + 1);
    await Promise.all([
      refetchEmployees(),
      refetchStats()
    ]);
  };

  if (!effectiveBusinessId) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-sm sm:text-base">אנא בחר עסק כדי לנהל עובדים</p>
        </div>
      </div>
    );
  }

  if (employeesLoading || statsLoading) {
    return <EmployeeManagementLoading />;
  }

  if (employeesError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-8 sm:py-12">
          <p className="text-red-600 mb-4 text-sm sm:text-base">שגיאה בטעינת נתוני העובדים</p>
          <button 
            onClick={handleRefetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-mobile space-y-4 sm:space-y-6 py-4 sm:py-6" key={refreshKey}>
      <ModernEmployeeHeader 
        businessId={effectiveBusinessId}
        currentView={currentView}
        onViewChange={setCurrentView}
        totalActiveEmployees={stats.activeEmployees}
        totalInactiveEmployees={stats.inactiveEmployees}
        totalArchivedEmployees={stats.archivedEmployees}
        onRefetch={handleRefetch}
      />

      <ModernEmployeeStatsCards
        totalEmployees={stats.totalEmployees}
        activeEmployees={stats.activeEmployees}
        inactiveEmployees={stats.inactiveEmployees}
        archivedEmployees={stats.archivedEmployees}
        isLoading={statsLoading}
        businessId={effectiveBusinessId}
      />

      {currentView === 'active' && activeEmployees.length === 0 ? (
        <EmployeeManagementEmptyState 
          businessId={effectiveBusinessId} 
          onRefetch={handleRefetch}
        />
      ) : currentView === 'archived' ? (
        <ArchivedEmployeesList 
          businessId={effectiveBusinessId}
          onRefetch={handleRefetch}
        />
      ) : currentView === 'inactive' ? (
        <InactiveEmployeesList 
          businessId={effectiveBusinessId}
          onRefetch={handleRefetch}
        />
      ) : (
        <ModernEmployeesList 
          businessId={effectiveBusinessId}
          employees={activeEmployees}
          onRefetch={handleRefetch}
        />
      )}
    </div>
  );
};
