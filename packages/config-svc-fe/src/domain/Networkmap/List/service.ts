import { Api } from "~/client"

/**
 * 
 * @param page 
 * @param limit 
 * @returns {data: any[], count: number}
 */
export const getRules = ({page = 1, limit = 10 }) => {
    return Api.get('/rule', {
        params: {
            page,
            limit
        }
    });
}