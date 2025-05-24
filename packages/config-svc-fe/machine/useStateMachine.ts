// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { useMachine } from '@xstate/react';
import { configStateMachine } from './configStateMachine';
import { getNextEvents } from './transitions';

/**
 * React hook to wrap the XState lifecycle machine
 * and expose helpful info to UI components.
 */
export const useStateMachine = () => {
  const [state, send, interpreter] = useMachine(configStateMachine);

  return {
    current: state.value,
    can: (event: string) => {
      const next = configStateMachine.transition(state.value, event);
      return next.changed !== false;
    },
    nextEvents: getNextEvents(state.value),
    sendEvent: send,
    context: state.context,
    service: interpreter,
  };
};
