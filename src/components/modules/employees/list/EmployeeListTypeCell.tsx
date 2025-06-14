
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Employee, EmployeeType } from "@/types/employee";

interface TypeCellProps {
  type: EmployeeType;
}

const getEmployeeTypeLabel = (type: EmployeeType) => {
  const types: Record<EmployeeType, string> = {
    permanent: 'קבוע',
    temporary: 'זמני',
    youth: 'נוער',
    contractor: 'קבלן',
  };
  return types[type];
};

const getEmployeeTypeVariant = (type: EmployeeType) => {
  const variants: Record<EmployeeType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    permanent: 'default',
    temporary: 'secondary',
    youth: 'outline',
    contractor: 'destructive',
  };
  return variants[type];
};

export const EmployeeListTypeCell: React.FC<TypeCellProps> = ({ type }) => (
  <Badge variant={getEmployeeTypeVariant(type)}>
    {getEmployeeTypeLabel(type)}
  </Badge>
);
