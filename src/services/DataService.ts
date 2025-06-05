
import { supabase } from '@/integrations/supabase/client';
import { getTableName } from '@/utils/tableUtils';

export class DataService<T> {
  private moduleRoute: string;
  private businessId: number | string;

  constructor(moduleRoute: string, businessId: number | string) {
    this.moduleRoute = moduleRoute;
    this.businessId = businessId;
  }

  private tableName(): string {
    return getTableName(this.moduleRoute, this.businessId);
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName())
      .select('*');

    if (error) throw error;
    return (data as T[]) || [];
  }

  async getById(id: number | string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName())
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as T | null;
  }

  async create(payload: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName())
      .insert([{ ...payload }])
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async update(id: number | string, payload: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName())
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async delete(id: number | string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName())
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async search(field: string, value: any): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName())
      .select('*')
      .eq(field, value);

    if (error) throw error;
    return (data as T[]) || [];
  }

  async filter(filters: Record<string, any>): Promise<T[]> {
    let query = supabase.from(this.tableName()).select('*');
    
    Object.entries(filters).forEach(([field, value]) => {
      query = query.eq(field, value);
    });

    const { data, error } = await query;

    if (error) throw error;
    return (data as T[]) || [];
  }
}
