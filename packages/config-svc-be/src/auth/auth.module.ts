// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserMappingModule } from '../user-mapping/user-mapping.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrivilegeModule } from '../privilege/privilege.module'; 

@Module({
  imports: [
    UserMappingModule,
    PrivilegeModule, 
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
  ],
})
export class AuthModule {}