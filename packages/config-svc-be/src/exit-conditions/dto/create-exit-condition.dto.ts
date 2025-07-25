// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { IsString, IsOptional, IsIn, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';


export class CreateExitConditionDto {
  @ApiProperty({ description: 'Unique identifier for the exit condition, e.g., .x00' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Brief reason for the exit condition' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Detailed description of the exit condition' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['System Default', 'User Created'],
    description: 'Indicates if the condition is system-provided or user-defined (default: User Created)',
  })
  @IsOptional()
  @IsIn(['System Default', 'User Created'])
  label?: 'System Default' | 'User Created';

  @ApiPropertyOptional({
    description: 'Optional custom identifier for the exit condition. If provided, it might be used as the document key or an alternative ID.',
    example: 'your-custom-exit-id'
  })
  @IsString()
  @IsOptional()
  exitId?: string;

  @ApiPropertyOptional({
    description: 'Indicates if this condition is a default for users. Defaults to false.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean) 
  isUserDefault?: boolean = false; 
}
