import { Api } from "~/client";

export const createRule = (body: any) => {
    return Api.post('/rule', {...body});
}