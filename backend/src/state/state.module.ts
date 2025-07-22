// backend/src/state/state.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './state.entity';
import { StateService } from './state.service';
import { StateController } from './state.controller';
import { AuthModule } from '../auth/auth.module'; // Assuming you use AuthModule for guards

@Module({
  imports: [
    TypeOrmModule.forFeature([State]),
    AuthModule,
  ],
  controllers: [StateController],
  providers: [StateService],
  exports: [StateService], // Export if other modules (like DistrictModule) will inject StateService
})
export class StateModule {}
