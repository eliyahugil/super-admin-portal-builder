import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface DashboardLayout {
  id: string;
  user_id: string;
  page_type: string;
  layout_config: {
    sections: Array<{
      id: string;
      title: string;
      component: string;
      order: number;
      visible: boolean;
    }>;
  };
  created_at: string;
  updated_at: string;
}

export const useDashboardLayout = (pageType: string) => {
  const { user } = useAuth();
  const [layout, setLayout] = useState<DashboardLayout['layout_config'] | null>(null);
  const [loading, setLoading] = useState(true);

  // Default layout configuration
  const defaultLayout = {
    sections: [
      { id: 'stats', title: 'סטטיסטיקות', component: 'EmployeeStats', order: 0, visible: true },
      { id: 'list', title: 'רשימת עובדים', component: 'EmployeesList', order: 1, visible: true },
      { id: 'documents', title: 'מסמכים אחרונים', component: 'RecentDocuments', order: 2, visible: true },
      { id: 'calendar', title: 'לוח זמנים', component: 'ScheduleOverview', order: 3, visible: true }
    ]
  };

  // Load user's layout configuration
  useEffect(() => {
    if (!user) return;

    const loadLayout = async () => {
      try {
        const { data, error } = await supabase
          .from('user_dashboard_layouts')
          .select('*')
          .eq('user_id', user.id)
          .eq('page_type', pageType)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error loading layout:', error);
        }

        if (data) {
          setLayout(data.layout_config);
        } else {
          // No custom layout found, use default
          setLayout(defaultLayout);
        }
      } catch (error) {
        console.error('Error loading layout:', error);
        setLayout(defaultLayout);
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [user, pageType]);

  // Save layout configuration
  const saveLayout = async (newLayout: DashboardLayout['layout_config']) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_dashboard_layouts')
        .upsert({
          user_id: user.id,
          page_type: pageType,
          layout_config: newLayout,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,page_type'
        });

      if (error) {
        console.error('Error saving layout:', error);
        throw error;
      }

      setLayout(newLayout);
    } catch (error) {
      console.error('Error saving layout:', error);
      throw error;
    }
  };

  // Update section order
  const updateSectionOrder = (sectionId: string, newOrder: number) => {
    if (!layout) return;

    const updatedSections = layout.sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, order: newOrder };
      }
      return section;
    }).sort((a, b) => a.order - b.order);

    const newLayout = { ...layout, sections: updatedSections };
    saveLayout(newLayout);
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId: string) => {
    if (!layout) return;

    const updatedSections = layout.sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, visible: !section.visible };
      }
      return section;
    });

    const newLayout = { ...layout, sections: updatedSections };
    saveLayout(newLayout);
  };

  // Reorder sections (for drag and drop)
  const reorderSections = (fromIndex: number, toIndex: number) => {
    if (!layout) return;

    const sections = [...layout.sections];
    const [movedSection] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, movedSection);

    // Update order numbers
    const updatedSections = sections.map((section, index) => ({
      ...section,
      order: index
    }));

    const newLayout = { ...layout, sections: updatedSections };
    saveLayout(newLayout);
  };

  return {
    layout,
    loading,
    updateSectionOrder,
    toggleSectionVisibility,
    reorderSections,
    saveLayout
  };
};