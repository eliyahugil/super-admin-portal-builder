
export interface FieldMapping {
  id: string;
  systemField: string;
  mappedColumns: string[];
  isCustomField?: boolean;
  customFieldName?: string;
}

export interface FieldMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileColumns: string[];
  sampleData: Record<string, any>[];
  onConfirm: (mappings: FieldMapping[]) => void;
  systemFields?: Array<{ value: string; label: string }>;
}
