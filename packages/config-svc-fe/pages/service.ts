// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Api } from "~/client"; // Ensure Api is correctly imported from your client

// --- EXISTING INTERFACES FOR RULES (No Change) ---
interface RuleApiItem {
  _key: string;
  state: string;
}
interface RulesApiResponse {
  count: number;
  rules: RuleApiItem[];
}
interface DashboardRulesData {
  total: number;
  draft: number;
  pendingReview: number;
}
export const fetchDashboardRules = async (
  page: number = 1,
  limit: number = 100
): Promise<DashboardRulesData> => {
  try {
    console.log("Attempting to fetch dashboard rules...");
    const response = await Api.get<RulesApiResponse>('/rule', {
      params: { page, limit }
    });
    console.log("API response received for rules:", response.data);
    if (response.data && typeof response.data.count === 'number' && Array.isArray(response.data.rules)) {
      const { count, rules } = response.data;
      const draftRules = rules.filter(rule => rule.state === '01_DRAFT').length;
      const pendingReviewRules = rules.filter(rule => rule.state === '10_PENDING_REVIEW').length;
      return {
        total: count,
        draft: draftRules,
        pendingReview: pendingReviewRules,
      };
    } else {
      console.warn("API response for /rule did not match expected structure. Received:", response.data);
      return { total: 0, draft: 0, pendingReview: 0 };
    }
  } catch (error: any) {
    console.error("Failed to fetch dashboard rules. Error details:", error);
    throw error;
  }
};


// --- EXISTING INTERFACES FOR RULE CONFIGS (No Change) ---
interface RuleConfigApiItem {
  _key: string;
  state: string;
}
interface RuleConfigApiResponse {
  data: RuleConfigApiItem[];
  count: number;
}
interface DashboardRuleConfigsData {
  total: number;
  draft: number;
  pendingReview: number;
}
export const fetchDashboardRuleConfigs = async (
  page: number = 1,
  limit: number = 100
): Promise<DashboardRuleConfigsData> => {
  try {
    console.log("Attempting to fetch dashboard rule configurations...");
    const response = await Api.get<RuleConfigApiResponse>('/rule-config', {
      params: { page, limit }
    });
    console.log("API response received for rule configs:", response.data);
    if (response.data && Array.isArray(response.data.data) && typeof response.data.count === 'number') {
      const { data: ruleConfigs, count } = response.data;
      const draftRuleConfigs = ruleConfigs.filter(rc => rc.state === '01_DRAFT').length;
      const pendingReviewRuleConfigs = ruleConfigs.filter(rc => rc.state === '10_PENDING_REVIEW').length;
      return {
        total: count,
        draft: draftRuleConfigs,
        pendingReview: pendingReviewRuleConfigs,
      };
    } else {
      console.warn("API response for /rule-config did not match expected structure. Received:", response.data);
      return { total: 0, draft: 0, pendingReview: 0 };
    }
  } catch (error: any) {
    console.error("Failed to fetch dashboard rule configurations. Error details:", error);
    throw error;
  }
};


// --- EXISTING INTERFACES AND FUNCTION FOR TYPOLOGIES (No Change - copied as provided) ---
interface TypologyApiItem {
  _key: string;
  state: string;
}

interface TypologyApiResponse {
  total: number;
  page: number;
  countInPage: number;
  data: TypologyApiItem[];
}

interface DashboardTypologiesData {
  total: number;
  draft: number;
  pendingReview: number;
}

export const fetchDashboardTypologies = async (
  page: number = 1,
  limit: number = 100
): Promise<DashboardTypologiesData> => {
  try {
    console.log("Attempting to fetch dashboard typologies...");
    const response = await Api.get<TypologyApiResponse>('/typology', {
      params: { page, limit }
    });
    console.log("API response received for typologies:", response.data);

    if (response.data && Array.isArray(response.data.data) && typeof response.data.total === 'number') {
      const { data: typologies, total } = response.data;
      const draftTypologies = typologies.filter(t => t.state === '01_DRAFT').length;
      const pendingReviewTypologies = typologies.filter(t => t.state === '10_PENDING_REVIEW').length;
      return {
        total: total,
        draft: draftTypologies,
        pendingReview: pendingReviewTypologies,
      };
    } else {
      console.warn("API response for /typology did not match expected structure. Received:", response.data);
      return { total: 0, draft: 0, pendingReview: 0 };
    }
  } catch (error: any) {
    console.error("Failed to fetch dashboard typologies. Error details:", error);
    throw error;
  }
};

// EXISTING NETWORK MAPS
// Add this in service.ts
// In service.ts
export const fetchDashboardNetworkMaps = async (
  page: number = 1,
  limit: number = 100
): Promise<DashboardCardData> => {
  try {
    console.log("Attempting to fetch dashboard network maps...");
    const response = await Api.get('/network-map', {
      params: { page, limit }
    });
    console.log("API response received for network maps:", response.data);

    if (response.data && Array.isArray(response.data.items) && typeof response.data.total === 'number') {
      const { items: networkMaps, total } = response.data;
      const draftMaps = networkMaps.filter(nm => nm.state === '01_DRAFT').length;
      const pendingReviewMaps = networkMaps.filter(nm => nm.state === '10_PENDING_REVIEW').length;
      return {
        total: total,
        draft: draftMaps,
        pendingReview: pendingReviewMaps,
      };
    } else {
      console.warn("API response for /network-map did not match expected structure. Received:", response.data);
      return { total: 0, draft: 0, pendingReview: 0 };
    }
  } catch (error: any) {
    console.error("Failed to fetch dashboard network maps. Error details:", error);
    throw error;
  }
};



// --- EXISTING INTERFACES AND FUNCTION FOR FETCHING EXIT CONDITIONS (No Change apart from export for types) ---
export interface ExitConditionApiItem {
  id: string;
  reason: string;
  description: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  usersWithThisDefault: number;
  isSystemDefault: boolean;
  isUserDefault: boolean;
  userDefined: boolean;
  canDelete: boolean;
}

type ExitConditionsApiResponse = ExitConditionApiItem[];

export const fetchExitConditions = async (): Promise<ExitConditionsApiResponse> => {
  try {
    console.log("Attempting to fetch exit conditions...");
    const response = await Api.get<ExitConditionsApiResponse>('/exit-conditions');
    console.log("API response received for exit conditions:", response.data);

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("API response for /exit-conditions did not match expected array structure. Received:", response.data);
      return [];
    }
  } catch (error: any) {
    console.error("Failed to fetch exit conditions. Error details:", error);
    throw error;
  }
};



// --- NEW INTERFACES AND FUNCTION FOR CREATING EXIT CONDITIONS (Cleanly added) ---

export interface CreateExitConditionPayload {
  id: string;
  reason: string;
  description: string;
  label: "User Created";
}

export const createExitCondition = async (
  payload: CreateExitConditionPayload
): Promise<ExitConditionApiItem> => {
  try {
    console.log("Attempting to create new exit condition with payload:", payload);
    const response = await Api.post<ExitConditionApiItem>('/exit-conditions', payload);
    console.log("API response received for new exit condition:", response.data);

    if (response.data && typeof response.data.id === 'string') {
      return response.data;
    } else {
      console.warn("API response for POST /exit-conditions did not match expected structure. Received:", response.data);
      throw new Error("Invalid API response when creating exit condition.");
    }
  } catch (error: any) {
    console.error("Failed to create new exit condition. Error details:", error);
    throw error;
  }
};

export const updateExitCondition = async (
  id: string,
  updates: Partial<ExitConditionApiItem>
): Promise<ExitConditionApiItem> => {
  try {
    const response = await Api.put<ExitConditionApiItem>(`/exit-conditions/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error("Failed to update exit condition:", error);
    throw error;
  }
};



export const getApprovedRuleConfigs = async (): Promise<any[]> => {
  let page = 1;
  const limit = 100;
  let allApprovedConfigs: any[] = [];
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await Api.get("/rule/rule-config", {
        params: { page, limit },
      });

      const rules = response.data.rules || [];

      // Extract approved ruleConfigs
      const approvedConfigs = rules.flatMap((rule: any) => {
        if (!Array.isArray(rule.ruleConfigs)) return [];

        return rule.ruleConfigs
          .filter((cfg: any) => cfg.state === "20_APPROVED")
          .map((cfg: any) => ({
            ...cfg,
            ruleName: rule.name,
          }));
      });

      allApprovedConfigs.push(...approvedConfigs);

      const total = response.data.count || 0;
      const fetched = page * limit;
      hasMore = fetched < total;
      page++;
    }

    return allApprovedConfigs;
  } catch (error) {
    console.error("Failed to fetch all rule configs:", error);
    throw error;
  }
};



// GET ALL APPROVED TYPOLOGIES
export const getApprovedTypologies = async (): Promise<any[]> => {
  let page = 1;
  const limit = 100;
  const allApproved: any[] = [];
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await Api.get("/typology", {
        params: { page, limit },
      });

      const batch = response.data.data || [];

      // Filter for approved typologies
      const approved = batch.filter(t => t.state === "20_APPROVED");
      allApproved.push(...approved);

      const total = response.data.total || 0;
      const fetched = page * limit;
      hasMore = fetched < total;
      page++;
    }

    return allApproved;
  } catch (err) {
    console.error("Error fetching approved typologies:", err);
    throw err;
  }
};



export const getRuleConfigById = async (ruleConfigId: string): Promise<any> => {
  try {
    const encodedId = encodeURIComponent(ruleConfigId);
    const response = await Api.get(`/rule-config/${encodedId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching rule config ${ruleConfigId}:`, error);
    throw error;
  }
};



// GET APPROVED NETWORK MAPS
export const getApprovedNetworkMaps = async (): Promise<any[]> => {
  let page = 1;
  const limit = 100;
  let allNetworkMaps: any[] = [];
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await Api.get("/network-map", {
        params: { page, limit },
      });

      const approvedMaps = (response.data.items || []).filter(
        (map: any) => map.state === "20_APPROVED"
      );

      allNetworkMaps.push(...approvedMaps);

      const total = response.data.total || 0;
      const fetched = page * limit;
      hasMore = fetched < total;
      page++;
    }

    return allNetworkMaps;
  } catch (error) {
    console.error("Failed to fetch network maps:", error);
    throw error;
  }
};



export const getTypologyById = async (typologyId: string): Promise<any> => {
  try {
    const encodedId = encodeURIComponent(typologyId);
    const response = await Api.get(`/typology/${encodedId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching typology ${typologyId}:`, error);
    throw error;
  }
};


// DELETE EXIT CONDITION
export const deleteExitCondition = async (exitConditionKey: string): Promise<any> => {
  try {
    const encodedKey = encodeURIComponent(exitConditionKey);
    const response = await Api.delete(`/exit-conditions/${encodedKey}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting exit condition ${exitConditionKey}:`, error);
    throw error;
  }
};

