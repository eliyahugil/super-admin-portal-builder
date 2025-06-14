
import React from "react";
import { Shield, Lock } from "lucide-react";

export const UserTypeField: React.FC<{ isSystemUser?: boolean }> = ({ isSystemUser }) => (
  <span className="inline-flex items-center gap-1">
    {isSystemUser ? <Shield className="w-4 h-4 text-blue-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
    {isSystemUser ? "משתמש מערכת" : "עובד אפליקציה"}
  </span>
);
