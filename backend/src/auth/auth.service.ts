// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { FirebaseService } from '../config/firebase/firebase.service';
import * as admin from 'firebase-admin'; // Keep this import for admin.auth() methods
import { UpdateProfileDto } from './dto/update-profile.dto';
import { LoginDto } from './dto/login.dto'; // Import LoginDto

@Injectable()
export class AuthService {
  private firebaseAuth: admin.auth.Auth;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private firebaseService: FirebaseService,
  ) {
    this.firebaseAuth = this.firebaseService.getAuth();
  }

  async registerUserAfterPhoneVerification(
    phoneNumber: string,
    firebaseUid: string,
    fullName: string,
    role: string,
    username?: string,
    email?: string,
  ): Promise<User> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: [{ firebaseUid: firebaseUid }, { phoneNumber: phoneNumber }],
      });

      if (existingUser) {
        throw new ConflictException(
          'User with this phone number or Firebase UID already exists.',
        );
      }

      const newUser = this.usersRepository.create({
        firebaseUid,
        phoneNumber,
        fullName,
        role,
        username,
        email,
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException('Could not register user.');
    }
  }

  /**
   * Verifies a Firebase ID Token received from the client and retrieves local user details.
   * This is the recommended backend login flow for Firebase Auth.
   * @param idToken The Firebase ID Token received from the client.
   * @returns An object containing the Firebase ID Token and local user details.
   */
  async login(idToken: string): Promise<{ accessToken: string; user: User }> {
    try {
      // 1. Verify the Firebase ID Token using the Admin SDK
      // This step is redundant if FirebaseAuthGuard is used on this endpoint
      // but serves as a safety check if this method is called independently.
      const decodedToken = await this.firebaseAuth.verifyIdToken(idToken);
      const firebaseUid = decodedToken.uid;

      // 2. Retrieve local user record using firebaseUid
      const localUser = await this.usersRepository.findOne({ where: { firebaseUid: firebaseUid } });

      if (!localUser) {
        throw new NotFoundException('User record not found in local database. Please register.');
      }

      // Return the original ID Token as the accessToken and the local user object
      return { accessToken: idToken, user: localUser };

    } catch (error) {
      // Handle Firebase specific errors during token verification
      if (error.code) {
        switch (error.code) {
          case 'auth/id-token-expired':
          case 'auth/argument-error':
          case 'auth/invalid-credential':
            throw new UnauthorizedException('Invalid or expired authentication token.');
          default:
            console.error('Firebase Auth Token Verification Error:', error.code, error.message);
            throw new InternalServerErrorException('Authentication failed due to an unexpected error.');
        }
      }
      console.error('Error during login (token verification):', error);
      throw new InternalServerErrorException('Could not log in.');
    }
  }


  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { firebaseUid } });
  }

  async updateUserProfile(userId: string, updateData: UpdateProfileDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    Object.assign(user, updateData);

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new InternalServerErrorException('Could not update user profile.');
    }
  }

}
