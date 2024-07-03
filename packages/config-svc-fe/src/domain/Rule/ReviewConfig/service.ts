import { Api } from "~/client"

export const getRuleConfig = (id: string) => {
    return Api.get(`/rule-config/${id}`);
}

export const getRule = (id: string) => {
    return Api.get(`/rule/${id}`);
}