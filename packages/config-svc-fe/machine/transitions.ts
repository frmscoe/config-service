// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { StateValue } from 'xstate';
import { configStateMachine } from './configStateMachine';
import { EventType } from './configStateMachine'; // Assuming you export the event types

/**
 * Type-safe version of the machine's events
 */
type MachineEvent = Parameters<typeof configStateMachine.transition>[1];

/**
 * Returns the list of valid events from a given current state with type safety
 */
export const getNextEvents = (currentState: StateValue): EventType[] => {
  const stateKey = String(currentState);
  if (!(stateKey in configStateMachine.states)) {
    console.warn(`Unknown state: ${stateKey}`);
    return [];
  }

  const stateDef = configStateMachine.states[stateKey];
  return stateDef?.on ? (Object.keys(stateDef.on) as EventType[]) : [];
};


/**
 * Returns the list of next state values from a given current state with validation
 */
export const getNextStates = (currentState: StateValue): string[] => {
  const stateKey = String(currentState);
  if (!(stateKey in configStateMachine.states)) {
    console.warn(`Unknown state: ${stateKey}`);
    return [];
  }

  const stateDef = configStateMachine.states[stateKey];
  const transitions = stateDef?.on ? Object.values(stateDef.on) : [];

  return transitions.flatMap(transition => {
    if (!transition) return [];
    if (typeof transition === 'string') return [transition];
    if (Array.isArray(transition)) return transition.map(t => t.target).filter(Boolean) as string[];
    if (transition.target) return [transition.target];
    return [];
  }).filter(Boolean) as string[];
};

/**
 * Enhanced transition checker with type safety and permission awareness
 */
export const isTransitionAllowed = (
  currentState: StateValue,
  event: EventType,
  context?: {
    userPrivileges: string[];
    artefactType: 'RULE' | 'RULE_CONFIG' | 'TYPOLOGY' | 'NETWORK_MAP';
  }
): boolean => {
  const stateKey = String(currentState);
  
  // First check if the transition exists in the machine
  const stateDef = configStateMachine.states[stateKey];
  if (!stateDef?.on?.[event]) {
    return false;
  }

  // If context is provided, check permissions
  if (context) {
    const { canTransition } = configStateMachine.options.guards || {};
    if (canTransition) {
      return canTransition({
        context: {
          artefactType: context.artefactType,
          userPrivileges: context.userPrivileges,
          apiData: { state: stateKey }
        },
        event: { type: event }
      } as any); // Type assertion needed due to XState type complexity
    }
  }

  return true;
};

/**
 * Utility to get all possible transitions with metadata
 */
export const getTransitionMetadata = (currentState: StateValue) => {
  return getNextEvents(currentState).map(event => ({
    event,
    targetStates: getNextStatesForEvent(currentState, event),
    allowed: isTransitionAllowed(currentState, event)
  }));
};

/**
 * Helper to get target states for a specific event
 */
const getNextStatesForEvent = (currentState: StateValue, event: string): string[] => {
  const stateDef = configStateMachine.states[String(currentState)];
  const transition = stateDef?.on?.[event];
  
  if (!transition) return [];
  if (typeof transition === 'string') return [transition];
  if (Array.isArray(transition)) return transition.map(t => t.target).filter(Boolean) as string[];
  if (typeof transition === 'object' && transition.target) return [transition.target];
  
  return [];
};