import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  exports: [AuthService],
  imports: [],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
