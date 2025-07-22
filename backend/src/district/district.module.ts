// backend/src/district/district.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { District } from './district.entity';
import { DistrictService } from './district.service';
import { DistrictController } from './district.controller';
import { AuthModule } from '../auth/auth.module'; // Assuming you use AuthModule for guards

@Module({
  imports: [
    TypeOrmModule.forFeature([District]),
    AuthModule, // Include AuthModule if your controller uses FirebaseAuthGuard or RolesGuard
  ],
  controllers: [DistrictController],
  providers: [DistrictService],
  exports: [DistrictService], // Export if other modules (like LocalityModule) will inject DistrictService
})
export class DistrictModule {}
