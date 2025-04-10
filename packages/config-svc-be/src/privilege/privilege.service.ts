// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { validateTokenAndClaims } from '@tazama-lf/auth-lib';

export type PrivilegeType = {
  privId: string;
  labelName: string;
  description: string;
};


@Injectable()
export class PrivilegeService {
  async validateTokenAndClaims(
    token: string,
    requiredPrivileges: string[]
  ): Promise<{ valid: boolean; result?: Record<string, boolean> }> {
    try {
      const result = await validateTokenAndClaims(token, requiredPrivileges);

      const hasAllPrivileges = requiredPrivileges.every(
        (priv) => result[priv] === true
      );

      return {
        valid: hasAllPrivileges,
        result,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to validate privileges');
    }
  }
}
