import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Archive, 
  Download, 
  Upload,
  Settings,
  RefreshCw,
  Plus
} from 'lucide-react';

interface ModernEmployeeHeaderProps {
  businessId: string;
  showArchived: boolean;
  onToggleArchived: (show: boolean) => void;
  totalActiveEmployees: number;
  totalArchivedEmployees: number;
}

export const ModernEmployeeHeader: React.FC<ModernEmployeeHeaderProps> = ({
  businessId,
  showArchived,
  onToggleArchived,
  totalActiveEmployees,
  totalArchivedEmployees,
}) => {
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
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Title Section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  ניהול עובדים
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-muted-foreground">
                    ניהול ומעקב אחר כוח האדם בעסק
                  </p>
                  <Badge variant="secondary">
                    {showArchived ? `${totalArchivedEmployees} בארכיון` : `${totalActiveEmployees} פעילים`}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* View Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={!showArchived ? "default" : "ghost"}
                size="sm"
                onClick={() => onToggleArchived(false)}
                className="text-sm"
              >
                <Users className="h-4 w-4 mr-2" />
                פעילים ({totalActiveEmployees})
              </Button>
              <Button
                variant={showArchived ? "default" : "ghost"}
                size="sm"
                onClick={() => onToggleArchived(true)}
                className="text-sm"
              >
                <Archive className="h-4 w-4 mr-2" />
                ארכיון ({totalArchivedEmployees})
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="hover-lift"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                רענן
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleImport}
                className="hover-lift"
              >
                <Upload className="h-4 w-4 mr-2" />
                ייבא
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="hover-lift"
              >
                <Download className="h-4 w-4 mr-2" />
                ייצא
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="hover-lift"
              >
                <Settings className="h-4 w-4 mr-2" />
                הגדרות
              </Button>

              <Button
                className="btn-primary hover-lift"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                עובד חדש
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalActiveEmployees}</p>
            <p className="text-sm text-muted-foreground">עובדים פעילים</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalArchivedEmployees}</p>
            <p className="text-sm text-muted-foreground">בארכיון</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalActiveEmployees + totalArchivedEmployees}</p>
            <p className="text-sm text-muted-foreground">סה"כ עובדים</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {totalActiveEmployees > 0 ? Math.round((totalActiveEmployees / (totalActiveEmployees + totalArchivedEmployees)) * 100) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">שיעור פעילים</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};