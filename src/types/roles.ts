// Centralized role typings and helpers
export type Role = 'super_admin' | 'business_admin' | 'business_user';

export const ROLES: Role[] = [
  'super_admin',
  'business_admin',
  'business_user',
];

export function toRole(input: unknown): Role {
  switch (input) {
    case 'super_admin':
    case 'business_admin':
    case 'business_user':
      return input;
    default:
      // Default fallback when unknown role strings are encountered
      return 'business_user';
  }
}
