import { Api } from "~/client"


export const getRule = (id: string) => {
    return Api.get(`/rule/${id}`);
}