// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';

export class Case {
  @ApiProperty()
  subRuleRef: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  reason: string;
}
