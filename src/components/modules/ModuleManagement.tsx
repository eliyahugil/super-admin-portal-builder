import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModuleStatsCards } from './ModuleStatsCards';
import { ModuleSearchControls } from './ModuleSearchControls';
import { ModuleEmptyState } from './ModuleEmptyState';
import { ModuleGrid } from './ModuleGrid';
import { SuperAdminModuleConfig } from './config/SuperAdminModuleConfig';
import { useModuleManagement } from './ModuleManagementHooks';
import { useModuleActions } from './ModuleManagementActions';
import { useModuleDialogs } from './ModuleManagementDialogs';
import { useBusiness } from '@/hooks/useBusiness';

export const ModuleManagement: React.FC = () => {
  const { isSuperAdmin } = useBusiness();

  // For super admin, show the new configuration interface
  if (isSuperAdmin) {
    return <SuperAdminModuleConfig />;
  }

  // For regular business users, keep the existing interface
  const {
    modules,
    filteredModules,
    searchTerm,
    setSearchTerm,
    loading,
    fetchModules,
    toast
  } = useModuleManagement();

  const { handleDeleteModule, handleToggleActive } = useModuleActions({
    toast,
    fetchModules
  });

  const {
    createDialogOpen,
    setCreateDialogOpen,
    customModuleCreatorOpen,
    setCustomModuleCreatorOpen,
    handleEditModule,
    handleManageBusinesses,
    handleViewCustomModule,
    dialogs
  } = useModuleDialogs({ fetchModules });

  useEffect(() => {
    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען מודלים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול מודלים</h1>
          <p className="text-gray-600">נהל את כל המודלים הזמינים במערכת והגדר אילו מודלים זמינים לכל עסק</p>
        </div>

        {/* Stats Cards */}
        <ModuleStatsCards modules={modules} />

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>רשימת מודלים</CardTitle>
          </CardHeader>
          <CardContent>
            <ModuleSearchControls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onCreateModule={() => setCreateDialogOpen(true)}
              onCreateCustomModule={() => setCustomModuleCreatorOpen(true)}
            />

            {filteredModules.length === 0 ? (
              <ModuleEmptyState
                searchTerm={searchTerm}
                onCreateModule={() => setCreateDialogOpen(true)}
                onCreateCustomModule={() => setCustomModuleCreatorOpen(true)}
              />
            ) : (
              <ModuleGrid
                modules={filteredModules}
                onEdit={handleEditModule}
                onManageBusinesses={handleManageBusinesses}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteModule}
                onViewCustomModule={handleViewCustomModule}
              />
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        {dialogs}
      </div>
    </div>
  );
};
