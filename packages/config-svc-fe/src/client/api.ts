// <!-- SPDX-License-Identifier: Apache-2.0 -->
import axios from "axios";

const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_CONFIG_SVC_BE_URL}/api`,
    timeout: 20000
});

instance.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem('token');
        const config_svc_username = localStorage.getItem('config_svc_username');
        console.log("Axios Sending Token:", token); // Add this
        console.log("Logged In Username:", config_svc_username); // Add this
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default instance;