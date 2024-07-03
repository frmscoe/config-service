import { Api } from "~/client";

export const updateRule = (body: any, id: string) => {
    return Api.patch(`/rule/${id}`, {...body});
}