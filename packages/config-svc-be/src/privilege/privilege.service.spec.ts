// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Test, TestingModule } from '@nestjs/testing';
import { PrivilegeService } from './privilege.service';
import { UnauthorizedException } from '@nestjs/common';

// Mock the validateTokenAndClaims function from the auth-lib
jest.mock('@tazama-lf/auth-lib', () => ({
  validateTokenAndClaims: jest.fn(),
}));

import { validateTokenAndClaims } from '@tazama-lf/auth-lib';

describe('PrivilegeService', () => {
  let service: PrivilegeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrivilegeService],
    }).compile();

    service = module.get<PrivilegeService>(PrivilegeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return valid true if all required privileges are present', async () => {
    const mockToken = 'mock-token';
    const requiredPrivileges = ['SECURITY_GET_RULES', 'SECURITY_CREATE_RULE'];

    (validateTokenAndClaims as jest.Mock).mockResolvedValue({
      SECURITY_GET_RULES: true,
      SECURITY_CREATE_RULE: true,
    });

    const result = await service.validateTokenAndClaims(mockToken, requiredPrivileges);

    expect(result.valid).toBe(true);
    expect(result.result).toEqual({
      SECURITY_GET_RULES: true,
      SECURITY_CREATE_RULE: true,
    });
  });

  it('should return valid false if not all required privileges are present', async () => {
    const mockToken = 'mock-token';
    const requiredPrivileges = ['SECURITY_GET_RULES', 'SECURITY_CREATE_RULE'];

    (validateTokenAndClaims as jest.Mock).mockResolvedValue({
      SECURITY_GET_RULES: true,
      SECURITY_CREATE_RULE: false,
    });

    const result = await service.validateTokenAndClaims(mockToken, requiredPrivileges);

    expect(result.valid).toBe(false);
    expect(result.result).toEqual({
      SECURITY_GET_RULES: true,
      SECURITY_CREATE_RULE: false,
    });
  });

  it('should throw UnauthorizedException if the token is invalid or validation fails', async () => {
    const mockToken = 'invalid-token';
    const requiredPrivileges = ['SOME_PRIVILEGE'];

    (validateTokenAndClaims as jest.Mock).mockRejectedValue(new Error('Token validation failed'));

    await expect(service.validateTokenAndClaims(mockToken, requiredPrivileges)).rejects.toThrow(
      UnauthorizedException
    );
  });
});
