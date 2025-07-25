// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateExitConditionDto } from './create-exit-condition.dto';

// Extend CreateExitConditionDto to include properties from the database schema
// and any derived properties for API responses.
export class ExitConditionDto extends CreateExitConditionDto {
  @ApiProperty({ description: 'Unique identifier for the exit condition, e.g., .x00' })
  @IsString()
  id: string;

  @ApiProperty({ enum: ['System Default', 'User Created'], description: 'Indicates if the condition is system-provided or user-defined' })
  @IsString() // This will actually be 'System Default' | 'User Created'
  label: 'System Default' | 'User Created';

  @ApiPropertyOptional({ description: 'The owner ID for user-created conditions' })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiProperty({ description: 'Timestamp when the condition was created' })
  @IsString() // Using string for ISO date format
  createdAt: string;

  @ApiProperty({ description: 'Timestamp when the condition was last updated' })
  @IsString() // Using string for ISO date format
  updatedAt: string;

  @ApiProperty({ description: 'ID of the user who created this condition' })
  @IsString()
  createdBy: string;

  @ApiProperty({ description: 'ID of the user who last updated this condition' })
  @IsString()
  updatedBy: string;

  @ApiPropertyOptional({ description: 'Timestamp when the condition was soft-deleted' })
  @IsString()
  @IsOptional()
  deletedAt?: string;

  // Derived properties for API response
  @ApiProperty({ description: 'True if this is a System Default condition' })
  @IsBoolean()
  isSystemDefault: boolean;

  @ApiProperty({ description: 'True if this is a User Created condition' })
  @IsBoolean()
  isUserDefault: boolean; // Renamed from userDefined to be consistent with label values

  @ApiProperty({ description: 'True if this condition can be edited by the user' })
  @IsBoolean()
  userDefined: boolean; // Keep for backward compatibility if needed, but isUserDefault is more precise

  @ApiPropertyOptional({ description: 'Number of users for whom this is a default exit condition' })
  @IsNumber()
  @IsOptional()
  usersWithThisDefault?: number;
}