import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { PrivilegeService } from '../../privilege/privilege.service';

describe('AUTH-004: RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let privilegeService: Partial<PrivilegeService>;
  let reflector: Partial<Reflector>;

  const mockPrivilegeService = {
    validateTokenAndClaims: jest.fn(),
  };

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(() => {
    privilegeService = mockPrivilegeService;
    reflector = mockReflector;

    rolesGuard = new RolesGuard(
      reflector as Reflector,
      privilegeService as PrivilegeService,
    );
  });

  it('AUTH-004: Should allow access when no roles are required', async () => {
    mockReflector.get = jest.fn().mockReturnValue(undefined);

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({ token: 'fake-token', user: {} }),
      }),
      getHandler: () => ({}),
    };

    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('AUTH-004: Should allow access when required privileges are met', async () => {
    mockReflector.get = jest.fn().mockReturnValue(['view:data']);

    mockPrivilegeService.validateTokenAndClaims = jest.fn().mockResolvedValue({
      valid: true,
      result: { 'view:data': true },
    });

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          token: 'valid-token',
          user: { username: 'test@example.com' },
        }),
      }),
      getHandler: () => ({}),
    };

    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
    expect(mockPrivilegeService.validateTokenAndClaims).toHaveBeenCalledWith(
      'valid-token',
      ['view:data'],
    );
  });

  it('AUTH-004: Should throw if token is missing', async () => {
    mockReflector.get = jest.fn().mockReturnValue(['admin']);

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: () => ({}),
    };

    await expect(rolesGuard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
