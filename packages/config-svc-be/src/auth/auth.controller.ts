import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiCreatedResponse({
    description: 'Logged in successfully',
    type: LoginResponseDto,
  })
  validateUser(
    @Body() createAuthDto: CreateAuthDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(createAuthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  @ApiBearerAuth() // Indicates that this endpoint requires a Bearer Token
  @ApiOperation({
    summary: 'Get user role and privileges',
    description: 'Retrieve the profile of the currently authenticated user.',
  })
  @ApiOkResponse({ description: 'The profile of the currently authenticated user', type: AuthDto })
  getUserProfile(@Request() req): Promise<AuthDto> {
    return this.authService.userProfile(req);
  }
}
