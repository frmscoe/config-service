import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class AuthDto {
  @ApiProperty({ example: '1234', description: 'Client identifier for the user' })
  @IsOptional()
  clientId: string | null;

  @ApiProperty({ example: 'user@example.com', description: 'Email or username of the user' })
  @IsString()
  username: string;

  @ApiProperty({ example: ['admin'], description: 'List of roles assigned to the user' })
  @IsArray()
  platformRoleIds: string[];

  @ApiProperty({ example: ['SECURITY_CREATE_RULE', "SECURITY_GET_RULE"], description: 'List of privileges granted to the user' })
  @IsArray()
  permissions: string[];
}
