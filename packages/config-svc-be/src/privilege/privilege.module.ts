// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Module } from '@nestjs/common';
import { PrivilegeService } from './privilege.service';

@Module({
  providers: [PrivilegeService],
  exports: [PrivilegeService],
  controllers: [],
})
export class PrivilegeModule {}
