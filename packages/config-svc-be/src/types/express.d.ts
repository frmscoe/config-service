// <!-- SPDX-License-Identifier: Apache-2.0 -->
export {};

declare global {
  namespace Express {
    interface Request {
      token?: string;
      user?: {
        clientId: string | null;
        username: string;
        platformRoleIds: string[];
        privileges: string[];
        validatedPrivileges?: Record<string, boolean>;
        [key: string]: any; // for any extra fields in the token
      };
    }
  }
}
