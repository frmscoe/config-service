import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({ example: null })
  scope: string | null;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI.....JWT_token.....',
    description: 'Access token issued by the server',
  })
  access_token: string;

  @ApiProperty({ example: 604800 })
  expires_in: number;

  @ApiProperty({ example: null })
  refresh_token: string | null;

  @ApiProperty({ example: null })
  refresh_token_expires_in: number | null;
}
