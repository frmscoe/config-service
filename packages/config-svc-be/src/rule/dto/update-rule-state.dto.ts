// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateRuleStateDto {
  @ApiProperty({
    example: '10_PENDING_REVIEW',
    description: 'The new lifecycle state for the rule',
  })
  @IsString()
  state: string;
}
