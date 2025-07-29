
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Clock, 
  Plug, 
  Settings,
  Shield,
  FileText,
  Calculator,
  Package,
  ShoppingCart,
  Briefcase,
  UserCheck,
  CheckSquare,
  Calendar,
  User,
  LinkIcon,
  ChevronDown,
  ChevronLeft,
  Send,
} from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { useBusinessModules } from '@/hooks/useBusinessModules';
import { getModuleRoutes } from '@/utils/routeMapping';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  createEmployeesMenuItems, 
  createBusinessMenuItems, 
  createSystemMenuItems, 
  createAdminMenuItems 
} from './sidebar/menuItems';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresSuperAdmin?: boolean;
  moduleKey?: string;
  category?: string;
  subItems?: {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    moduleKey?: string;
  }[];
}

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onOpenChange }) => {
  const { isSuperAdmin, business, isLoading: businessLoading } = useBusiness();
  const { businessId } = useBusiness();
  const { isModuleEnabled, isLoading: modulesLoading } = useBusinessModules(businessId);
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  console.log('MobileSidebar - Current state:', {
    business: business?.name,
    businessId,
    isSuperAdmin,
    businessLoading,
    modulesLoading
  });

  // Get menu items using the shared functions from menuItems.ts
  const employeesMenuItems = createEmployeesMenuItems(business);
  const businessMenuItems = createBusinessMenuItems(business);  
  const systemMenuItems = createSystemMenuItems(business);
  const adminMenuItems = createAdminMenuItems();

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const getVisibleItems = (items: MenuItem[]) => {
    return items.filter(item => {
      // Check super admin requirement
      if (item.requiresSuperAdmin && !isSuperAdmin) return false;
      
      // Check module requirement - skip module check if still loading or if super admin
      if (item.moduleKey && !isSuperAdmin && !modulesLoading) {
        return isModuleEnabled(item.moduleKey);
      }
      
      return true;
    });
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => {
      // אם הפריט כבר פתוח, סגור אותו
      if (prev[path]) {
        return { ...prev, [path]: false };
      }
      // אחרת, סגור את כל האחרים ופתח את זה
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[path] = true;
      return newState;
    });
  };

  const handleMenuItemClick = (item: MenuItem, event?: React.MouseEvent) => {
    console.log('🔍 MobileSidebar.handleMenuItemClick:', { 
      hasSubItems: item.subItems && item.subItems.length > 0, 
      path: item.path, 
      itemLabel: item.label 
    });
    
    if (item.subItems && item.subItems.length > 0) {
      // עבור פריטים עם תת-פריטים - רק נרחיב/נכווץ, לא נסגור סיידבר
      console.log('📂 פריט עם תת-פריטים - מרחיב/כווץ בלבד, לא סוגר סיידבר');
      event?.preventDefault();
      event?.stopPropagation();
      toggleExpanded(item.path);
      // לא קוראים ל-onOpenChange כדי לא לסגור את הסיידבר
    } else {
      // עבור פריטים ללא תת-פריטים - ננווט ונסגור את הסיידבר
      console.log('📄 פריט ללא תת-פריטים - סוגר סיידבר');
      onOpenChange(false);
    }
  };

  const renderMenuSection = (title: string, items: MenuItem[]) => {
    const visibleItems = getVisibleItems(items);
    if (visibleItems.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="px-6 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
            {title}
          </h3>
        </div>
        <div className="space-y-2 px-3">
          {visibleItems.map((item) => {
            const active = isActive(item.path);
            const isExpanded = expandedItems[item.path];
            
            return (
              <div key={item.path} className="relative">
                {item.subItems && item.subItems.length > 0 ? (
                  // פריט עם תת-פריטים - כפתור להרחבה/כיווץ
                  <>
                    <Button
                      variant="ghost"
                      onClick={(event) => handleMenuItemClick(item, event)}
                      className={`
                        w-full h-auto group relative overflow-hidden
                        ${isExpanded 
                          ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border border-primary/20' 
                          : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 text-foreground hover:text-primary'
                        }
                        transition-all duration-300 ease-in-out rounded-xl
                      `}
                    >
                      <div className="flex items-center gap-4 w-full py-4 px-4">
                        <div className={`
                          p-2 rounded-lg transition-all duration-300
                          ${isExpanded 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                          }
                        `}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="flex-1 text-right font-medium text-sm">
                          {item.label}
                        </span>
                        <div className={`
                          transition-transform duration-300 ease-in-out
                          ${isExpanded ? 'rotate-180' : 'rotate-0'}
                        `}>
                          <ChevronDown className={`h-4 w-4 ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                      </div>
                    </Button>
                    
                    {/* אנימציה לתת-פריטים */}
                    <div className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}>
                      <div className="mt-2 mr-6 space-y-1 animate-fade-in">
                        {item.subItems
                          .filter(subItem => {
                            if (subItem.moduleKey && !isSuperAdmin && !modulesLoading) {
                              return isModuleEnabled(subItem.moduleKey);
                            }
                            return true;
                          })
                          .map((subItem, index) => {
                            const subActive = isActive(subItem.path);
                            return (
                              <NavLink
                                key={subItem.path}
                                to={subItem.path}
                                onClick={() => onOpenChange(false)}
                                className={`
                                  flex items-center gap-3 py-3 px-4 rounded-lg text-sm
                                  transition-all duration-200 group hover-scale
                                  ${subActive 
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md' 
                                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                                  }
                                `}
                                style={{
                                  animationDelay: `${index * 50}ms`
                                }}
                              >
                                <div className="w-8 flex justify-center">
                                  <div className={`
                                    w-1.5 h-1.5 rounded-full transition-all duration-200
                                    ${subActive ? 'bg-primary-foreground' : 'bg-muted-foreground/50 group-hover:bg-primary'}
                                  `} />
                                </div>
                                <subItem.icon className={`h-4 w-4 transition-colors duration-200 ${subActive ? 'text-primary-foreground' : ''}`} />
                                <span className="flex-1 text-right font-medium">{subItem.label}</span>
                                {subActive && (
                                  <ChevronLeft className="h-3 w-3 text-primary-foreground" />
                                )}
                              </NavLink>
                            );
                          })}
                      </div>
                    </div>
                  </>
                ) : (
                  // פריט ללא תת-פריטים - קישור רגיל
                  <NavLink
                    to={item.path}
                    onClick={() => onOpenChange(false)}
                    className={`
                      flex items-center gap-4 py-4 px-4 rounded-xl transition-all duration-300 group hover-scale
                      ${active 
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg border border-primary/20' 
                        : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 text-foreground hover:text-primary'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg transition-all duration-300
                      ${active 
                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                        : 'bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                      }
                    `}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-right font-medium text-sm">{item.label}</span>
                    {active && (
                      <ChevronLeft className="h-4 w-4 text-primary-foreground" />
                    )}
                  </NavLink>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Show loading state only if business is loading AND we're not a super admin
  if (businessLoading && !isSuperAdmin) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
          <SheetHeader className="px-4 py-6 border-b">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </SheetHeader>
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col bg-gradient-to-b from-background to-muted/20">
        <SheetHeader className="px-6 py-6 border-b border-border/50 flex-shrink-0 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <SheetTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {business?.name || 'ניהול מערכת'}
              </SheetTitle>
              {business && (
                <SheetDescription className="text-sm text-muted-foreground font-medium mt-1">
                  {isSuperAdmin ? 'מנהל על' : 'משתמש עסקי'}
                </SheetDescription>
              )}
            </div>
            <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary border-primary/20">
              v1.0.0
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-0">
          <div className="px-0 py-6 space-y-8">
            {renderMenuSection('ראשי', employeesMenuItems)}
            <Separator className="mx-6 opacity-50" />
            {renderMenuSection('עסקי', businessMenuItems)}
            <Separator className="mx-6 opacity-50" />
            {renderMenuSection('מערכת', systemMenuItems)}
            {isSuperAdmin && (
              <>
                <Separator className="mx-6 opacity-50" />
                {renderMenuSection('ניהול', adminMenuItems)}
              </>
            )}
            <div className="h-6" /> {/* מרווח תחתון */}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
