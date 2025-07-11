
import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { BusinessManagementHeader } from './business-management/BusinessManagementHeader';
import { BusinessStatsCards } from './business-management/BusinessStatsCards';
import { BusinessFilters } from './business-management/BusinessFilters';
import { BusinessList } from './business-management/BusinessList';
import { useBusinessManagement } from './business-management/useBusinessManagement';

// Updated interface to match the actual data structure from the database
interface EnrichedBusiness {
  id: string;
  name: string;
  contact_email?: string;  // Optional to match database schema
  admin_email?: string;    // Optional to match database schema
  contact_phone?: string;  // Optional to match database schema
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  employee_count?: number;
  branches_count?: number;
  last_activity?: string;
}

export const BusinessManagement: React.FC = () => {
  const { profile } = useAuth();
  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    filteredBusinesses,
    loading,
    error,
    stats,
    isDeleting,
    handlers
  } = useBusinessManagement();

  console.log('BusinessManagement - User profile:', {
    profile,
    role: profile?.role,
    isSuperAdmin: profile?.role === 'super_admin'
  });

  if (loading || isDeleting) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">
            {isDeleting ? 'מוחק עסק...' : 'טוען...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת העסקים</h3>
          <p className="text-gray-600 mb-4">אנא נסה לרענן את הדף</p>
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // Check if user is super admin
  if (profile?.role !== 'super_admin') {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין הרשאה</h3>
          <p className="text-gray-600">אין לך הרשאות מנהל ראשי</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <BusinessManagementHeader
        totalBusinesses={stats.totalBusinesses}
        onCreateBusiness={handlers.handleCreateBusiness}
      />

      <BusinessStatsCards
        totalBusinesses={stats.totalBusinesses}
        activeBusinesses={stats.activeBusinesses}
        totalEmployees={stats.totalEmployees}
      />

      <BusinessFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <BusinessList
        businesses={filteredBusinesses}
        totalBusinesses={stats.totalBusinesses}
        onView={handlers.handleView}
        onSettings={handlers.handleSettings}
        onEdit={handlers.handleEdit}
        onDelete={handlers.handleDelete}
      />
    </div>
  );
};
