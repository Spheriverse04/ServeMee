// src/auth/roles/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../user/user.entity'; // Assuming your User entity path
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the metadata set by @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Check the handler method
      context.getClass(),   // Check the controller class
    ]);

    if (!requiredRoles) {
      // If no @Roles() decorator is present, allow access
      return true;
    }

    // Get the user from the request.
    // Assuming FirebaseAuthGuard has already run and attached the user to request.user
    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    if (!user) {
        // This case should ideally not happen if FirebaseAuthGuard runs first,
        // but it's a good safeguard.
        return false; // No user, no authorization.
    }
    console.log(`[RolesGuard] User Role: ${user.role}, Required Roles: ${requiredRoles.join(', ')}`); // ADD THIS LINE
     const hasRequiredRole = requiredRoles.some((role) => user.role === role);
    console.log(`[RolesGuard] Role check result: ${hasRequiredRole}`); // <-- ADD THIS LINE
	
    // Check if the user's role is included in the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
