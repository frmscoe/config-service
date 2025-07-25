// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Module } from '@nestjs/common';
import { UserEmailMappingService } from './user-email-mapping.service';
import { ArangoDatabaseModule } from '../arango-database/arango-database.module'; // <-- Import your existing ArangoDB module

@Module({
  imports: [ArangoDatabaseModule], // Make ArangoDatabaseService injectable into UserEmailMappingService
  providers: [UserEmailMappingService],
  exports: [UserEmailMappingService], // Export this service so other modules (like AuthModule) can use it
})
export class UserMappingModule {}