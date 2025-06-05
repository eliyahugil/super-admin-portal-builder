
import { supabase } from '@/integrations/supabase/client';
import { getTableName } from '@/utils/tableUtils';
import type { CustomTables, CustomTableKey } from '@/types/customSchemas';

export class CustomDataService<K extends CustomTableKey> {
  private module: K;
  private businessId: string | number;

  constructor(module: K, businessId: string | number) {
    this.module = module;
    this.businessId = businessId;
  }

  private tableName() {
    return getTableName(this.module, this.businessId);
  }

  async getAll(): Promise<CustomTables[K][]> {
    // Use rpc call to bypass TypeScript strict typing for dynamic tables
    const { data, error } = await supabase.rpc('select_from_table' as any, {
      table_name: this.tableName(),
      select_clause: '*'
    });

    if (error) throw error;
    return (data as CustomTables[K][]) || [];
  }

  async getById(id: string): Promise<CustomTables[K] | null> {
    const { data, error } = await supabase.rpc('select_from_table' as any, {
      table_name: this.tableName(),
      select_clause: '*',
      where_clause: `id = '${id}'`
    });

    if (error) throw error;
    return data && Array.isArray(data) && data.length > 0 ? (data[0] as CustomTables[K]) : null;
  }

  async create(payload: Partial<CustomTables[K]>): Promise<CustomTables[K]> {
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
    return data as CustomTables[K];
  }

  async update(id: string, payload: Partial<CustomTables[K]>): Promise<CustomTables[K]> {
    const updates = Object.entries(payload)
      .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
      .join(', ');

    const { data, error } = await supabase.rpc('update_table' as any, {
      table_name: this.tableName(),
      set_clause: updates,
      where_clause: `id = '${id}'`
    });

    if (error) throw error;
    return data as CustomTables[K];
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_from_table' as any, {
      table_name: this.tableName(),
      where_clause: `id = '${id}'`
    });

    if (error) throw error;
  }

  async search(field: string, value: any): Promise<CustomTables[K][]> {
    const whereClause = typeof value === 'string' 
      ? `${field} = '${value}'` 
      : `${field} = ${value}`;

    const { data, error } = await supabase.rpc('select_from_table' as any, {
      table_name: this.tableName(),
      select_clause: '*',
      where_clause: whereClause
    });

    if (error) throw error;
    return (data as CustomTables[K][]) || [];
  }

  async filter(filters: Record<string, any>): Promise<CustomTables[K][]> {
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
    return (data as CustomTables[K][]) || [];
  }
}
