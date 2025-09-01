// <!-- SPDX-License-Identifier: Apache-2.0 -->

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

import { loggerService } from '../logger';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthDto } from './dto/auth.dto';
import { UserEmailMappingService } from '../user-mapping/user-email-mapping.service';
import { AUTH_SERVICE_URL } from '../constants';  

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userEmailMappingService: UserEmailMappingService,
  ) {}

  async login(createAuthDto: CreateAuthDto): Promise<LoginResponseDto> {
    const msgId = crypto.randomUUID();
    const service = 'AuthService.login';

    try {
      this.logger.log(`Attempting login for username: ${createAuthDto.username}`);
      const response = await axios.post<string>( // <string> ensures axios expects a raw string response body
        `${AUTH_SERVICE_URL}/v1/auth/login`, // Your external authentication service URL
        {
          username: createAuthDto.username,
          password: createAuthDto.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          maxBodyLength: Infinity,
        },
      );

      const receivedTokenString: string = response.data; // This is the raw JWT string
      this.logger.debug(`Received JWT string from external auth service: ${receivedTokenString}`);
      this.logger.log(`Received login response. Token: ${receivedTokenString ? 'Present' : 'Missing'}`);

      let clientId: string | null = null;
      let userPrivileges: string[] = [];
      let expiresInSeconds: number | null = null; // Variable to hold the calculated expiry duration

      // Decode the Token received from the external service
      try {
        const decodedTokenPayload: any = jwt.decode(receivedTokenString);
        this.logger.debug(`Decoded Token Payload from external service: ${JSON.stringify(decodedTokenPayload)}`);

        if (!decodedTokenPayload || typeof decodedTokenPayload !== 'object') {
          throw new Error("Invalid or unreadable JWT payload from external service.");
        }

        clientId = decodedTokenPayload.clientId ?? null;
        userPrivileges = decodedTokenPayload.claims || decodedTokenPayload.privileges || []; // Use 'claims' or 'privileges' from JWT

        // Calculate expires_in (in seconds) if exp and iat are present
        if (typeof decodedTokenPayload.exp === 'number' && typeof decodedTokenPayload.iat === 'number') {
          expiresInSeconds = decodedTokenPayload.exp - decodedTokenPayload.iat;
        }

      } catch (decodeError) {
        this.logger.error(`Error decoding Token received from external service: ${decodeError.message}`);
        // Consider re-throwing if token decoding is critical for proceeding
      }

      // If clientId is extracted, persist the user's email and privileges in ArangoDB
      if (clientId) {
        await this.userEmailMappingService.upsertMapping(
          clientId,
          createAuthDto.username, // This is the email entered by the user during login
          userPrivileges // Store the privileges from the external token
        );
        this.logger.log(`Persisted user ${createAuthDto.username} with clientId: ${clientId} in ArangoDB.`);
      } else {
        this.logger.warn(`Could not extract clientId from token received from external service for user ${createAuthDto.username}. Email will NOT be persisted.`);
      }

      loggerService.log(`User "${createAuthDto.username}" successfully logged in.`, service, msgId);

      // Construct the LoginResponseDto to match its definition
      const loginResponse: LoginResponseDto = {
        token_type: 'Bearer', // Common for JWT access tokens
        scope: userPrivileges.join(' '), // Join privileges/claims into a space-separated string
        access_token: receivedTokenString, // The actual JWT received is the access_token
        expires_in: expiresInSeconds !== null ? expiresInSeconds : 0, // Use calculated value, default to 0 if not available
        refresh_token: null, // Set to null as your external service does not provide this
        refresh_expires_in: null, // Set to null as your external service does not provide this
        id_token: null, // Set to null as your external service does not provide this
      };

      return loginResponse;

    } catch (error) {
      this.logger.error(`Login failed for user ${createAuthDto.username}: ${error?.response?.data?.message || error?.message}`);
      loggerService.error(`Failed login attempt for user "${createAuthDto.username}".`, error, service, msgId);
      throw new BadRequestException(error?.response?.data?.message || 'Authentication failed');
    }
  }

  // The userProfile method remains the same as before, as it processes the token
  // that's already verified and processed by JwtAuthGuard
  async userProfile(req: Request): Promise<AuthDto> {
    const user = req['user']; // This 'user' object is populated by JwtAuthGuard after token validation
    this.logger.debug(`req.user received from JwtAuthGuard: ${JSON.stringify(user)}`);

    if (!user) {
      throw new BadRequestException('User information not found in request');
    }

    let userEmail: string = user.username || '';
    let userPrivileges: string[] = user.privileges || [];

    // Retrieve email and potentially more comprehensive privileges from ArangoDB using clientId
    if (user.clientId) {
      this.logger.log(`Looking up clientId ${user.clientId} in ArangoDB.`);
      const mappedUser = await this.userEmailMappingService.findByClientId(user.clientId);
      if (mappedUser) {
        userEmail = mappedUser.email; // This gets the email from ArangoDB
        userPrivileges = mappedUser.privileges; // Use privileges from DB if preferred
        this.logger.log(`Retrieved email ${userEmail} and privileges from ArangoDB for clientId ${user.clientId}.`);
      } else {
        this.logger.warn(`ClientId ${user.clientId} NOT found in ArangoDB. Email and full privileges might be missing.`);
      }
    } else {
        this.logger.warn('No clientId found in req.user from JwtAuthGuard. Cannot lookup email/privileges in ArangoDB.');
    }

    // Construct the AuthDto response that will be sent to the frontend
    return {
      clientId: user.clientId ?? null,
      username: userEmail, // This will now contain the email retrieved from ArangoDB
      realmRoles: user.realmRoles,
      clientRoles: user.clientRoles,
      privileges: userPrivileges, // Use the retrieved/updated privileges
      // Include any other relevant properties from 'user' that are part of AuthDto
      ...user, // This spread ensures other properties from JwtAuthGuard's 'user' are included if AuthDto supports them
    } as AuthDto; // Type assertion as AuthDto might have more or less strict properties
  }

  

  async validateUser(username: string, password: string): Promise<{ username: string } | null> {
    try {
      const response = await this.login({
        username,
        password,
        client_id: 'internal', // Provide default or mock values
        client_secret: 'internal_secret',
        grant_type: 'password',
      });
      return { username };
    } catch {
      return null;
    }
  }


}