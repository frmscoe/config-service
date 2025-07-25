// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { getNextState, isTransitionAllowed } from './transitions';
import { updateRuleState } from '~/domain/Rule/ReviewRule/service';
import { ArtefactType } from './guards';


export const transitionAndPersist = async ({
  artefactType,
  currentState,
  event,
  userPrivileges,
  ruleId,
}: {
  artefactType: ArtefactType;
  currentState: string;
  event: string;
  userPrivileges: string[];
  ruleId: string;
}): Promise<string | null> => {
  const normalizedState = currentState.trim().toUpperCase();

  const allowed = isTransitionAllowed(normalizedState, event, {
    artefactType,
    userPrivileges,
  });

  if (!allowed) throw new Error(`Transition "${event}" not allowed from "${normalizedState}".`);

  const nextState = getNextState(normalizedState, event);

  if (!nextState) throw new Error(`No valid next state from "${normalizedState}" on event "${event}".`);

  await updateRuleState(ruleId, nextState);
  return nextState;
};
