// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';
import * as crypto from 'crypto';

import { loggerService } from '../logger'; // Adjust path if necessary
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor() {}

  async login(createAuthDto: CreateAuthDto): Promise<LoginResponseDto> {
    const msgId = crypto.randomUUID();
    const service = 'AuthService.login';

    try {
      const response = await axios.post(
        'http://localhost:3020/v1/auth/login',
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

      // Console fallback
      console.log('LoggerService triggered: User logged in', {
        user: createAuthDto.username,
        msgId,
        timestamp: new Date().toISOString(),
      });

      // Log successful login
      loggerService.log(
        `User "${createAuthDto.username}" successfully logged in.`,
        service,
        msgId,
      );

      return response.data;
    } catch (error) {
      // Console fallback
      console.error('LoggerService triggered: Login failed', {
        user: createAuthDto.username,
        msgId,
        timestamp: new Date().toISOString(),
        error: error?.message,
      });

      // Log failed login attempt
      loggerService.error(
        `Failed login attempt for user "${createAuthDto.username}".`,
        error,
        service,
        msgId,
      );

      throw new BadRequestException(
        error?.response?.data?.message || 'Authentication failed',
      );
    }
  }

  async userProfile(req: Request): Promise<AuthDto> {
    const user = req['user'];

    if (!user) {
      throw new BadRequestException('User information not found in request');
    }

    return {
      ...user,
      privileges: user.roles || user.privileges || [],
    };
  }
}
