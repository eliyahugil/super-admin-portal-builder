import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/BackButton';
import { 
  Search, 
  Filter, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plus,
  Settings,
  FileText,
  Calendar,
  Download,
  ArrowUpDown,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { ExportEmployeesButton } from './ExportEmployeesButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmployeeArchiveButton } from './EmployeeArchiveButton';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';
import { QuickAddEmployeeToken } from './QuickAddEmployeeToken';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '@/types/employee';

interface ModernEmployeesListProps {
  businessId: string;
  employees: Employee[];
  onRefetch?: () => void;
}

export const ModernEmployeesList: React.FC<ModernEmployeesListProps> = ({
  businessId,
  employees,
  onRefetch = () => {},
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'created_asc' | 'created_desc' | 'hire_asc' | 'hire_desc'>('name_asc');

  // Filter and sort employees based on search, status and sort order
  const filteredAndSortedEmployees = React.useMemo(() => {
    // First filter
    const filtered = employees.filter(employee => {
      const matchesSearch = 
        employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone?.includes(searchTerm);

      const matchesFilter = 
        selectedFilter === 'all' ||
        (selectedFilter === 'active' && employee.is_active) ||
        (selectedFilter === 'inactive' && !employee.is_active);

      return matchesSearch && matchesFilter;
    });

    // Then sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`, 'he');
        case 'name_desc':
          return `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`, 'he');
        case 'created_asc':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'created_desc':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'hire_asc':
          return new Date(a.hire_date || '').getTime() - new Date(b.hire_date || '').getTime();
        case 'hire_desc':
          return new Date(b.hire_date || '').getTime() - new Date(a.hire_date || '').getTime();
        default:
          return 0;
      }
    });
  }, [employees, searchTerm, selectedFilter, sortBy]);

  const handleViewProfile = (employeeId: string) => {
    navigate(`/modules/employees/profile/${employeeId}`);
  };

  const getEmployeeInitials = (employee: Employee) => {
    return `${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <div className="mb-4">
        <BackButton />
      </div>
      
      {/* Header Section with Management Tools */}
      <div className="flex flex-col gap-4 items-stretch sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">רשימת עובדים</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            ניהול ומעקב אחר {filteredAndSortedEmployees.length} עובדים
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => navigate('/modules/employees/create')}
            className="btn-primary hover-lift"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            הוסף עובד חדש
          </Button>
          
          <QuickAddEmployeeToken businessId={businessId} onEmployeeAdded={onRefetch} />
          
          <ExportEmployeesButton />
          
          {/* Management Tools - Compact */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                כלי ניהול
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/modules/employees/import')}>
                <FileText className="h-4 w-4 mr-2" />
                ייבוא עובדים
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/modules/employees/duplicate-manager')}>
                <Users className="h-4 w-4 mr-2" />
                ניהול עובדים כפולים
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/modules/employees/shifts')}>
                <Calendar className="h-4 w-4 mr-2" />
                ניהול משמרות
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const exportBtn = document.querySelector('[data-export-employees]') as HTMLButtonElement;
                exportBtn?.click();
              }}>
                <Download className="h-4 w-4 mr-2" />
                ייצא לאקסל
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* First Row: Search and Status Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="חיפוש לפי שם, מייל או טלפון..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'inactive'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter(filter)}
                    className="whitespace-nowrap text-xs sm:text-sm"
                    size="sm"
                  >
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {filter === 'all' ? 'הכל' : filter === 'active' ? 'פעילים' : 'לא פעילים'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Second Row: Sort Options */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">סדר תצוגה:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                    {sortBy === 'name_asc' && 'שם (א-ת)'}
                    {sortBy === 'name_desc' && 'שם (ת-א)'}
                    {sortBy === 'created_asc' && 'תאריך יצירה (ישן-חדש)'}
                    {sortBy === 'created_desc' && 'תאריך יצירה (חדש-ישן)'}
                    {sortBy === 'hire_asc' && 'תאריך תחילת עבודה (ישן-חדש)'}
                    {sortBy === 'hire_desc' && 'תאריך תחילת עבודה (חדש-ישן)'}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuItem onClick={() => setSortBy('name_asc')}>
                    <span className={sortBy === 'name_asc' ? 'font-semibold' : ''}>
                      שם (א-ת)
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name_desc')}>
                    <span className={sortBy === 'name_desc' ? 'font-semibold' : ''}>
                      שם (ת-א)
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created_desc')}>
                    <span className={sortBy === 'created_desc' ? 'font-semibold' : ''}>
                      תאריך יצירה (חדש-ישן)
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created_asc')}>
                    <span className={sortBy === 'created_asc' ? 'font-semibold' : ''}>
                      תאריך יצירה (ישן-חדש)
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('hire_desc')}>
                    <span className={sortBy === 'hire_desc' ? 'font-semibold' : ''}>
                      תאריך תחילת עבודה (חדש-ישן)
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('hire_asc')}>
                    <span className={sortBy === 'hire_asc' ? 'font-semibold' : ''}>
                      תאריך תחילת עבודה (ישן-חדש)
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="card-gradient hover-glow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">סה"כ עובדים</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient hover-glow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-success/10 rounded-xl">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-success" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">עובדים פעילים</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {employees.filter(e => e.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient hover-glow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-warning/10 rounded-xl">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-warning" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">תוצאות חיפוש</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{filteredAndSortedEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Grid */}
      {filteredAndSortedEmployees.length === 0 ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? 'לא נמצאו תוצאות' : 'אין עובדים עדיין'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'נסה לשנות את מונחי החיפוש או הפילטרים'
                : 'התחל בהוספת עובדים לעסק שלך'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/modules/employees/create')}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                הוסף עובד ראשון
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredAndSortedEmployees.map((employee, index) => (
            <Card 
              key={employee.id} 
              className="card-modern hover-lift cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleViewProfile(employee.id)}
            >
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Avatar className="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                        {getEmployeeInitials(employee)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm sm:text-base text-right break-words whitespace-normal leading-tight font-semibold">
                        {employee.first_name} {employee.last_name}
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <EmployeeStatusBadge employee={employee} size="sm" />
                      </div>
                      {!employee.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-600">חסר טלפון</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0">
                        <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40 sm:w-48">
                      <DropdownMenuItem onClick={() => handleViewProfile(employee.id)}>
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="text-xs sm:text-sm">צפה בפרופיל</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="text-xs sm:text-sm">ערוך פרטים</span>
                      </DropdownMenuItem>
                      <div onClick={(e) => e.stopPropagation()}>
                        <EmployeeArchiveButton
                          employee={employee}
                          isArchived={false}
                          variant="ghost"
                          size="sm"
                          onSuccess={() => window.location.reload()}
                        />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 p-3 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {employee.email && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                  )}
                  
                  {employee.phone && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{employee.phone}</span>
                    </div>
                  )}
                  
                  {employee.main_branch?.name && (
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{employee.main_branch.name}</span>
                    </div>
                  )}

                  {employee.employee_type && (
                    <Badge variant="secondary" className="w-fit text-xs">
                      {employee.employee_type === 'permanent' ? 'קבוע' :
                       employee.employee_type === 'temporary' ? 'זמני' :
                       employee.employee_type === 'contractor' ? 'קבלן' : 'נוער'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};