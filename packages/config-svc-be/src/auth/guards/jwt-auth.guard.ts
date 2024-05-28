import { ConsoleLogger } from '@mojaloop/logging-bc-public-types-lib';
import { TokenHelper } from '@mojaloop/security-bc-client-lib';
import { ITokenHelper } from '@mojaloop/security-bc-public-types-lib';
import { MLKafkaJsonConsumer } from '@mojaloop/platform-shared-lib-nodejs-kafka-client-lib';

import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AUTH_N_SVC_JWKS_URL,
  AUTH_N_TOKEN_AUDIENCE,
  AUTH_N_TOKEN_ISSUER_NAME,
  KAFKA_URL,
  INSTANCE_ID,
} from '../../constants';

export class JwtAuthGuard implements CanActivate {
  constructor() {}

  initializeTokenHelper() {
    const logger = new ConsoleLogger(); // create a logger - see logging-bc client
    const tokenHelper = new TokenHelper(
      AUTH_N_SVC_JWKS_URL,
      logger,
      AUTH_N_TOKEN_ISSUER_NAME,
      AUTH_N_TOKEN_AUDIENCE,
      new MLKafkaJsonConsumer(
        {
          kafkaBrokerList: KAFKA_URL,
          autoOffsetReset: 'earliest', // Use earliest so we recreate the list on apps restarts
          kafkaGroupId: INSTANCE_ID, // Should be an instance specific id, not common
        },
        logger,
      ),
    );

    tokenHelper.init();
    return tokenHelper;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenHelper: ITokenHelper = this.initializeTokenHelper();
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    await tokenHelper.verifyToken(token);
    const payload =
      await tokenHelper.getCallSecurityContextFromAccessToken(token);
    if (!payload) throw new UnauthorizedException();
    const { clientId, username, participantRoleIds, platformRoleIds } = payload;
    request['user'] = {
      clientId,
      username,
      participantRoleIds,
      platformRoleIds,
    };
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
