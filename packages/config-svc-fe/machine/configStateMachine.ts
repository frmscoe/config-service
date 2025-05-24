// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { createMachine } from 'xstate';

export const configStateMachine = createMachine({
  id: 'artefactLifecycle',
  initial: '01_DRAFT',
  predictableActionArguments: true,
  states: {
    '00_NEW': {
      on: {
        SAVE_DRAFT: '01_DRAFT',
        SUBMIT_REVIEW: '10_PENDING_REVIEW',
      },
    },
    '01_DRAFT': {
      on: {
        SUBMIT_REVIEW: '10_PENDING_REVIEW',
        ABANDON: '90_ABANDONED',
      },
    },
    '10_PENDING_REVIEW': {
      on: {
        APPROVE: '20_APPROVED',
        REJECT: '11_REJECTED',
        WITHDRAW: '12_WITHDRAWN',
      },
    },
    '11_REJECTED': {
      on: {
        EDIT: '01_DRAFT',
        ABANDON: '90_ABANDONED',
      },
    },
    '12_WITHDRAWN': {
      on: {
        EDIT: '01_DRAFT',
        ARCHIVE: '91_ARCHIVED',
        ABANDON: '90_ABANDONED',
      },
    },
    '20_APPROVED': {
      on: {
        DEPLOY: '30_DEPLOYED',
        WITHDRAW: '12_WITHDRAWN',
      },
    },
    '30_DEPLOYED': {
      on: {
        RETIRE: '32_RETIRED',
      },
    },
    '32_RETIRED': {
      on: {
        ARCHIVE: '91_ARCHIVED',
      },
    },
    '90_ABANDONED': {
      type: 'final',
    },
    '91_ARCHIVED': {
      type: 'final',
    },
  },
});
