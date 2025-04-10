// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Module } from '@nestjs/common';
import { ArangoDatabaseService } from './arango-database.service';

@Module({
  controllers: [],
  providers: [ArangoDatabaseService],
  exports: [ArangoDatabaseService],
})
export class ArangoDatabaseModule {}
