// src/temp-test-script.ts
import { Repository } from 'typeorm';
import { User } from './user/user.entity'; // Adjust path if necessary
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Adjust path if necessary, ensure AppModule is correctly importing AuthModule with User entity
import { UserRole } from './auth/roles/roles.enum'; // Import UserRole enum

async function testUserRepositoryCreate() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // Note: If 'UserRepository' token doesn't work, you might need to use `get(getRepositoryToken(User))`
  // Ensure your AppModule properly registers UserRepository if you're getting it by string token.
  // A safer way is: app.get<Repository<User>>(getRepositoryToken(User));
  const userRepository = app.get<Repository<User>>('UserRepository');

  try {
    console.log('Attempting to create a temporary user...');
    const testUser = userRepository.create({
      firebaseUid: 'temp-test-firebase-uid',
      email: 'temp.test@example.com',
      fullName: 'Temp Test User',
      role: UserRole.CONSUMER, // Changed 'consumer' to UserRole.CONSUMER
      isActive: true,
      displayName: 'Temp Test Display', // Added displayName as it's nullable but good practice to provide
    });
    console.log('Temporary user created successfully (in memory):', testUser);
    // await userRepository.save(testUser); // Uncomment to save to DB for testing
    console.log('Test successful: firebaseUid recognized.');
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await app.close();
  }
}

testUserRepositoryCreate();
