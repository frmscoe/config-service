// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client";
import { INetworkMap, StateEnum } from "../types";

/**
 * Fetch a single Network Map by its full document ID (_id).
 * @param id The full ArangoDB _id of the Network Map (e.g., "network_map/uuid")
 * @returns Promise containing the Network Map data
 */
export const getNetworkMap = (id: string) => {
  return Api.get<INetworkMap>(`/network-map/${encodeURIComponent(id)}`);
};

/**
 * Transitions the state of a Network Map.
 * @param id The full ArangoDB _id of the Network Map
 * @param newState The new StateEnum to transition to
 * @returns Promise with the updated Network Map
 */
export const transitionNetworkMapState = (id: string, newState: StateEnum) => {
  return Api.patch<INetworkMap>(`/network-map/${encodeURIComponent(id)}/transition`, {
    state: newState,
  });
};
