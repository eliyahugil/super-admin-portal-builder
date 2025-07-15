
import { 
  User, 
  MessageSquare, 
  FileText, 
  Building, 
  Clock, 
  Calendar, 
  KeyRound, 
  DollarSign, 
  Settings, 
  BarChart3 
} from 'lucide-react';
import type { Employee } from '@/types/supabase';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string | number;
  description?: string;
}

export const getAvailableTabs = (employee: Employee): TabItem[] => {
  // Calculate badges for each tab
  const notesCount = employee.employee_notes?.length || 0;
  const documentsCount = (employee.employee_documents?.length || 0) + (employee.employee_files?.length || 0);
  const branchAssignments = employee.branch_assignments?.filter(ba => ba.is_active).length || 0;
  const activeTokens = employee.weekly_tokens?.filter(t => t.is_active).length || 0;

  return [
    { 
      id: 'overview', 
      label: 'סקירה כללית', 
      icon: User,
      description: 'מידע כללי על העובד'
    },
    { 
      id: 'notes', 
      label: 'הערות', 
      icon: MessageSquare,
      badge: notesCount > 0 ? notesCount : undefined,
      description: 'הערות ותיעוד על העובד'
    },
    { 
      id: 'documents', 
      label: 'מסמכים', 
      icon: FileText,
      badge: documentsCount > 0 ? documentsCount : undefined,
      description: 'מסמכים וקבצים של העובד'
    },
    { 
      id: 'branches', 
      label: 'סניפים ותפקידים', 
      icon: Building,
      badge: branchAssignments > 0 ? branchAssignments : undefined,
      description: 'הקצאות סניפים ותפקידים'
    },
    { 
      id: 'attendance', 
      label: 'נוכחות', 
      icon: Clock,
      description: 'היסטוריית נוכחות ושעות עבודה'
    },
    { 
      id: 'shifts', 
      label: 'משמרות', 
      icon: Calendar,
      description: 'הגשות משמרות והיסטוריה'
    },
    { 
      id: 'tokens', 
      label: 'טוקנים', 
      icon: KeyRound,
      badge: activeTokens > 0 ? activeTokens : undefined,
      description: 'ניהול טוקני הגשת משמרות'
    },
    { 
      id: 'salary', 
      label: 'שכר', 
      icon: DollarSign,
      description: 'היסטוריית שכר ועדכונים'
    },
    { 
      id: 'custom', 
      label: 'שדות מותאמים', 
      icon: Settings,
      description: 'מידע נוסף ושדות מותאמים אישית'
    },
    { 
      id: 'analytics', 
      label: 'ניתוחים', 
      icon: BarChart3,
      description: 'סטטיסטיקות וניתוחי ביצועים'
    },
  ];
};
