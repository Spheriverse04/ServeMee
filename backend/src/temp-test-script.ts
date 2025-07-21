// src/temp-test-script.ts (or similar path)
import { Repository } from 'typeorm';
import { User } from './user/user.entity'; // Adjust path if necessary
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Adjust path if necessary, ensure AppModule is correctly importing AuthModule with User entity

async function testUserRepositoryCreate() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>('UserRepository'); // Get by token

  try {
    console.log('Attempting to create a temporary user...');
    const testUser = userRepository.create({
      firebaseUid: 'temp-test-firebase-uid',
      email: 'temp.test@example.com',
      fullName: 'Temp Test User',
      role: 'consumer', // Or any valid UserRole string
      isActive: true,
    });
    console.log('Temporary user created successfully (in memory):', testUser);
    // await userRepository.save(testUser); // Don't save to DB for this test unless you want to
    console.log('Test successful: firebaseUid recognized.');
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await app.close();
  }
}

testUserRepositoryCreate();
