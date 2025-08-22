// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client";
import { ITypology, StateEnum } from '../types'; // Corrected import path

/**
 * Fetches a single Typology by its ID (_key).
 * @param id The _key of the Typology to fetch.
 * @returns Promise containing the Typology data.
 */
export const getTypology = (id: string) => {
    return Api.get<ITypology>(`/typology/${id}`);
}

/**
 * Transitions the state of a Typology.
 * @param id The _key of the Typology to transition.
 * @param newState The target state to transition to.
 * @returns Promise containing the updated Typology data.
 */
export const transitionTypologyState = (id: string, newState: StateEnum) => {
    // FIX: Remove the redundant '/typology' from the path
    // Assuming Api base URL is something like '/api' or '/api/typology'
    // If Api's baseURL is '/api/', then this becomes '/api/typology/:id/transition'
    // If Api's baseURL is '/api/typology/', then this becomes '/api/typology/:id/transition'
    return Api.patch<ITypology>(`/${id}/transition`, { state: newState }); // Changed line
}


// Fetch rule metadata by ID (without 'rule/' prefix)
export const getRuleById = async (id: string) => {
  const encodedId = encodeURIComponent(id);
  return Api.get(`/rule/${encodedId}`);
};

// Fetch rule config metadata by ID (without 'rule_config/' prefix)
export const getRuleConfigById = async (id: string) => {
  const encodedId = encodeURIComponent(id);
  return Api.get(`/rule-config/${encodedId}`);
};
