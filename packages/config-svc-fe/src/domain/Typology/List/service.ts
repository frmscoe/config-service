import { Api } from "~/client"

export interface ITypology {
    _key?: string;
    _id: string;
    cfg: string;
    name: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    desc: string;
    state: string;
}
/**
 * 
 * @param page 
 * @param limit 
 * @returns {data: ITypology[], count: number}
 */
export const getTypologies = ({page = 1, limit = 10 }) => {
    return Api.get(`/typology?page=${page}&limit=${limit}`);
}