// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { StateValue } from 'xstate';
import { configStateMachine } from './configStateMachine';

/**
 * Returns the list of valid events from a given current state.
 * These events represent allowed transitions.
 */
export const getNextEvents = (currentState: StateValue): string[] => {
  const stateNode = configStateMachine.getStateNodeByPath([currentState]);
  return Object.keys(stateNode.on ?? {});
};

/**
 * Returns the list of next state values from a given current state.
 */
export const getNextStates = (currentState: StateValue): string[] => {
  const stateNode = configStateMachine.getStateNodeByPath([currentState]);
  return Object.values(stateNode.on ?? {}).flat();
};

/**
 * Checks if a specific transition (event) is valid from the given current state.
 */
export const isTransitionAllowed = (currentState: StateValue, event: string): boolean => {
  const resolved = configStateMachine.transition(currentState, event);
  return resolved.changed !== false;
};
