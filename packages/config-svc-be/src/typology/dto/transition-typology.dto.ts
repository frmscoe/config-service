// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TypologyStateEnum } from '../enums/typology-state.enum'; // Corrected import path for backend

export class TransitionTypologyDto {
  @IsEnum(TypologyStateEnum, { message: `state must be one of the following values: ${Object.values(TypologyStateEnum).join(', ')}` })
  @IsNotEmpty()
  @ApiProperty({ enum: TypologyStateEnum, description: 'The target state for the typology' })
  state: TypologyStateEnum;
}