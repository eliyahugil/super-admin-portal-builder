
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { PreviewTableCell } from './PreviewTableCell';
import type { FieldMapping } from '@/hooks/useEmployeeImport/types';
import type { PreviewRowData } from './PreviewDataGenerator';

interface PreviewTableRowProps {
  row: PreviewRowData;
  rowIndex: number;
  mappings: FieldMapping[];
  businessId?: string;
  editingCell: string | null;
  editValues: Record<string, string>;
  onEditStart: (cellKey: string) => void;
  onEditSave: (cellKey: string) => void;
  onEditCancel: (cellKey: string) => void;
  onEditValueChange: (cellKey: string, value: string) => void;
}

export const PreviewTableRow: React.FC<PreviewTableRowProps> = ({
  row,
  rowIndex,
  mappings,
  businessId,
  editingCell,
  editValues,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditValueChange,
}) => {
  return (
    <TableRow>
      <TableCell className="font-mono text-sm">
        {row.originalRowIndex}
      </TableCell>
      {mappings.map((mapping) => (
        <PreviewTableCell
          key={mapping.id}
          mapping={mapping}
          rowIndex={rowIndex}
          cellData={row[mapping.systemField]}
          businessId={businessId}
          editingCell={editingCell}
          editValues={editValues}
          onEditStart={onEditStart}
          onEditSave={onEditSave}
          onEditCancel={onEditCancel}
          onEditValueChange={onEditValueChange}
        />
      ))}
    </TableRow>
  );
};
