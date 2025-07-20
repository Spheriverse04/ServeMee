// src/config/firebase/firebase.service.ts
import { Injectable } from '@nestjs/common'; // No OnModuleInit here anymore
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  // We're no longer initializing it here. It's assumed to be done globally.
  // The constructor is optional if no specific setup is needed.

  getAuth(): admin.auth.Auth {
    // This will return the auth instance from the globally initialized app.
    // If not initialized, Firebase Admin SDK will throw its own error,
    // which is what we want if initializeApp was missed.
    return admin.auth();
  }

  getApp(): admin.app.App {
    // Also provide access to the default app instance if needed
    return admin.app();
  }
}
