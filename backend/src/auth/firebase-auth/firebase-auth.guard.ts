// src/auth/firebase-auth/firebase-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase/firebase.service';
import { AuthService } from '../auth.service';
import * as admin from 'firebase-admin';
import { Request } from 'express';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private firebaseAuth: admin.auth.Auth;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
  ) {
    this.firebaseAuth = this.firebaseService.getAuth();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const idToken = this.extractTokenFromHeader(request);

    if (!idToken) {
      console.log('[FirebaseAuthGuard] No token found in header.'); // ADDED LOG
      throw new UnauthorizedException('Authentication token missing.');
    }

    console.log('[FirebaseAuthGuard] Token received:', idToken.substring(0, 30) + '...'); // ADDED LOG (first 30 chars)

    try {
      const decodedToken = await this.firebaseAuth.verifyIdToken(idToken);
      console.log('[FirebaseAuthGuard] Token successfully decoded for UID:', decodedToken.uid); // ADDED LOG
      console.log('[FirebaseAuthGuard] Decoded token payload:', decodedToken); // ADDED LOG

      request.firebaseUser = decodedToken;

      const user = await this.authService.findUserByFirebaseUid(decodedToken.uid);
      if (!user) {
        console.log(`[FirebaseAuthGuard] User with Firebase UID ${decodedToken.uid} not found in local DB.`); // ADDED LOG
        throw new UnauthorizedException('User not found in database.');
      }
      console.log('[FirebaseAuthGuard] User found in local DB:', user.id); // ADDED LOG
      request.user = user;

      return true;
    } catch (error) {
      console.error('[FirebaseAuthGuard] Firebase token verification failed:', error.message); // MODIFIED LOG
      // Log the full error object if it provides more details
      if (error.code) { // Firebase Admin errors often have a 'code'
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
