// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"
import { IRuleConfig, StateEnum } from "../RuleConfigList/types"; // Make sure this import path is correct for IRuleConfig and StateEnum

export const getRuleConfig = (id: string) => {
    return Api.get(`/rule-config/${id}`);
}

export const getRule = (id: string) => {
    return Api.get(`/rule/${id}`);
}

/**
 * Transitions the state of a Rule Config.
 * @param id The _key of the RuleConfig to transition.
 * @param newState The target state to transition to (e.g., "10_PENDING_REVIEW").
 * @returns Promise<void>
 */
export const transitionRuleConfigState = (id: string, newState: StateEnum) => {
    // The endpoint expects the _key as the 'id' parameter in the URL
    // and the new state in the request body.
    return Api.patch(`/rule-config/${id}/transition`, { state: newState });
}