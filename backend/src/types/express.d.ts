// src/types/express.d.ts
import { Request } from 'express';
import * as admin from 'firebase-admin'; // For admin.auth.DecodedIdToken type
import { User } from '../user/user.entity'; // For your User entity type (adjust path if your user.entity.ts is elsewhere relative to this file)

// Extend the Express Request interface to include our custom properties
declare global {
  namespace Express {
    interface Request {
      firebaseUser?: admin.auth.DecodedIdToken; // Decoded Firebase ID Token payload
      user?: User; // Your local database User entity
    }
  }
}
