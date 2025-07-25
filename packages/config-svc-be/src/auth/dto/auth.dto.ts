// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    example: '1234',
    description: 'Client identifier for the user',
  })
  @IsOptional()
  clientId?: string | null;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email or username of the user',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    example: ['Config Service Viewer'],
    description: 'List of realm roles assigned to the user',
  })
  @IsArray()
  @IsOptional()
  realmRoles?: string[];

  @ApiProperty({
    example: ['SECURITY_CREATE_RULE', 'SECURITY_GET_RULE'],
    description: 'List of client roles (privileges) granted to the user',
  })
  @IsArray()
  @IsOptional()
  clientRoles?: string[];

  @ApiProperty({
    example: ['admin', 'editor'],
    description: 'List of privileges assigned to the user',
  })
  @IsArray()
  privileges: string[];

  // Allow additional properties dynamically
  [key: string]: any;
}

