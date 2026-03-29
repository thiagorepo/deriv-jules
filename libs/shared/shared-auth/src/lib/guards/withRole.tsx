/**
 * withRole HOF - Role-based access control
 */

import type { UserRole } from '@org/shared-types';

export interface WithRoleProps {
  requiredRoles?: UserRole[];
}

export function withRole<P extends WithRoleProps>(
  roles: UserRole[],
  Component: React.ComponentType<P>,
) {
  return function RoleProtectedComponent(props: Omit<P, keyof WithRoleProps>) {
    // Implementation handled by consumer
    return null;
  };
}
