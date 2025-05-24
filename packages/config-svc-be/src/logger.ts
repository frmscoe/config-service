// SPDX-License-Identifier: Apache-2.0

import { LoggerService } from '@tazama-lf/frms-coe-lib';
import { validateProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config';

const configuration = validateProcessorConfig();
export const loggerService = new LoggerService(configuration);
