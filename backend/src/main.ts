// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin'; // Import firebase-admin
import * as path from 'path'; // Import path module

// Define the path to your service account key file
const serviceAccountPath = path.resolve(__dirname, '../firebase-admin-sdk.json');

// Initialize Firebase Admin SDK globally BEFORE NestJS app creation
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
    console.log('Firebase Admin SDK initialized globally in main.ts.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    process.exit(1); // Exit if Firebase initialization fails
  }
} else {
  console.log('Firebase Admin SDK already initialized globally (likely during hot-reload).');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Add global API prefix if desired, e.g., app.setGlobalPrefix('api');
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
