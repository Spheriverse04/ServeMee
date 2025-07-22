// backend/src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import * as admin from 'firebase-admin'; // Keep this for other Firebase Admin SDK uses (like token verification)
import { UserRole } from './roles/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Registers a new user in your application's database only.
   * This assumes the Firebase user is created on the frontend.
   * @param registerUserDto The registration data including firebaseUid, email, etc.
   * @returns The created User entity.
   */
  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    // Destructure firebaseUid along with other fields
    const { firebaseUid, email, fullName, phoneNumber, role, displayName } = registerUserDto;

    // Check if user already exists in your database based on Firebase UID, email, or phone number
    let existingUser = await this.userRepository.findOne({ where: { firebaseUid } });
    if (existingUser) {
      throw new ConflictException('User with this Firebase UID already exists in database.');
    }
    if (email) {
      existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('User with this email already exists in database.');
      }
    }
    if (phoneNumber) {
      existingUser = await this.userRepository.findOne({ where: { phoneNumber } });
      if (existingUser) {
        throw new ConflictException('User with this phone number already exists in database.');
      }
    }

    try {
      // Create user in your local database using the firebaseUid provided by the frontend
      const newUser = this.userRepository.create({
        firebaseUid, // Use the UID received from the frontend
        email,
        fullName,
        displayName,
        phoneNumber,
        role,
        isActive: true,
      });

      await this.userRepository.save(newUser);
      console.log(`User ${newUser.email} registered with Firebase UID: ${firebaseUid} in database.`);
      return newUser;
    } catch (error: any) {
      console.error('Error during backend database user registration:', error);
      throw new InternalServerErrorException('Failed to register user in database.');
    }
  }

  // ... (keep the validateAndCreateUser and other methods as they are)
  /**
   * This method is called after Firebase ID token verification
   * It ensures the user exists in your local database
   * and creates them if they don't, based on the Firebase ID token.
   * @param firebaseUid The Firebase UID from the authenticated token.
   * @param email The email from the Firebase token (optional).
   * @param displayName The display name from the Firebase token (optional).
   * @returns The User entity from your database.
   */
  async validateAndCreateUser(
    firebaseUid: string,
    email?: string,
    displayName?: string,
    role?: UserRole, // Add role parameter to create user in DB
  ): Promise<User> {
    try {
      let user = await this.userRepository.findOne({ where: { firebaseUid } });

      if (!user) {
        // User does not exist in our database, create them
        // This assumes default role 'consumer' or expects it from a different flow
        // For registration via frontend, the frontend specifies role
        // For login, Firebase token doesn't directly contain role, so we need a default or another mechanism.
        const userRole = role || UserRole.CONSUMER; // Use provided role or default to CONSUMER
        user = this.userRepository.create({
          firebaseUid,
          email,
          displayName,
          role: userRole,
          isActive: true,
        } as DeepPartial<User>); // Explicitly cast
        await this.userRepository.save(user);
        console.log(`New user created in DB for Firebase UID: ${firebaseUid}`);
      } else {
        // Optionally update user data based on Firebase if needed (e.g., email, phone number)
        // For simplicity, we'll just return the existing user.
        console.log(`Existing user logged in from DB for Firebase UID: ${firebaseUid}`);
      }

      return user;
    } catch (error) {
      console.error('Error in validateAndCreateUser:', error);
      throw new InternalServerErrorException('Failed to validate or create user in database.');
    }
  }

  /**
   * Finds a user by their Firebase UID.
   * @param firebaseUid The Firebase UID of the user.
   * @returns The User entity or null if not found.
   */
  async findUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { firebaseUid } });
  }
}
