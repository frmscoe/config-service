// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"

/**
 * 
 * @param page 
 * @param limit 
 * @returns {data: any[], count: number}
 */
export const getRules = ({page = 1, limit = process.env.NEXT_PUBLIC_SECURITY_FETCH_LIMIT }) => {
    return Api.get('/rule', {
        params: {
            page,
            limit
        }
    });
}

export const getNetworkMaps = ({ page, limit }: { page: number; limit: number }) => {
  return Api.get('/network-map', {
    params: { page, limit },
  });
};
