// backend/src/locality/locality.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locality } from './locality.entity';
import { LocalityService } from './locality.service';
import { LocalityController } from './locality.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Locality]),
    AuthModule,
  ],
  controllers: [LocalityController],
  providers: [LocalityService],
  exports: [LocalityService],
})
export class LocalityModule {}