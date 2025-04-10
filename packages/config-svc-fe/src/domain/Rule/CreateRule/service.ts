// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client";

export const createRule = (body: any) => {
    return Api.post('/rule', {...body});
}