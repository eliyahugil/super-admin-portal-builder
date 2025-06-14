import React from "react";
import { Shield, Lock, User } from "lucide-react";
import type { Employee } from "@/types/employee";

interface Props {
  employee: Employee;
}

export const EmployeeProfileSidebar: React.FC<Props> = ({ employee }) => {
  // Util to display roles/types
  const getUserTypeLabel = () => {
    if (employee.is_system_user) return "משתמש מערכת";
    return "עובד אפליקציה";
  };

  // Map for status visually
  const statusBadge = (isActive?: boolean) => (
    <span
      className={
        "inline-block rounded-full px-3 py-1 text-xs font-bold shadow-sm " +
        (isActive
          ? "bg-green-200 text-green-700"
          : "bg-gray-300 text-gray-600")
      }
    >
      {isActive ? "פעיל" : "כבוי"}
    </span>
  );

  return (
    <aside className="w-full md:w-72 border rounded-lg bg-white p-4 space-y-5 mb-4 md:mb-0 flex-shrink-0" dir="rtl">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700 mb-2">
        <User className="w-4 h-4" />
        הגדרות משתמש
      </h3>
      {/* הגדרות משתמש מערכת */}
      <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
        <dt className="text-gray-600">שם משתמש</dt>
        <dd className="truncate text-gray-900">{employee.username || <span className="text-gray-400">אין</span>}</dd>

        <dt className="text-gray-600">סוג משתמש</dt>
        <dd>
          {/* הצגה עם אייקון בהתאם לסוג */}
          <span className="inline-flex items-center gap-1">
            {employee.is_system_user ? <Shield className="w-4 h-4 text-blue-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
            {getUserTypeLabel()}
          </span>
        </dd>

        <dt className="text-gray-600">סטטוס משתמש</dt>
        <dd>{statusBadge(employee.is_active)}</dd>
      </dl>
      {/* הצגת תאריכים רלוונטיים */}
      <div className="mt-4 space-y-1 text-sm">
        {employee.hire_date && (
          <div>
            <span className="font-medium text-gray-600">תאריך התחלה:</span>{" "}
            <span className="text-gray-900">
              {new Date(employee.hire_date).toLocaleDateString("he-IL")}
            </span>
          </div>
        )}
        {employee.termination_date && (
          <div>
            <span className="font-medium text-gray-600">תאריך סיום:</span>{" "}
            <span className="text-gray-900">
              {new Date(employee.termination_date).toLocaleDateString("he-IL")}
            </span>
          </div>
        )}
      </div>
      {/* במידה ונרצה בעתיד שדות פעולות נוספות / עדכונים */}
      {/* <div className="mt-4">
        <button className="w-full rounded px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition">
          שתף פרטי התחברות
        </button>
      </div> */}
    </aside>
  );
};
