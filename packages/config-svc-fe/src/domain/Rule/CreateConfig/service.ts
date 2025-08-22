// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client";

export const postRuleConfig = (data: any) => {
  return Api.post('/rule-config', data);
};

export const getRuleAndConfigs = async (ruleName: string) => {
  const res = await Api.get(`/rule/rule-and-its-configs/${ruleName}`);
  return res.data; 
};

// Function to fetch all exit conditions
export const getExitConditions = async () => {
  try {
    const res = await Api.get('/exit-conditions');
    console.log("service.ts: getExitConditions API Response Data:", res.data); // LOG A: Check data directly from API
    return res.data;
  } catch (error) {
    console.error("service.ts: Error fetching exit conditions:", error); // LOG B: Log any errors
    throw error; // Re-throw to propagate the error to the calling component
  }
};

// Function to fetch the logged-in user's profile
export const getUserProfile = async () => {
  try {
    const res = await Api.get('/auth/profile');
    console.log("service.ts: getUserProfile API Response Data:", res.data); // LOG C: Check data directly from API
    return res.data;
  } catch (error) {
    console.error("service.ts: Error fetching user profile:", error); // LOG D: Log any errors
    throw error; // Re-throw to propagate the error to the calling component
  }
};
