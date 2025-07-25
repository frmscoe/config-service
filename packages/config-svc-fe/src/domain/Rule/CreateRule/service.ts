// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client";

export const createRule = (body: any) => {
    return Api.post('/rule', {...body});
}

export const checkRuleDuplicate = async (name: string, cfg = '1.0.0') => {
  const res = await Api.get('/rule', {
    params: { name, cfg },
  });
  return res.data.rules?.length > 0;
};

