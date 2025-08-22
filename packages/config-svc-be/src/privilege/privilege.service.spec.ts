// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { UnauthorizedException } from '@nestjs/common';
import { PrivilegeService } from './privilege.service';

// Mock the auth-lib module
jest.mock('@tazama-lf/auth-lib', () => ({
  validateTokenAndClaims: jest.fn(),
}));

// Import the mocked function
import { validateTokenAndClaims } from '@tazama-lf/auth-lib';
const mockedValidateTokenAndClaims = validateTokenAndClaims as jest.Mock;

describe('PrivilegeService', () => {
  let service: PrivilegeService;

  beforeEach(() => {
    service = new PrivilegeService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTokenAndClaims', () => {
    const mockToken = 'fake-token';
    const requiredPrivileges = ['PRIV_1', 'PRIV_2'];

    // ACL-003a
    it('should return valid: true if user has all required privileges', async () => {
      mockedValidateTokenAndClaims.mockResolvedValue({
        PRIV_1: true,
        PRIV_2: true,
      });

      const result = await service.validateTokenAndClaims(
        mockToken,
        requiredPrivileges
      );

      expect(result.valid).toBe(true);
      expect(result.result).toEqual({ PRIV_1: true, PRIV_2: true });
    });

    // ACL-003b
    it('should return valid: false if user lacks some privileges', async () => {
      mockedValidateTokenAndClaims.mockResolvedValue({
        PRIV_1: true,
        PRIV_2: false,
      });

      const result = await service.validateTokenAndClaims(
        mockToken,
        requiredPrivileges
      );

      expect(result.valid).toBe(false);
      expect(result.result).toEqual({ PRIV_1: true, PRIV_2: false });
    });

    // ACL-003c
    it('should throw UnauthorizedException if validation fails', async () => {
      mockedValidateTokenAndClaims.mockRejectedValue(new Error('Token error'));

      await expect(
        service.validateTokenAndClaims(mockToken, requiredPrivileges)
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUserPrivileges', () => {
    const mockToken = 'test-token';

    it('should return an array of granted privileges', async () => {
      mockedValidateTokenAndClaims.mockResolvedValue({
        PRIV_VIEW: true,
        PRIV_EDIT: true,
        PRIV_DELETE: false,
      });

      const privileges = await service.getUserPrivileges(mockToken);

      expect(privileges).toEqual(['PRIV_VIEW', 'PRIV_EDIT']);
    });

    // ACL-004a
    it('should return an empty array if no privileges granted', async () => {
      mockedValidateTokenAndClaims.mockResolvedValue({
        PRIV_VIEW: false,
        PRIV_EDIT: false,
      });

      const privileges = await service.getUserPrivileges(mockToken);

      expect(privileges).toEqual([]);
    });

    // ACL-004b
    it('should throw UnauthorizedException if validation fails', async () => {
      mockedValidateTokenAndClaims.mockRejectedValue(new Error('Token error'));

      await expect(service.getUserPrivileges(mockToken)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

});
