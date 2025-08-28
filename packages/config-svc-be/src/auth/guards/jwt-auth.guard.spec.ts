import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEmailMappingService } from '../../user-mapping/user-email-mapping.service';
import { PrivilegeService } from '../../privilege/privilege.service';

describe('AUTH-003: JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let privilegeService: Partial<PrivilegeService>;
  let userEmailMappingService: Partial<UserEmailMappingService>;

  const mockEmailMapping = {
    findByClientId: jest.fn().mockResolvedValue({ email: 'user@example.com' }),
  };

  const mockPrivilegeService = {
    validateTokenAndClaims: jest.fn(),
  };

  beforeEach(() => {
    userEmailMappingService = mockEmailMapping;
    privilegeService = mockPrivilegeService;

    jwtAuthGuard = new JwtAuthGuard(
      userEmailMappingService as UserEmailMappingService,
      privilegeService as PrivilegeService,
    );
  });

  it('AUTH-003: Should allow access for valid JWT token', async () => {
    const token = 'valid.jwt.token';
    const decodedPayload = {
      clientId: 'abc123',
      claims: ['read:data'],
      username: 'user@example.com',
    };

    // Mock validation
    mockPrivilegeService.validateTokenAndClaims = jest.fn().mockResolvedValue({
      valid: true,
      result: { 'read:data': true },
    });

    jest.spyOn(require('jsonwebtoken'), 'decode').mockReturnValue(decodedPayload);

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: `Bearer ${token}` },
        }),
      }),
    };

    const result = await jwtAuthGuard.canActivate(context);
    expect(result).toBe(true);
    expect(mockPrivilegeService.validateTokenAndClaims).toHaveBeenCalledWith(token, []);
  });

  it('AUTH-003: Should throw UnauthorizedException if no token', async () => {
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {}, // no authorization
        }),
      }),
    };

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('AUTH-003: Should throw UnauthorizedException if token is invalid', async () => {
    const token = 'invalid.jwt.token';
    mockPrivilegeService.validateTokenAndClaims = jest.fn().mockResolvedValue({
      valid: false,
      result: {},
    });

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: `Bearer ${token}` },
        }),
      }),
    };

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
