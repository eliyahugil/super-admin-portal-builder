import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(employee => {
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">רשימת עובדים</h2>
          <p className="text-muted-foreground">
            ניהול ומעקב אחר {filteredEmployees.length} עובדים
          </p>
        </div>
        <Button 
          onClick={() => navigate('/modules/employees/create')}
          className="btn-primary hover-lift"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          הוסף עובד חדש
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="card-modern">
        <CardContent className="p-6">
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
            <div className="flex gap-2">
              {(['all', 'active', 'inactive'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter(filter)}
                  className="whitespace-nowrap"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {filter === 'all' ? 'הכל' : filter === 'active' ? 'פעילים' : 'לא פעילים'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-gradient hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">סה"כ עובדים</p>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">עובדים פעילים</p>
                <p className="text-2xl font-bold text-foreground">
                  {employees.filter(e => e.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-xl">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">תוצאות חיפוש</p>
                <p className="text-2xl font-bold text-foreground">{filteredEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Grid */}
      {filteredEmployees.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee, index) => (
            <Card 
              key={employee.id} 
              className="card-modern hover-lift cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleViewProfile(employee.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getEmployeeInitials(employee)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-right">
                        {employee.first_name} {employee.last_name}
                      </CardTitle>
                      <Badge className={getStatusColor(employee.is_active || false)}>
                        {employee.is_active ? 'פעיל' : 'לא פעיל'}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={() => handleViewProfile(employee.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        צפה בפרופיל
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        ערוך פרטים
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        מחק עובד
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {employee.email && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                  )}
                  
                  {employee.phone && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{employee.phone}</span>
                    </div>
                  )}
                  
                  {employee.main_branch?.name && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{employee.main_branch.name}</span>
                    </div>
                  )}

                  {employee.employee_type && (
                    <Badge variant="secondary" className="w-fit">
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