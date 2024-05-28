import { Api } from "~/client"

export const postRuleConfig = (data: any) => {
    return Api.post('/rule-config', data);
}