import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'The client identifier for the application making the request',
    example: 'security-bc-ui',
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
    description: 'The email of the user',
    example: '<user_email@email.com>',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: 'The password of the user',
    example: '<user_password>',
  })
  @IsString()
  readonly password: string;
}
