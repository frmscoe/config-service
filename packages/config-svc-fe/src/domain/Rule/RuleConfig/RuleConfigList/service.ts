import { Api } from "~/client"


/**
 * 
 * @param page 
 * @param limit 
 * @returns {data: IRuleConfig[], count: number}
 */
export const getRules = ({page = 1, limit = 10 }) => {
    return Api.get('/rule-config', {
        params: {
            page,
            limit
        }
    });
}

export const getRulesWithConfigs = ({page = 1, limit = 10 }) => {
    return Api.get('/rule/rule-config', {
        params: {
            page,
            limit
        }
    });
}