// <!-- SPDX-License-Identifier: Apache-2.0 -->

import { ApiProperty } from '@nestjs/swagger';
import { ExitConditionDto } from './exit-condition.dto'; // Import your existing ExitConditionDto

export class ExitConditionResponseDto extends ExitConditionDto {
  @ApiProperty({ description: 'Indicates if the exit condition can be deleted by the user.' })
  canDelete: boolean;
}