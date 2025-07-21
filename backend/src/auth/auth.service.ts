// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import * as admin from 'firebase-admin';
import { UserRole } from './roles/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Registers a new user in your application's database and Firebase.
   * This assumes the Firebase user is created on the backend.
   * @param registerUserDto The registration data including email, password, etc.
   * @returns The created User entity.
   */
  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password, fullName, phoneNumber, role, displayName } = registerUserDto;

    let firebaseUid: string;

    // Check if user already exists in your database based on email or phone number
    if (email) {
      const existingEmailUser = await this.userRepository.findOne({ where: { email } });
      if (existingEmailUser) {
        throw new ConflictException('User with this email already exists.');
      }
    }
    // Also check for phone number if it's provided and unique in your schema
    if (phoneNumber) {
        const existingPhoneUser = await this.userRepository.findOne({ where: { phoneNumber } });
        if (existingPhoneUser) {
            throw new ConflictException('User with this phone number already exists.');
        }
    }


    try {
      // 1. Create user in Firebase Auth
      const firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: fullName || displayName, // Use fullName or displayName for Firebase
        phoneNumber,
      });
      firebaseUid = firebaseUser.uid;

      // 2. Set custom claim for role
      await admin.auth().setCustomUserClaims(firebaseUid, { role });

      // 3. Save user to your PostgreSQL database
      const user = this.userRepository.create({
        firebaseUid,
        email,
        displayName: displayName || fullName, // Use displayName or fullName
        phoneNumber,
        fullName,
        role: role as UserRole, // Cast to UserRole
        isActive: true, // Default to active
      });

      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Error during user registration:', error);
      // Handle Firebase-specific errors or database errors
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('User with this email already exists in Firebase.');
      }
      if (error.code === 'auth/phone-number-already-exists') {
        throw new ConflictException('User with this phone number already exists in Firebase.');
      }
      throw new InternalServerErrorException('Failed to register user.');
    }
  }

  /**
   * Verifies a Firebase ID token and retrieves/creates the user in the database.
   * This is typically used after a client-side Firebase login.
   * @param idToken The Firebase ID token.
   * @returns The User entity from your database.
   */
  async verifyFirebaseToken(idToken: string): Promise<User> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebaseUid = decodedToken.uid;
      const firebaseEmail = decodedToken.email || null;
      const firebaseDisplayName = decodedToken.name || null;
      const firebasePhoneNumber = decodedToken.phone_number || null;
      const firebaseRole = (decodedToken.role as UserRole) || UserRole.CONSUMER; // Default to consumer

      let user = await this.findUserByFirebaseUid(firebaseUid);

      if (!user) {
        // User doesn't exist in our DB, create them
        user = this.userRepository.create({
          firebaseUid,
          email: firebaseEmail,
          displayName: firebaseDisplayName,
          phoneNumber: firebasePhoneNumber,
          role: firebaseRole as UserRole, // Cast to UserRole
          isActive: true,
        });
        await this.userRepository.save(user);
        console.log(`New user created in DB for Firebase UID: ${firebaseUid}`);
      } else {
        // Optionally update user data based on Firebase if needed (e.g., email, phone number)
        // For simplicity, we'll just return the existing user.
        console.log(`Existing user logged in from DB for Firebase UID: ${firebaseUid}`);
      }

      return user;
    } catch (error) {
      console.error('Firebase ID token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired authentication token.');
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

  /**
   * Finds a user by their ID.
   * @param id The ID of the user.
   * @returns The User entity or null if not found.
   */
  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Finds users by role.
   * @param role The role to filter by.
   * @returns An array of User entities.
   */
  async findUsersByRole(role: UserRole): Promise<User[]> {
    return this.userRepository.find({ where: { role } });
  }
}
