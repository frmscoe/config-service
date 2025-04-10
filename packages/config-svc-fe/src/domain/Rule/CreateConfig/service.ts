// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"

export const postRuleConfig = (data: any) => {
    return Api.post('/rule-config', data);
}