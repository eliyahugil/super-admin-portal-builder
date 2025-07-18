import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateEmployeeDialog } from './CreateEmployeeDialog';
import { 
  Users, 
  Archive, 
  Download, 
  Upload,
  Settings,
  RefreshCw,
  Plus,
  UserX
} from 'lucide-react';

import { useBranches } from '@/hooks/useBranches';

interface ModernEmployeeHeaderProps {
  businessId: string;
  currentView: 'active' | 'inactive' | 'archived';
  onViewChange: (view: 'active' | 'inactive' | 'archived') => void;
  totalActiveEmployees: number;
  totalInactiveEmployees: number;
  totalArchivedEmployees: number;
  onRefetch?: () => void;
}

export const ModernEmployeeHeader: React.FC<ModernEmployeeHeaderProps> = ({
  businessId,
  currentView,
  onViewChange,
  totalActiveEmployees,
  totalInactiveEmployees,
  totalArchivedEmployees,
  onRefetch,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Fetch branches for the dialog
  const { data: branches = [] } = useBranches(businessId);
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export employees');
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import employees');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Card className="card-gradient hover-glow">
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-4">
          {/* Title Section */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">
                ניהול עובדים
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                <p className="text-sm sm:text-base text-muted-foreground">
                  ניהול ומעקב אחר כוח האדם בעסק
                </p>
                <Badge variant="secondary" className="w-fit">
                  {currentView === 'archived' ? `${totalArchivedEmployees} בארכיון` : 
                   currentView === 'inactive' ? `${totalInactiveEmployees} לא פעילים` : 
                   `${totalActiveEmployees} פעילים`}
                </Badge>
              </div>
            </div>
          </div>

          {/* View Toggle - Mobile First */}
          <div className="flex bg-muted rounded-lg p-1 w-full">
            <Button
              variant={currentView === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("active")}
              className="flex-1 text-xs sm:text-sm"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">פעילים </span>({totalActiveEmployees})
            </Button>
            <Button
              variant={currentView === "inactive" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("inactive")}
              className="flex-1 text-xs sm:text-sm"
            >
              <UserX className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">לא פעילים </span>({totalInactiveEmployees})
            </Button>
            <Button
              variant={currentView === "archived" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("archived")}
              className="flex-1 text-xs sm:text-sm"
            >
              <Archive className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">ארכיון </span>({totalArchivedEmployees})
            </Button>
          </div>

          {/* Action Buttons - Stack on Mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="hover-lift text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">רענן</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              className="hover-lift text-xs sm:text-sm"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">ייבא</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="hover-lift text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">ייצא</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hover-lift text-xs sm:text-sm"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">הגדרות</span>
            </Button>

            <Button
              className="btn-primary hover-lift col-span-2 sm:col-span-1 text-xs sm:text-sm"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              עובד חדש
            </Button>
          </div>

          {/* Stats Row - Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-border">
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-foreground">{totalActiveEmployees}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">עובדים פעילים</p>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{totalInactiveEmployees}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">לא פעילים</p>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-foreground">{totalArchivedEmployees}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">בארכיון</p>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-success">
                {totalActiveEmployees > 0 ? Math.round((totalActiveEmployees / (totalActiveEmployees + totalInactiveEmployees + totalArchivedEmployees)) * 100) : 0}%
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">שיעור פעילים</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CreateEmployeeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          onRefetch?.();
        }}
        branches={branches}
      />
    </Card>
  );
};