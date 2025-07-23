// src/auth/firebase-auth/firebase-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // Import Reflector
import { FirebaseService } from '../../config/firebase/firebase.service';
import { AuthService } from '../auth.service';
import * as admin from 'firebase-admin';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../public.decorator'; // Import the key for @Public()

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private firebaseAuth: admin.auth.Auth;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private reflector: Reflector, // Inject Reflector
  ) {
    this.firebaseAuth = this.firebaseService.getAuth();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      console.log('[FirebaseAuthGuard] Route is public, skipping authentication.');
      return true; // Allow access for public routes without token verification
    }

    const request = context.switchToHttp().getRequest<Request>();
    const idToken = this.extractTokenFromHeader(request);

    if (!idToken) {
      console.log('[FirebaseAuthGuard] No token found in header (not a public route).');
      throw new UnauthorizedException('Authentication token missing.');
    }

    console.log('[FirebaseAuthGuard] Token received:', idToken.substring(0, 30) + '...');

    try {
      const decodedToken = await this.firebaseAuth.verifyIdToken(idToken);
      console.log('[FirebaseAuthGuard] Token successfully decoded for UID:', decodedToken.uid);
      console.log('[FirebaseAuthGuard] Decoded token payload:', decodedToken);

      request.firebaseUser = decodedToken;

      const user = await this.authService.findUserByFirebaseUid(decodedToken.uid);
      if (!user) {
        console.log(`[FirebaseAuthGuard] User with Firebase UID ${decodedToken.uid} not found in local DB.`);
        throw new UnauthorizedException('User not found in database.');
      }
      console.log('[FirebaseAuthGuard] User found in local DB:', user.id);
      request.user = user;

      return true;
    } catch (error) {
      console.error('[FirebaseAuthGuard] Firebase token verification failed:', error.message);
      if (error.code) {
        console.error('[FirebaseAuthGuard] Firebase Error Code:', error.code);
      }
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.header('authorization')?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
