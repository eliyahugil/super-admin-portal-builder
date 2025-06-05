
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string | null;
  is_active: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
  module_config?: any;
}

export const useModuleManagement = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const filtered = modules.filter(module =>
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredModules(filtered);
  }, [searchTerm, modules]);

  const ensureEmployeeModuleExists = async () => {
    try {
      const { data: existingModule, error: checkError } = await supabase
        .from('modules')
        .select('*')
        .eq('route', '/employees')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for employee module:', checkError);
        return;
      }

      if (!existingModule) {
        console.log('Employee module not found, creating it...');
        const { error: insertError } = await supabase
          .from('modules')
          .insert({
            name: 'ניהול עובדים וסניפים',
            description: 'מודל לניהול עובדים, סניפים, משמרות ונוכחות',
            icon: '👥',
            route: '/employees',
            is_active: true,
          });

        if (insertError) {
          console.error('Error creating employee module:', insertError);
        } else {
          console.log('Employee module created successfully');
        }
      } else {
        console.log('Employee module already exists:', existingModule);
      }
    } catch (error) {
      console.error('Error in ensureEmployeeModuleExists:', error);
    }
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      
      await ensureEmployeeModuleExists();
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching modules:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את המודלים',
          variant: 'destructive',
        });
        return;
      }

      console.log('Fetched modules:', data);
      setModules(data || []);
    } catch (error) {
      console.error('Error in fetchModules:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    modules,
    filteredModules,
    searchTerm,
    setSearchTerm,
    loading,
    fetchModules,
    toast
  };
};
