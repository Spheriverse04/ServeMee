import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceProvider } from './service-provider.entity';
import { Locality } from '../locality/locality.entity';
import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderController } from './service-provider.controller';
import { AuthModule } from '../auth/auth.module'; // ✅ Import AuthModule

@Module({
  imports: [
  	TypeOrmModule.forFeature([ServiceProvider, Locality]),
  	 AuthModule, 	
  	],
  providers: [ServiceProviderService],
  controllers: [ServiceProviderController],
  exports: [ServiceProviderService],
})
export class ServiceProviderModule {}

