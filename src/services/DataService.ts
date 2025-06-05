
import { supabase } from '@/integrations/supabase/client';
import { getTableName } from '@/utils/tableUtils';

export class DataService<T extends Record<string, any>> {
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
    // Use RPC to bypass strict typing for dynamic table names
    const { data, error } = await supabase.rpc('select_from_table' as any, {
      table_name: this.tableName(),
      select_clause: '*'
    });

    if (error) throw error;
    return (data as T[]) || [];
  }

  async getById(id: number | string): Promise<T | null> {
    const { data, error } = await supabase.rpc('select_from_table' as any, {
      table_name: this.tableName(),
      select_clause: '*',
      where_clause: `id = '${id}'`
    });

    if (error) throw error;
    return data && Array.isArray(data) && data.length > 0 ? (data[0] as T) : null;
  }

  async create(payload: Partial<T>): Promise<T> {
    const columns = Object.keys(payload).join(', ');
    const values = Object.values(payload).map(v => 
      typeof v === 'string' ? `'${v}'` : v
    ).join(', ');

    const { data, error } = await supabase.rpc('insert_into_table' as any, {
      table_name: this.tableName(),
      columns_list: columns,
      values_list: values
    });

    if (error) throw error;
    return data as T;
  }

  async update(id: number | string, payload: Partial<T>): Promise<T> {
    const updates = Object.entries(payload)
      .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
      .join(', ');

    const { data, error } = await supabase.rpc('update_table' as any, {
      table_name: this.tableName(),
      set_clause: updates,
      where_clause: `id = '${id}'`
    });

    if (error) throw error;
    return data as T;
  }

  async delete(id: number | string): Promise<void> {
    const { error } = await supabase.rpc('delete_from_table' as any, {
      table_name: this.tableName(),
      where_clause: `id = '${id}'`
    });

    if (error) throw error;
  }

  async search(field: string, value: any): Promise<T[]> {
    const whereClause = typeof value === 'string' 
      ? `${field} = '${value}'` 
      : `${field} = ${value}`;

    const { data, error } = await supabase.rpc('select_from_table' as any, {
      table_name: this.tableName(),
      select_clause: '*',
      where_clause: whereClause
    });

    if (error) throw error;
    return (data as T[]) || [];
  }

  async filter(filters: Record<string, any>): Promise<T[]> {
    const whereClause = Object.entries(filters)
      .map(([field, value]) => 
        typeof value === 'string' ? `${field} = '${value}'` : `${field} = ${value}`
      )
      .join(' AND ');

    const { data, error } = await supabase.rpc('select_from_table' as any, {
      table_name: this.tableName(),
      select_clause: '*',
      where_clause: whereClause
    });

    if (error) throw error;
    return (data as T[]) || [];
  }
}
