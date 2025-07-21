// servemee/backend/src/main.ts
import 'reflect-metadata'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin'; // Import firebase-admin
import * as path from 'path'; // Import path module
import { env } from 'process';
import { ValidationPipe } from '@nestjs/common'; // Add ValidationPipe import

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

  // Enable CORS for development
  // In production, restrict 'origin' to your actual frontend domain(s).
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'], // Allow your Next.js dev server and backend itself
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow sending cookies/authorization headers
  });

  // Add global validation pipe for DTOs (important for robust API)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties that are not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
      transform: true, // Automatically transforms payloads to be instances of DTO classes
      transformOptions: {
        enableImplicitConversion: true, // Allows automatic type conversion (e.g., string to number)
      },
    }),
  );

  // Add global API prefix if desired, e.g., app.setGlobalPrefix('api');
  const port = parseInt(env.PORT || '3000', 10); // Use environment variable for port, default to 3000
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
