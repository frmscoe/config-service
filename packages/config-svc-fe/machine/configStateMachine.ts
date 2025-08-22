// SPDX-License-Identifier: Apache-2.0 
import { setup } from 'xstate';
import { ArtefactType } from './guards';
import { canTransition } from './guards';
import { IRuleConfig } from '~/domain/RuleConfig/RuleConfigList/types'; // Import IRuleConfig for context

export type MachineEvent =
  | { type: 'SAVE_DRAFT' }
  | { type: 'SUBMIT_REVIEW' }
  | { type: 'APPROVE' }
  | { type: 'REJECT'; reason?: string }
  | { type: 'WITHDRAW' }
  | { type: 'EDIT' }
  | { type: 'ABANDON' }
  | { type: 'ARCHIVE' }
  | { type: 'DEPLOY' }
  | { type: 'RETIRE' }
  | { type: 'API_SYNC' }
  | { type: 'API_SUCCESS'; data: any }
  | { type: 'API_ERROR'; error: string };


export const configStateMachine = setup({
  types: {
    context: {} as {
      artefactType: ArtefactType;
      userPrivileges: string[];
      user: { username: string };
      apiData: {
        state: string;
        ownerId: string;
        [key: string]: any;
      };
      lastError?: string;
      ruleId?: string;
      ruleConfigData?: IRuleConfig;
    },
    events: {} as MachineEvent
  },
  guards: {
    canTransition: ({ context, event }) => {
      return canTransition(
        context.userPrivileges,
        context.artefactType,
        context.apiData.state,
        event.type,
        context.apiData?.ownerId || ''
      );
    }
  },
  actions: {
    prepareApiSync: ({ context, event }) => ({
      apiData: {
        ...context.apiData,
        state: getTargetState(event.type)
      }
    }),
    updateState: ({ event }) => ({
      apiData: event.data
    }),
    logRejection: ({ event }) => ({
      lastError: (event as any).reason || 'No reason provided'
    }),
    handleError: ({ event }) => ({
      lastError: (event as any).error?.message || 'Unknown error'
    })
  }
}).createMachine({
  id: 'artefactLifecycle',
  initial: '01_DRAFT',
  context: {
    artefactType: 'RULE', // Default, will be overridden by useStateMachine options
    userPrivileges: [],
    apiData: { state: '01_DRAFT' },
    lastError: undefined,
    ruleId: undefined,
    ruleConfigData: undefined
  },
  states: {
    '01_DRAFT': {
      initial: 'idle', // Added idle substate
      states: {
        idle: {},
        pending: { // Added pending substate for async operations into DRAFT
          invoke: {
            src: 'syncStateToAPI',
            onDone: { target: 'idle', actions: ['updateState'] },
            onError: { actions: ['handleError'], target: 'idle' }
          }
        }
      },
      on: {
        SUBMIT_REVIEW: {
          target: '10_PENDING_REVIEW.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        ABANDON: {
          target: '90_ABANDONED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        // SAVE_DRAFT could be added here if you want a button to save without state change.
        // EDIT event from other states will target '01_DRAFT.pending'
      }
    },
    '10_PENDING_REVIEW': {
      initial: 'idle',
      states: {
        idle: {},
        pending: {
          invoke: {
            src: 'syncStateToAPI',
            onDone: { target: 'idle', actions: ['updateState'] },
            onError: { actions: ['handleError'], target: 'idle' }
          }
        }
      },
      on: {
        APPROVE: {
          target: '20_APPROVED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        REJECT: {
          target: '11_REJECTED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync', 'logRejection']
        },
        WITHDRAW: {
          target: '12_WITHDRAWN.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        }
      }
    },
    '11_REJECTED': {
      initial: 'idle',
      states: {
        idle: {},
        pending: {
          invoke: {
            src: 'syncStateToAPI',
            onDone: { target: 'idle', actions: ['updateState'] },
            onError: { actions: ['handleError'], target: 'idle' }
          }
        }
      },
      on: {
        EDIT: { // This transition now targets the pending substate of DRAFT
          target: '01_DRAFT.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        ABANDON: {
          target: '90_ABANDONED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        }
      }
    },
    '12_WITHDRAWN': {
      initial: 'idle',
      states: {
        idle: {},
        pending: {
          invoke: {
            src: 'syncStateToAPI',
            onDone: { target: 'idle', actions: ['updateState'] },
            onError: { actions: ['handleError'], target: 'idle' }
          }
        }
      },
      on: {
        EDIT: { // This transition now targets the pending substate of DRAFT
          target: '01_DRAFT.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        ABANDON: {
          target: '90_ABANDONED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        ARCHIVE: { // Added ARCHIVE transition
          target: '91_ARCHIVED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        }
      }
    },
    '20_APPROVED': {
      initial: 'idle',
      states: {
        idle: {},
        pending: {
          invoke: {
            src: 'syncStateToAPI',
            onDone: { target: 'idle', actions: ['updateState'] },
            onError: { actions: ['handleError'], target: 'idle' }
          }
        }
      },
      on: {
        EDIT: { // This transition now targets the pending substate of DRAFT
          target: '01_DRAFT.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        ABANDON: {
          target: '90_ABANDONED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        DEPLOY: { // Added DEPLOY transition
          target: '30_DEPLOYED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        WITHDRAW: { // Added WITHDRAW transition based on nextStateMap
          target: '12_WITHDRAWN.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        }
      }
    },
    '30_DEPLOYED': {
      initial: 'idle',
      states: {
        idle: {},
        pending: {
          invoke: {
            src: 'syncStateToAPI',
            onDone: { target: 'idle', actions: ['updateState'] },
            onError: { actions: ['handleError'], target: 'idle' }
          }
        }
      },
      on: {
        EDIT: { // This transition now targets the pending substate of DRAFT
          target: '01_DRAFT.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        ABANDON: {
          target: '90_ABANDONED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        RETIRE: { // Added RETIRE transition
          target: '32_RETIRED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        }
      }
    },
    '32_RETIRED': {
      initial: 'idle',
      states: {
        idle: {},
        pending: {
          invoke: {
            src: 'syncStateToAPI',
            onDone: { target: 'idle', actions: ['updateState'] },
            onError: { actions: ['handleError'], target: 'idle' }
          }
        }
      },
      on: {
        EDIT: { // This transition now targets the pending substate of DRAFT
          target: '01_DRAFT.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        ABANDON: {
          target: '90_ABANDONED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        },
        ARCHIVE: { // Added ARCHIVE transition
          target: '91_ARCHIVED.pending',
          guard: 'canTransition',
          actions: ['prepareApiSync']
        }
      }
    },
    '90_ABANDONED': {
      type: 'final',
      initial: 'pending',
      states: {
        pending: {
          invoke: {
            src: 'syncStateToAPI',
            onDone: { target: 'done', actions: ['updateState'] },
            onError: { actions: ['handleError'], target: 'done' }
          }
        },
        done: { type: 'final' }
      }
    },
    '91_ARCHIVED': {
      type: 'final',
      initial: 'pending',
      states: {
        pending: {
          invoke: {
            src: 'syncStateToAPI',
            onDone: { target: 'done', actions: ['updateState'] },
            onError: { actions: ['handleError'], target: 'done' }
          }
        },
        done: { type: 'final' }
      }
    }
  }
});

function getTargetState(eventType: string): string {
  const stateMap: Record<string, string> = {
    'SUBMIT_REVIEW': '10_PENDING_REVIEW',
    'APPROVE': '20_APPROVED',
    'REJECT': '11_REJECTED',
    'WITHDRAW': '12_WITHDRAWN',
    'DEPLOY': '30_DEPLOYED',
    'RETIRE': '32_RETIRED',
    'ABANDON': '90_ABANDONED',
    'ARCHIVE': '91_ARCHIVED',
    'EDIT': '01_DRAFT' // Added EDIT target for consistency
  };
  return stateMap[eventType] || '01_DRAFT';
}

// Keeping this for reference, but the machine definition is the source of truth for transitions.
export const nextStateMap: Record<string, Record<string, string>> = {
  '01_DRAFT': {
    SUBMIT_REVIEW: '10_PENDING_REVIEW',
    ABANDON: '90_ABANDONED',
  },
  '10_PENDING_REVIEW': {
    APPROVE: '20_APPROVED',
    REJECT: '11_REJECTED',
    WITHDRAW: '12_WITHDRAWN',
  },
  '11_REJECTED': {
    EDIT: '01_DRAFT', // Changed from RETURN_TO_DRAFT to EDIT
    ABANDON: '90_ABANDONED',
  },
  '12_WITHDRAWN': {
    EDIT: '01_DRAFT', // Changed from RETURN_TO_DRAFT to EDIT
    ABANDON: '90_ABANDONED',
    ARCHIVE: '91_ARCHIVED',
  },
  '20_APPROVED': {
    DEPLOY: '30_DEPLOYED',
    WITHDRAW: '12_WITHDRAWN',
    EDIT: '01_DRAFT', // Added EDIT
  },
  '30_DEPLOYED': {
    RETIRE: '32_RETIRED',
    EDIT: '01_DRAFT', // Added EDIT
  },
  '32_RETIRED': {
    ARCHIVE: '91_ARCHIVED',
    EDIT: '01_DRAFT', // Added EDIT
  },
  '90_ABANDONED': {},
  '91_ARCHIVED': {},
};