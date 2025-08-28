// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { useEffect } from 'react';
import { useActorRef, useSelector } from '@xstate/react';
import { configStateMachine, type MachineEvent } from './configStateMachine';
import type { ArtefactType } from './guards';
import { updateRuleState } from '~/domain/Rule/ReviewRule/service';
import { updateRuleConfigState } from '~/domain/Rule/ReviewConfig/service'; // Import the new service
// Removed: import { ActorStatus } from 'xstate'; // This line is no longer needed

import { IRuleConfig } from '~/domain/RuleConfig/RuleConfigList/types'; // Import IRuleConfig

interface UseStateMachineOptions {
  ruleId?: string; // Used for RULE artefactType
  ruleConfig?: IRuleConfig; // Pass the full rule config object if artefactType is RULE_CONFIG
  initialState: string;
  artefactType: ArtefactType;
  userPrivileges: string[];
  onStateChange?: (newState: string) => void;
}

export const useStateMachine = (options: UseStateMachineOptions) => {
  const machine = configStateMachine.provide({
    context: {
      artefactType: options.artefactType,
      userPrivileges: options.userPrivileges,
      apiData: { state: options.initialState },
      ruleId: options.ruleId,
      ruleConfigData: options.ruleConfig, // Pass the full rule config object into context
    },
    services: {
      syncStateToAPI: async (ctx) => {
        let response;
        if (ctx.artefactType === 'RULE') {
          if (!ctx.ruleId) {
            throw new Error("Rule ID is required for Rule state update.");
          }
          // Call the service for Rule
          response = await updateRuleState(ctx.ruleId, ctx.apiData.state);
        } else if (ctx.artefactType === 'RULE_CONFIG') {
          if (!ctx.ruleConfigData || !ctx.ruleConfigData._id) {
            throw new Error("Rule Config data and ID are required for Rule Config state update.");
          }
          // Create the object to send to the backend for RuleConfig
          const updatedRuleConfig: IRuleConfig = {
            ...ctx.ruleConfigData, // Start with the original data from context
            state: ctx.apiData.state // Override the state property with the new state from the machine
          };
          // Call the service for RuleConfig
          response = await updateRuleConfigState(updatedRuleConfig);
        } else {
          throw new Error(`Unsupported artefactType: ${ctx.artefactType}`);
        }

        options.onStateChange?.(ctx.apiData.state);
        return response;
      }
    }
  });

  const actorRef = useActorRef(machine);
  const snapshot = useSelector(actorRef, (s) => s);

  // Reverted isLoading logic to the one that previously worked without error
  // This checks if any part of the state value ends with 'pending', indicating an async operation
  const isLoading = Object.keys(snapshot.value).some((v) => v.endsWith('pending'));

  useEffect(() => {
    actorRef.start();
    return () => actorRef.stop();
  }, [actorRef]);

  const sendEvent = async (event: MachineEvent) => {
    try {
      const nextSnapshot = machine.transition(snapshot, event);
      if (!nextSnapshot.changed) {
        throw new Error(`Invalid transition from ${snapshot.value} with ${event.type}`);
      }

      actorRef.send(event);
    } catch (err) {
      console.error('Transition failed:', err);
      throw err;
    }
  };

  return {
    current: snapshot.value,
    context: snapshot.context,
    isLoading: isLoading, // Use the simplified isLoading
    error: snapshot.context.lastError,
    sendEvent,
    // Removed 'can' function as it was not directly used in the provided ReviewPage snippet
    // and might involve similar XState internals if not carefully implemented.
  };
};