// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Module } from '@nestjs/common';
import { ExitConditionsService } from './exit-conditions.service';
import { ExitConditionsController } from './exit-conditions.controller';
import { ArangoDatabaseModule } from 'src/arango-database/arango-database.module'; // Assuming you have this
import { PrivilegeModule } from 'src/privilege/privilege.module';
import { UserMappingModule } from 'src/user-mapping/user-mapping.module'; // Ensure this is imported and exported correctly
import { AuthModule } from 'src/auth/auth.module'; // Ensure this is imported and exported correctly
import { ExitConditionsSeeder } from './exit-conditions.seeder';

@Module({
  imports: [
    ArangoDatabaseModule,
    PrivilegeModule,
    UserMappingModule, // Make sure UserMappingModule is imported
    AuthModule, // Make sure AuthModule is imported
  ],
  controllers: [ExitConditionsController],
  providers: [ExitConditionsService, ExitConditionsSeeder],
  exports: [ExitConditionsService], // Export if other modules need to inject it
})
export class ExitConditionsModule {}