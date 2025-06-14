
export interface ManagementToolsSectionProps {
  onCreateEmployee: () => void;
  onCreateBranch: () => void;
}

export interface QuickActionsCardProps {
  onCreateEmployee: () => void;
  onCreateBranch: () => void;
}

export interface ShiftTemplateManagementSectionProps {
  // No specific props needed for now
}

export interface ManagementToolsGridProps {
  businessId?: string;
}
