export const QUERY_KEYS = {
  businessActive: ['business.active'] as const,
  employees: (businessId: string | null | undefined, filters?: unknown) =>
    ['employees', businessId ?? null, filters ?? null] as const,
  orders: (businessId: string | null | undefined, filters?: unknown) =>
    ['orders', businessId ?? null, filters ?? null] as const,
  employeeBranches: (employeeId: string | null | undefined) =>
    ['employee_branches', employeeId ?? null] as const,
} as const;

export type EmployeesKey = ReturnType<typeof QUERY_KEYS.employees>;
export type OrdersKey = ReturnType<typeof QUERY_KEYS.orders>;
