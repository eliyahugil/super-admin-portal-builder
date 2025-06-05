
export function getTableName(moduleRoute: string, businessId: number | string): string {
  return `${moduleRoute}_${businessId}`;
}

export function getModuleTableName(moduleName: string, customerId: number): string {
  const sanitized = moduleName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return `custom_${sanitized}_${customerId}`;
}
