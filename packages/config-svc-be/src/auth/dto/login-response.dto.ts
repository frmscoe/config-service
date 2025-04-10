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
  })
  refresh_token: string;

  @ApiProperty({ example: 1800 })
  refresh_expires_in: number;

  @ApiProperty({ example: 'ID_TOKEN_HERE', description: 'ID token for OpenID Connect' })
  id_token: string;
}
