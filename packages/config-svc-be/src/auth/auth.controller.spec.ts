import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginResponseDto } from './dto/login-response.dto';

import { UserEmailMappingService } from '../user-mapping/user-email-mapping.service';
import { PrivilegeService } from '../privilege/privilege.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

jest.mock('@tazama-lf/frms-coe-lib/lib/config', () => ({
  validateProcessorConfig: jest.fn().mockReturnValue({
    MAX_CPU: 2,
  }),
}));

jest.mock('@tazama-lf/frms-coe-lib', () => ({
  LoggerService: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('AUTH-005: AuthController - POST /auth/login', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    userProfile: jest.fn(),
  };

  const mockUserEmailMappingService = {
    findByClientId: jest.fn(),
  };

  const mockPrivilegeService = {
    validateTokenAndClaims: jest.fn().mockResolvedValue({
      valid: true,
      result: {},
    }),
  };

  const mockJwtAuthGuard = {
    canActivate: (context) => {
      const req = context.switchToHttp().getRequest();
      req.user = {
        username: 'user@example.com',
        privileges: ['read', 'write'],
      };
      return true;
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserEmailMappingService, useValue: mockUserEmailMappingService },
        { provide: PrivilegeService, useValue: mockPrivilegeService },
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('AUTH-005: Should return 201 and a token on successful login', async () => {
    const loginDto: CreateAuthDto = {
      username: 'test@example.com',
      password: 'securePassword',
      client_id: 'internal',
      client_secret: 'internal_secret',
      grant_type: 'password',
    };

    const loginResponse: LoginResponseDto = {
      token_type: 'Bearer',
      access_token: 'fake-jwt-token',
      scope: 'read write',
      expires_in: 3600,
      refresh_token: null,
      refresh_expires_in: null,
      id_token: null,
    };

    mockAuthService.login.mockResolvedValue(loginResponse);

    const result = await authController.validateUser(loginDto);

    expect(authService.login).toHaveBeenCalledWith(loginDto);
    expect(result).toEqual(loginResponse);
  });

  it('AUTH-006: Should return user profile for authenticated request', async () => {
    const mockReq = {
      user: {
        username: 'user@example.com',
        clientId: 'client123',
        claims: ['read', 'write'],
      },
    };

    const mockProfile = {
      username: 'user@example.com',
      clientId: 'client123',
      roles: ['user'],
      privileges: ['read', 'write'],
    };

    mockAuthService.userProfile.mockResolvedValue(mockProfile);

    const result = await authController.getUserProfile(mockReq);

    expect(mockAuthService.userProfile).toHaveBeenCalledWith(mockReq);
    expect(result).toEqual(mockProfile);
  });


});
