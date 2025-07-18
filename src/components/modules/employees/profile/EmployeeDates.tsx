
import React from "react";

export const EmployeeDates: React.FC<{
  hire_date?: string | null;
  termination_date?: string | null;
  birth_date?: string | null;
}> = ({ hire_date, termination_date, birth_date }) => (
  <div className="mt-4 space-y-1 text-sm">
    {birth_date && (
      <div>
        <span className="font-medium text-gray-600">תאריך לידה:</span>{" "}
        <span className="text-gray-900">
          {new Date(birth_date).toLocaleDateString("he-IL")}
        </span>
      </div>
    )}
    {hire_date && (
      <div>
        <span className="font-medium text-gray-600">תאריך התחלה:</span>{" "}
        <span className="text-gray-900">
          {new Date(hire_date).toLocaleDateString("he-IL")}
        </span>
      </div>
    )}
    {termination_date && (
      <div>
        <span className="font-medium text-gray-600">תאריך סיום:</span>{" "}
        <span className="text-gray-900">
          {new Date(termination_date).toLocaleDateString("he-IL")}
        </span>
      </div>
    )}
  </div>
);
