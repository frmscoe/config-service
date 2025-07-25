// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpdateExitConditionDto {
  @ApiProperty({ example: '.X020' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Updated reason for exit condition' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ example: 'Detailed description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'User Created', enum: ['User Created', 'System Default'] })
  @IsString()
  @IsOptional()
  label?: 'User Created' | 'System Default';

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isUserDefault?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isSystemDefault?: boolean;
}
