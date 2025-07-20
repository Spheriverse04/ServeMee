// src/service/service.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
	  TypeOrmModule.forFeature([Service]),
	  AuthModule,
  ], // Make Service entity available for this module
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService], // Export ServiceService if other modules might need to inject it
})
export class ServiceModule {}
