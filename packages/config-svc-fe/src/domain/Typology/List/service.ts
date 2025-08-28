// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"

export interface ITypology {
    _key?: string;
    _id: string;
    cfg: string;
    name: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    desc: string;
    state: string;
}
/**
 *
 * @param page
 * @param limit
 * @returns {data: ITypology[], count: number}
 */
export const getTypologies = ({page = 1, limit = process.env.NEXT_PUBLIC_SECURITY_FETCH_LIMIT }) => {
    // THIS IS THE CORRECT WAY to pass query parameters using Axios (or similar client wrapped by Api)
    return Api.get(`/typology`, { params: { page, limit } });
}