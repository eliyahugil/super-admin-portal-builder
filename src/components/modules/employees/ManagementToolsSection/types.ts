
export interface ManagementToolsSectionProps {
  onCreateEmployee: () => void;
  onCreateBranch: () => void;
}

export interface QuickActionsCardProps {
  onCreateEmployee: () => void;
  onCreateBranch: () => void;
  selectedBusinessId?: string;
}

export interface ImportToolsCardProps {
  selectedBusinessId?: string;
  onRefetch?: () => void;
}

export interface ShiftTemplateManagementSectionProps {
  selectedBusinessId?: string;
}

export interface ManagementToolsGridProps {
  selectedBusinessId?: string;
  onRefetch: () => void;
}
