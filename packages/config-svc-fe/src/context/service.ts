import { Api } from "~/client"

export const getUser = () => {
    return Api.get('/auth/profile')
}