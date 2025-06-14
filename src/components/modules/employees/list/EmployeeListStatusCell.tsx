
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { Employee } from "@/types/employee";

interface StatusCellProps {
  isActive: boolean;
}

export const EmployeeListStatusCell: React.FC<StatusCellProps> = ({ isActive }) => (
  isActive ? (
    <Badge variant="default" className="bg-green-100 text-green-800">
      <CheckCircle className="h-3 w-3 mr-1" />
      פעיל
    </Badge>
  ) : (
    <Badge variant="destructive">
      <XCircle className="h-3 w-3 mr-1" />
      לא פעיל
    </Badge>
  )
);
