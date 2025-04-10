// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Module } from '@nestjs/common';
import { CaseService } from './case.service';
import { CaseController } from './case.controller';

@Module({
  controllers: [CaseController],
  providers: [CaseService],
})
export class CaseModule {}
