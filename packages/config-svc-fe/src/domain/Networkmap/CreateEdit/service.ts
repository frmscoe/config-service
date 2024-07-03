import { Api } from "~/client"
import { ITypology } from "~/domain/Typology/List/service"

export interface GroupedTypology extends ITypology {
  versions: ITypology[]
} 

export const createNetworkMap = (data: any) => {
    return Api.post('/network-map', {...data})
}

export const getTypologies = (page: number) => {
  return Api.get(`/typology?page=${page}&limit=9999 `)
}

export const getTypology = (id: string) => {
  return Api.get(`/typology/${id}`);
}


export const groupTypologies = (typologies: ITypology[]) => {
  const grouped: {[k: string]: GroupedTypology} = {};

  typologies.forEach((typology) => {
    if(grouped[typology.name]) {
      grouped[typology.name] = {
        ...grouped[typology.name],
        versions: [...(grouped[typology.name]?.versions || []), typology]
      }
    } else {
      grouped[typology.name] = {
        ...typology,
        versions: [typology]
      }
    }
  });

  return Object.values(grouped);
}