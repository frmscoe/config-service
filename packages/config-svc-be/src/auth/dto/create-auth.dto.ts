// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'The client identifier for the application making the request',
    example: 'config-svc-auth-lib-client',
  })
  @IsString()
  readonly client_id: string;

  @ApiProperty({
    description: 'The type of grant you are requesting',
    example: 'password',
  })
  @IsString()
  readonly grant_type: string;

  @ApiProperty({
    description: 'The username or email of the user',
    example: 'user@example.com',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'securepassword123',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    description: 'The client secret for authentication',
    example: '<client_secret>',
  })
  @IsString()
  readonly client_secret: string;
}
