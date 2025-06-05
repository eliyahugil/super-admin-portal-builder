
import React, { useState } from 'react';
import { CreateModuleDialog } from './CreateModuleDialog';
import { EditModuleDialog } from './EditModuleDialog';
import { ModuleBusinessDialog } from './ModuleBusinessDialog';
import { CustomModuleCreator } from './CustomModuleCreator';
import { CustomModuleViewer } from './CustomModuleViewer';

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string | null;
  is_active: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
  module_config?: any;
}

interface ModuleDialogsProps {
  fetchModules: () => void;
}

export const useModuleDialogs = ({ fetchModules }: ModuleDialogsProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [customModuleCreatorOpen, setCustomModuleCreatorOpen] = useState(false);
  const [customModuleViewerOpen, setCustomModuleViewerOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setEditDialogOpen(true);
  };

  const handleManageBusinesses = (module: Module) => {
    setSelectedModule(module);
    setBusinessDialogOpen(true);
  };

  const handleViewCustomModule = (module: Module) => {
    setSelectedModule(module);
    setCustomModuleViewerOpen(true);
  };

  const dialogs = (
    <>
      <CreateModuleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchModules}
      />
      
      <EditModuleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        module={selectedModule}
        onSuccess={fetchModules}
      />
      
      <ModuleBusinessDialog
        open={businessDialogOpen}
        onOpenChange={setBusinessDialogOpen}
        module={selectedModule}
      />

      <CustomModuleCreator
        open={customModuleCreatorOpen}
        onOpenChange={setCustomModuleCreatorOpen}
        onSuccess={fetchModules}
      />

      <CustomModuleViewer
        open={customModuleViewerOpen}
        onOpenChange={setCustomModuleViewerOpen}
        module={selectedModule}
      />
    </>
  );

  return {
    createDialogOpen,
    setCreateDialogOpen,
    customModuleCreatorOpen,
    setCustomModuleCreatorOpen,
    handleEditModule,
    handleManageBusinesses,
    handleViewCustomModule,
    dialogs
  };
};
