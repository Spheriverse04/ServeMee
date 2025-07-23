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
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as admin from 'firebase-admin';
import { UserRole } from './roles/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getProfile(firebaseUid: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { firebaseUid },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Registers a new user in your application's database only.
   * This assumes the Firebase user is created on the frontend.
   * @param registerUserDto The registration data including firebaseUid, email, etc.
   * @returns The created User entity.
   */
  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    // Destructure firebaseUid along with other fields (fullName removed)
    const { firebaseUid, email, phoneNumber, role, displayName } = registerUserDto;

    // Check if user already exists in your database based on Firebase UID, email, or phone number
    let existingUser = await this.userRepository.findOne({ where: { firebaseUid } });
    if (existingUser) {
      throw new ConflictException('User with this Firebase UID already exists in database.');
    }

    // You might also want to check for existing email or phone number if they are unique
    existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    if (phoneNumber) {
      existingUser = await this.userRepository.findOne({ where: { phoneNumber } });
      if (existingUser) {
        throw new ConflictException('User with this phone number already exists.');
      }
    }

    // Create and save the new user
    const newUser = this.userRepository.create({
      firebaseUid,
      email,
      displayName, // Ensure this maps to your database's display_name column
      phoneNumber,
      role,
      isActive: true, // Default to active
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      // It's good practice to log the full error for debugging on the server
      console.error('Database save error during registration:', error);
      // Re-throw a more specific error if needed, or a generic 500
      throw new InternalServerErrorException('Failed to register user due to a database error.');
    }
  }

  /**
   * Validates a Firebase ID token and ensures the user exists in your database.
   * Creates a new user entry if they don't exist.
   * @param idToken The Firebase ID token.
   * @returns The User entity from your database.
   */
  async validateAndCreateUser(idToken: string, role?: UserRole, displayName?: string, email?: string): Promise<User> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebaseUid = decodedToken.uid;
      email = email || decodedToken.email; // Use provided email or from token

      let user = await this.userRepository.findOne({ where: { firebaseUid } });

      if (!user) {
        // If user doesn't exist in your database, create them
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
  
  async updateProfile(firebaseUid: string, dto: UpdateProfileDto): Promise<User> {
  const user = await this.userRepository.findOne({ where: { firebaseUid } });
  if (!user) {
    throw new Error('User not found');
  }

  Object.assign(user, dto);
  return this.userRepository.save(user);
}
}
