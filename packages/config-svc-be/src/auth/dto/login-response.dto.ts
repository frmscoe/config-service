// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({ example: 'openid profile email' })
  scope: string;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI.....JWT_token.....',
    description: 'Access token issued by the server',
  })
  access_token: string;

  @ApiProperty({ example: 300 })
  expires_in: number;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI.....Refresh_token.....',
    description: 'Refresh token used to obtain a new access token',
    nullable: true // <--- IMPORTANT: Added for Swagger documentation
  })
  refresh_token: string | null; // <--- IMPORTANT: Changed to allow null

  @ApiProperty({ example: 1800, nullable: true }) // <--- IMPORTANT: Added for Swagger documentation
  refresh_expires_in: number | null; // <--- IMPORTANT: Changed to allow null

  @ApiProperty({ example: 'ID_TOKEN_HERE', description: 'ID token for OpenID Connect', nullable: true }) // <--- IMPORTANT: Added for Swagger documentation
  id_token: string | null; // <--- IMPORTANT: Changed to allow null
}