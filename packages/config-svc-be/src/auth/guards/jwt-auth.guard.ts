// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserEmailMappingService } from '../../user-mapping/user-email-mapping.service';
import { PrivilegeService } from '../../privilege/privilege.service'; // <--- IMPORT THIS LINE

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly userEmailMappingService: UserEmailMappingService,
    private readonly privilegeService: PrivilegeService, // <--- INJECT PrivilegeService HERE
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      // 1. Perform full token validation using PrivilegeService
      // This will verify the token's signature and check its expiration.
      // If validation fails, PrivilegeService will throw UnauthorizedException.
      // We pass an empty array for requiredPrivileges here because JwtAuthGuard's primary role
      // is just authentication (token validity), not specific authorization claims yet.
      const { valid, result: validatedClaimsMap } = await this.privilegeService.validateTokenAndClaims(token, []);

      if (!valid) {
          // This case might occur if validateTokenAndClaims returns { valid: false }
          // instead of throwing an error for an invalid/expired token.
          throw new UnauthorizedException('Invalid or expired token (signature/expiration check failed)');
      }

      // 2. Safely decode the payload after successful validation
      // Now that the token is verified as legitimate, it's safe to decode its payload.
      const decoded: any = jwt.decode(token);

      if (!decoded || typeof decoded !== 'object') {
        // This case should ideally not be reached if validation passed, but good for robustness.
        throw new UnauthorizedException('Invalid token payload after verification');
      }

      const clientId = decoded.clientId ?? null;
      let userEmail: string = '';

      // 3. Perform database lookup only with a verified clientId
      if (clientId) {
        const mappedUser = await this.userEmailMappingService.findByClientId(clientId);
        if (mappedUser && mappedUser.email) {
          userEmail = mappedUser.email;
        } else {
          console.warn(`[JwtAuthGuard] ClientId ${clientId} found in VERIFIED token, but no email mapping found in ArangoDB.`);
          // OPTIONAL: If all authenticated users *must* have an email mapping, throw UnauthorizedException here.
          // throw new UnauthorizedException('User email mapping not found');
        }
      } else {
        console.warn(`[JwtAuthGuard] No 'clientId' found in the VERIFIED token payload. Attempting 'username' as fallback.`);
        if (decoded.username) {
            userEmail = decoded.username;
        }
      }

      // 4. Populate request.user with data from the verified token
      request['token'] = token; // Keep the raw token
      request['user'] = {
        clientId: clientId,
        username: userEmail, // This will now contain the email from ArangoDB, for a VERIFIED token
        platformRoleIds: [], // Placeholder as before
        privileges: decoded.claims || decoded.privileges || [], // Use claims from the VERIFIED token payload
        validatedPrivileges: validatedClaimsMap, // Optionally store the detailed validation result
      };

      return true; // Token is authenticated and user data is populated
    } catch (err) {
      // Catch any UnauthorizedException re-thrown by PrivilegeService or other errors
      if (err instanceof UnauthorizedException) {
        throw err; // Re-throw NestJS UnauthorizedException as is
      }
      throw new UnauthorizedException(`Authentication failed during token processing: ${err.message}`);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}