// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StateEnum } from '../../rule/schema/rule.schema'; // Assuming StateEnum is here

export class TransitionRuleConfigDto {
  @ApiProperty({
    description: 'The new state to transition the rule configuration to.',
    enum: StateEnum, // Use the enum for allowed values
    example: StateEnum['10_PENDING_REVIEW'],
  })
  @IsNotEmpty()
  @IsEnum(StateEnum, {
    message: `state must be a valid enum value: ${Object.values(StateEnum).join(', ')}`,
  })
  state: StateEnum;
}