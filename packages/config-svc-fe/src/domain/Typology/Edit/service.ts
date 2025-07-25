// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"; // Assuming Api is correctly imported from here
import { ITypology } from "~/domain/typology/types"; // Corrected import path for ITypology

/**
 * Fetches a single Typology by its ID (_key).
 * Used for loading existing typology data into the edit form.
 * @param id The _key of the Typology to fetch.
 * @returns Promise containing the Typology data.
 */
export const getTypology = (id: string) => {
    // Corrected to use the standard /typology/:id endpoint structure as per previous discussions
    return Api.get<ITypology>(`/typology/${id}`);
}

/**
 * Creates a new Typology.
 * Used when saving a new typology or creating a new version of an existing typology.
 * @param data The partial Typology object to create.
 * @returns Promise containing the newly created Typology data.
 */
export const createTypology = async (data: Partial<ITypology>): Promise<{ data: ITypology }> => {
    // Uses POST for creation, sending to the base /typology endpoint
    const response = await Api.post<ITypology>('/typology', data);
    return response.data;
};

/**
 * Updates an existing Typology.
 * Used when modifying a typology in states that don't require a new version.
 * @param data The partial Typology object with updated fields (excluding state).
 * @param id The _key of the Typology to update.
 * @returns Promise containing the updated Typology data.
 */
export const updateTypology = async (data: Partial<ITypology>, id: string): Promise<{ data: ITypology }> => {
    // Uses PATCH for partial updates to an existing typology's endpoint
    // `encodeURIComponent` ensures the ID (which can contain slashes like \"collection/key\") is correctly URL-encoded.
    const response = await Api.patch<ITypology>(`/typology/${encodeURIComponent(id)}`, data);
    return response.data;
};

/**
 * Transitions the state of an existing Typology.
 * This calls the dedicated backend state transition endpoint.
 * @param id The _key of the Typology to transition.
 * @param newState The new state for the typology.
 * @returns Promise containing the updated Typology data.
 */
export const transitionTypologyState = async (id: string, newState: ITypology['state']): Promise<{ data: ITypology }> => {
    const response = await Api.patch<ITypology>(`/typology/${encodeURIComponent(id)}/transition`, { state: newState });
    return response.data;
};