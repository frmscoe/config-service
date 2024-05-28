import { Injectable } from '@nestjs/common';
import { ConsoleLogger } from '@mojaloop/logging-bc-public-types-lib';
import {
  AuthenticatedHttpRequester,
  AuthorizationClient,
} from '@mojaloop/security-bc-client-lib';
import {
  APP_NAME,
  APP_VERSION,
  AUTH_N_SVC_TOKEN_URL,
  AUTHORIZATION_BASEURL,
  BC_NAME,
  INSTANCE_ID,
  KAFKA_URL,
  SVC_CLIENT_ID,
  SVC_CLIENT_SECRET,
} from '../constants';
import { MLKafkaJsonConsumer } from '@mojaloop/platform-shared-lib-nodejs-kafka-client-lib';

export type PrivilegeType = {
  privId: string;
  labelName: string;
  description: string;
};

@Injectable()
export class PrivilegeService {
  async privilegeConnection(): Promise<AuthorizationClient> {
    const logger = new ConsoleLogger();
    const authRequester = new AuthenticatedHttpRequester(
      logger,
      AUTH_N_SVC_TOKEN_URL,
    );
    authRequester.setAppCredentials(SVC_CLIENT_ID, SVC_CLIENT_SECRET);
    const messageConsumer = new MLKafkaJsonConsumer(
      { kafkaBrokerList: KAFKA_URL, kafkaGroupId: INSTANCE_ID },
      logger,
    );
    return new AuthorizationClient(
      BC_NAME,
      APP_NAME,
      APP_VERSION,
      AUTHORIZATION_BASEURL,
      logger,
      authRequester,
      messageConsumer,
    );
  }
}
