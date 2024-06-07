import { Api } from "~/client"

export const createTypology = (data: any) => {
    return Api.post('/typology', {...data})
}