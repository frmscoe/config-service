// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { createMachine } from 'xstate';

export const ruleConfigMachine = createMachine({
  id: 'ruleConfig',
  initial: 'NEW',
  states: {
    NEW: {
      on: {
        TO_DRAFT: 'DRAFT',
        TO_REVIEW: 'PENDING_REVIEW',
      },
    },
    DRAFT: {
      on: {
        TO_REVIEW: 'PENDING_REVIEW',
        ABANDON: 'ABANDONED',
      },
    },
    PENDING_REVIEW: {
      on: {
        APPROVE: 'APPROVED',
        REJECT: 'REJECTED',
        WITHDRAW: 'WITHDRAWN',
      },
    },
    APPROVED: {
      on: {
        DEPLOY: 'DEPLOYED',
        WITHDRAW: 'WITHDRAWN',
      },
    },
    DEPLOYED: {
      on: {
        RETIRE: 'RETIRED',
      },
    },
    RETIRED: {
      on: {
        ARCHIVE: 'ARCHIVED',
      },
    },
    REJECTED: {
      on: {
        EDIT: 'DRAFT',
        ABANDON: 'ABANDONED',
      },
    },
    WITHDRAWN: {
      on: {
        EDIT: 'DRAFT',
        ABANDON: 'ABANDONED',
        ARCHIVE: 'ARCHIVED',
      },
    },
    ABANDONED: {
      type: 'final',
    },
    ARCHIVED: {
      type: 'final',
    },
  },
});
