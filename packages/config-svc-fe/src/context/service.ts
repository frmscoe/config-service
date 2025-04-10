// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"

export const getUser = () => {
    return Api.get('/auth/profile', {timeout: 10000})
}

