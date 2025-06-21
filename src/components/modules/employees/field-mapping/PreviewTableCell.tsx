
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { CategorySelectWithAdd } from '@/components/shared/CategorySelectWithAdd';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import type { PreviewCellData } from './PreviewDataGenerator';
import { cn } from '@/lib/utils';

interface PreviewTableCellProps {
  mapping: FieldMapping;
  rowIndex: number;
  cellData: PreviewCellData;
  businessId?: string;
  editingCell: string | null;
  editValues: Record<string, string>;
  onEditStart: (cellKey: string) => void;
  onEditSave: (cellKey: string) => void;
  onEditCancel: (cellKey: string) => void;
  onEditValueChange: (cellKey: string, value: string) => void;
}

export const PreviewTableCell: React.FC<PreviewTableCellProps> = ({
  mapping,
  rowIndex,
  cellData,
  businessId,
  editingCell,
  editValues,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditValueChange,
}) => {
  const cellKey = `${mapping.systemField}-${rowIndex}`;
  const isEditing = editingCell === cellKey;
  
  // Check if this field should have a dropdown
  const isSelectField = ['employee_type', 'main_branch_id'].includes(mapping.systemField);
  
  const getCellClassName = () => {
    if (!cellData || typeof cellData !== 'object') return '';
    
    return cn(
      'max-w-48 p-2 relative',
      cellData.isMapped && cellData.isEmpty && 'bg-yellow-100 border-yellow-200',
      !cellData.isMapped && cellData.value !== '-' && 'bg-red-100 border-red-200',
      cellData.isMapped && !cellData.isEmpty && 'bg-green-50 border-green-200'
    );
  };

  if (isEditing && isSelectField) {
    const categoryType = mapping.systemField === 'employee_type' ? 'employee_type' : 'branch';
    
    return (
      <td className={getCellClassName()}>
        <div className="flex items-center gap-2 min-w-[180px]">
          <CategorySelectWithAdd
            typeCategory={categoryType as any}
            value={editValues[cellKey] || (cellData?.value || '')}
            onChange={(val) => onEditValueChange(cellKey, val)}
            businessId={businessId}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEditSave(cellKey)}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEditCancel(cellKey)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </td>
    );
  }
  
  return (
    <td className={getCellClassName()}>
      <div className="flex items-center justify-between group">
        <div className="truncate flex-1" title={cellData?.value || '-'}>
          {cellData?.value || '-'}
        </div>
        {isSelectField && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEditStart(cellKey)}
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </td>
  );
};
