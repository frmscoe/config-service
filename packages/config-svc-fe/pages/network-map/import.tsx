import React, { useState } from 'react';
import { Upload, message as antMessage, Select, Button, Modal, Spin, Radio } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Api } from '~/client'; // Assuming Api is correctly configured
import usePrivileges from '~/hooks/usePrivileges';
import AccessDeniedPage from '~/components/common/AccessDenied';
import { useCommonTranslations } from '~/hooks';


const { Option } = Select;
const { Dragger } = Upload;

const lightBlueButtonStyle = {
  backgroundColor: '#add8e6',
  borderColor: '#add8e6',
  color: '#000',
};

const cancelButtonStyle = {
  backgroundColor: '#ff4d4f',
  borderColor: '#ff4d4f',
  color: '#fff',
};

// --- Type Definitions (Added for clarity based on discussion) ---
interface RuleFromImport {
  id: string; // e.g., "002@1.0.0"
  host: string;
  cfg: string;
}

interface TypologyFromImport {
  id: string; // e.g., "001@1.0.0"
  host: string;
  cfg: string;
  rules: RuleFromImport[];
}

interface ChannelFromImport {
  id: string;
  host: string;
  cfg: string;
  typologies: TypologyFromImport[];
}

interface MessageFromImport {
  id: string; // e.g., "004@1.0.0" (network map name)
  host: string;
  cfg: string;
  txTp: string; // Event ID, e.g., "pacs.002.001.12"
  channels: ChannelFromImport[];
}

interface NetworkMapImportJson {
  active: boolean;
  messages: MessageFromImport[];
}

// --- API Payload Interfaces (Based on structures provided by user) ---
interface RulePayload {
  _key?: string; // Only if updating or backend uses _key in payload for creation
  name: string;
  cfg: string;
  host?: string; // Optional if not always sent
  dataType: string; // Defaulted to 'CURRENCY'
  desc: string; // Changed from rule_desc to desc based on API error
  // No rule config details like bands, cases, parameters, exitConditions
}

interface RuleConfigReference {
  ruleId: string;
  ruleConfigId: string[]; // User stated rule config not imported, so this will be empty array
}

// Interface for the actual Typology document POST/PUT payload
interface TypologyDocumentPayload {
  _key?: string; // Only if updating
  name: string;
  cfg: string;
  desc: string; // Defaulted to ''
  state: string; // Defaulted to '01_DRAFT'
  typologyCategoryUUID: string[]; // Defaulted to []
  rules_rule_configs: RuleConfigReference[];
  updatedBy?: string;
  ownerId?: string;
  approverId?: string;
  referenceId?: number;
  originatedId?: string;
  edited?: boolean;
  // 'id' and 'active' are NOT part of the Typology document itself as per user feedback and sample
}

// Interface for Typology objects embedded within the NetworkMapPayload's events array
// This reflects what the backend validation error messages seem to require.
interface EmbeddedTypologyInEventPayload {
  _key: string; // The _key of the typology document
  id: string; // The _id of the typology document (e.g., "typologies/some-uuid") as required by persistent error
  name: string;
  cfg: string;
  desc: string;
  state: string;
  typologyCategoryUUID: string[];
  rules_rule_configs: RuleConfigReference[];
  active: boolean; // RE-ADDED due to persistent backend error message
  updatedBy?: string; // Potentially still needed for embedded structure
  ownerId?: string; // Potentially still needed for embedded structure
  approverId?: string; // Potentially still needed for embedded structure
  referenceId?: number; // Potentially still needed for embedded structure
  originatedId?: string; // Potentially still needed for embedded structure
  edited?: boolean; // Potentially still needed for embedded structure
}


interface EventPayload {
  eventId: string;
  typologies: EmbeddedTypologyInEventPayload[];
}

interface NetworkMapPayload {
  _key?: string; // Backend generates on POST, used for PUT
  active: boolean;
  name: string;
  description: string;
  cfg: string;
  state: string;
  events: EventPayload[];
  createdAt: string;
  updatedAt: string;
  modifiedBy: string;
  ownerId: string;
  approvedBy: string;
  originatedId: string;
  edited: boolean;
  referenceId: number;
  source: string;
}

const ImportNetWorkMap: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<NetworkMapImportJson | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { canImportRule } = usePrivileges();
  const { t } = useCommonTranslations();
  const [isSavingModalVisible, setIsSavingModalVisible] = useState(false);

  // Helper to show error modal
  const showErrorModal = (message: string) => {
    console.log("[showErrorModal] Displaying error:", message); // Log
    setModalMessage(message);
    setIsErrorModalVisible(true);
  };

  // Helper to show success modal
  const showSuccessModal = (message: string) => {
    console.log("[showSuccessModal] Displaying success:", message); // Log
    setModalMessage(message);
    setIsModalVisible(true);
  };

  // --- Check and Create/Fetch Functions ---
  const checkAndGetRule = async (rule: RuleFromImport): Promise<string> => {
    const ruleName = rule.id.split('@')[0]; // Correctly extract name
    console.log(`[checkAndGetRule] Checking for rule: '${rule.id}' (name: '${ruleName}')`); // Log
    try {
      console.log(`[checkAndGetRule] Attempting GET for rule: /rule/name/${encodeURIComponent(ruleName)}`); // Log
      const response = await Api.get(`/rule/name/${encodeURIComponent(ruleName)}`);
      console.log(`[checkAndGetRule] Rule GET response status: ${response.status}`); // Log
      console.log(`[checkAndGetRule] Rule GET response data:`, response.data); // Log

      if (response.data && response.data.length > 0) {
        console.log(`[checkAndGetRule] Rule '${ruleName}' found. Key: ${response.data[0]._key}`); // Log
        return response.data[0]._key;
      } else {
        // Rule not found via GET (e.g., 200 OK with empty array)
        console.log(`[checkAndGetRule] Rule '${ruleName}' not found via GET (empty array). Proceeding to create.`); // Log
      }
    } catch (error: any) {
      console.error(`[checkAndGetRule] Detailed error in checkAndGetRule for '${ruleName}' (catch block):`, error); // Log
      console.error("[checkAndGetRule] Error response data (catch block):", error.response?.data); // Log

      if (error.response?.status === 404) {
        console.log(`[checkAndGetRule] Rule '${ruleName}' not found (404). Proceeding to create.`); // Log
      } else {
        console.error(`[checkAndGetRule] Unexpected error caught for rule '${ruleName}'. Re-throwing.`, error); // Log
        throw error; // Re-throw other errors
      }
    }

    // If we reach here, either it was a 404, or 200 with empty data, so we attempt to create.
    try {
      const rulePayload: RulePayload = {
        name: ruleName, // Use the extracted name
        cfg: rule.cfg,
        host: rule.host,
        dataType: 'CURRENCY', // Default value
        desc: 'Created From Network Map Import', // Updated rule description as per user request
      };
      console.log(`[checkAndGetRule] Attempting POST to create rule:`, rulePayload); // Log
      const createResponse = await Api.post(`/rule`, rulePayload);
      console.log(`[checkAndGetRule] Rule '${ruleName}' created successfully. Key: ${createResponse.data._key}`); // Log
      return createResponse.data._key;
    } catch (createError: any) {
      console.error(`[checkAndGetRule] Error during rule creation for '${ruleName}':`, createError); // Log
      console.error("[checkAndGetRule] Create error response data:", createError.response?.data); // Log
      throw new Error(`Failed to create rule '${rule.id}': ${createError?.response?.data?.message || createError.message}`);
    }
  };

  const checkAndGetTypology = async (typology: TypologyFromImport, ruleKeys: string[]): Promise<{ _key: string, _id: string }> => {
    const typologyName = typology.id.split('@')[0]; // Correctly extract name
    const rulesRuleConfigs: RuleConfigReference[] = ruleKeys.map(key => ({
      ruleId: key,
      ruleConfigId: [], // As per user, rule config is not imported
    }));
    console.log(`[checkAndGetTypology] Checking for typology: '${typology.id}' (name: '${typologyName}')`); // Log

    try {
      console.log(`[checkAndGetTypology] Attempting GET for typology: /typology/name/${encodeURIComponent(typologyName)}`); // Log
      const response = await Api.get(`/typology/name/${encodeURIComponent(typologyName)}`);
      console.log(`[checkAndGetTypology] Typology GET response status: ${response.status}`); // Log
      console.log(`[checkAndGetTypology] Typology GET response data:`, response.data); // Log

      if (response.data && response.data.length > 0) {
        console.log(`[checkAndGetTypology] Typology '${typologyName}' exists. Key: ${response.data[0]._key}, ID: ${response.data[0]._id}`); // Log
        // Typology exists, check its rules and update if necessary
        const existingTypology = response.data[0];
        const existingRuleIds = new Set(existingTypology.rules_rule_configs.map((rc: any) => rc.ruleId));

        const rulesToAdd = rulesRuleConfigs.filter(
          newRuleConfig => !existingRuleIds.has(newRuleConfig.ruleId)
        );

        if (rulesToAdd.length > 0) {
          console.log(`[checkAndGetTypology] Rules to add to existing typology '${typologyName}':`, rulesToAdd); // Log
          // Merge existing rules with new imported ones, ensure no duplicates
          const updatedRulesRuleConfigs = [
            ...existingTypology.rules_rule_configs,
            ...rulesToAdd
          ].filter((v, i, a) => a.findIndex(t => (t.ruleId === v.ruleId)) === i); // Deduplicate

          const updatePayload: TypologyDocumentPayload = { // Using TypologyDocumentPayload
            ...existingTypology, // Keep existing fields
            rules_rule_configs: updatedRulesRuleConfigs,
            updatedAt: new Date().toISOString(), // Update timestamp
            desc: existingTypology.desc || '',
            state: existingTypology.state || '01_DRAFT',
            typologyCategoryUUID: existingTypology.typologyCategoryUUID || [],
            // No 'id' or 'active' here for the document update
          };
          console.log(`[checkAndGetTypology] Attempting PUT to update typology '${typologyName}':`, updatePayload); // Log
          await Api.put(`/typology/${existingTypology._key}`, updatePayload);
          console.log(`[checkAndGetTypology] Typology '${typologyName}' updated successfully.`); // Log
        } else {
          console.log(`[checkAndGetTypology] No new rules to add for existing typology '${typologyName}'.`); // Log
        }
        return { _key: existingTypology._key, _id: existingTypology._id }; // Return both _key and _id
      } else {
        console.log(`[checkAndGetTypology] Typology '${typologyName}' not found via GET (empty array or no data). Proceeding to create.`); // Log
      }
    } catch (error: any) {
      console.error(`[checkAndGetTypology] Detailed error in checkAndGetTypology for '${typologyName}' (catch block):`, error); // Log
      console.error("[checkAndGetTypology] Error response data (catch block):", error.response?.data); // Log

      if (error.response?.status === 404) {
        console.log(`[checkAndGetTypology] Typology '${typologyName}' not found (404). Proceeding to create.`); // Log
      } else {
        console.error(`[checkAndGetTypology] Unexpected error caught for typology '${typologyName}'. Re-throwing.`, error); // Log
        throw error; // Re-throw other errors
      }
    }

    // If we reach here, either it was a 404, or 200 with empty data, so we attempt to create.
    try {
      const typologyPayload: TypologyDocumentPayload = { // Using TypologyDocumentPayload
        name: typologyName, // Use the extracted name
        cfg: typology.cfg,
        desc: '', // Default value
        state: '01_DRAFT', // Default value
        typologyCategoryUUID: [], // Default value
        rules_rule_configs: rulesRuleConfigs,
        // No 'id' or 'active' here for the document creation
      };
      console.log(`[checkAndGetTypology] Attempting POST to create typology:`, typologyPayload); // Log
      const createResponse = await Api.post(`/typology`, typologyPayload);
      console.log(`[checkAndGetTypology] Typology '${typologyName}' created successfully. Key: ${createResponse.data._key}, ID: ${createResponse.data._id}`); // Log
      return { _key: createResponse.data._key, _id: createResponse.data._id }; // Return both _key and _id
    } catch (createError: any) {
      console.error(`[checkAndGetTypology] Error during typology creation for '${typologyName}':`, createError); // Log
      console.error("[checkAndGetTypology] Create error response data:", createError.response?.data); // Log
      throw new Error(`Failed to create typology '${typology.id}': ${createError?.response?.data?.message || createError.message}`);
    }
  };

  const checkAndGetNetworkMap = async (networkMapData: NetworkMapImportJson): Promise<{ exists: boolean, _key?: string }> => {
    const mainMessage = networkMapData.messages?.[0];
    if (!mainMessage) {
      console.log("[checkAndGetNetworkMap] No main message found in network map data."); // Log
      return { exists: false };
    }

    const networkMapName = mainMessage.id.split('@')[0]?.trim();
    console.log(`[checkAndGetNetworkMap] Checking for network map: '${mainMessage.id}' (name: '${networkMapName}')`); // Log
    try {
      console.log(`[checkAndGetNetworkMap] Attempting GET for network map: /network-map/name/${encodeURIComponent(networkMapName)}`); // Log
      const response = await Api.get(`/network-map/name/${encodeURIComponent(networkMapName)}`);
      console.log(`[checkAndGetNetworkMap] Network Map GET response status: ${response.status}`); // Log
      console.log(`[checkAndGetNetworkMap] Network Map GET response data:`, response.data); // Log

      if (response.data && response.data.length > 0) {
        console.log(`[checkAndGetNetworkMap] Network Map '${networkMapName}' found. Key: ${response.data[0]._key}. Returning exists: true.`); // Log
        return { exists: true, _key: response.data[0]._key };
      } else {
        console.log(`[checkAndGetNetworkMap] Network Map '${networkMapName}' not found via GET. Response data was empty or null. Length: ${response.data?.length}. Returning exists: false.`); // Log
        return { exists: false };
      }
    } catch (error: any) {
      console.error(`[checkAndGetNetworkMap] Detailed error in checkAndGetNetworkMap for '${networkMapName}' (catch block):`, error); // Log
      console.error("[checkAndGetNetworkMap] Error response data (catch block):", error.response?.data); // Log

      if (error.response?.status === 404) {
        console.log(`[checkAndGetNetworkMap] Network Map '${networkMapName}' not found (404 response). Returning exists: false.`); // Log
        return { exists: false };
      }
      console.error(`[checkAndGetNetworkMap] Unexpected error caught for network map '${networkMapName}'. Re-throwing.`, error); // Log
      throw new Error(`Error checking for existing network map '${networkMapName}': ${error?.response?.data?.message || error.message}`); // More specific error
    }
  };


  const processNetworkMapImport = async (json: NetworkMapImportJson) => {
    setLoading(true);
    setIsSavingModalVisible(true);
    console.log("[processNetworkMapImport] Starting network map import process."); // Log
    try {
      const mainMessage = json.messages?.[0];
      if (!mainMessage) {
        console.error("[processNetworkMapImport] Invalid network map JSON structure: Missing messages or first message."); // Log
        throw new Error("Invalid network map JSON structure: Missing messages or first message.");
      }

      const networkMapName = mainMessage.id.split('@')[0]?.trim();
      const cfg = mainMessage.cfg;
      const eventId = mainMessage.txTp?.replace(/\./g, "_");

      if (!networkMapName || !cfg || !eventId) {
        console.error("[processNetworkMapImport] Invalid network map JSON structure: Missing networkMapName, cfg, or eventId.", { networkMapName, cfg, eventId }); // Log
        throw new Error("Invalid network map JSON structure: Missing networkMapName, cfg, or eventId.");
      }

      console.log("🚀 Starting network map import...");
      console.log("✅ Extracted map info:", { networkMapName, cfg, eventId });

      // Check if network map already exists
      console.log(`[processNetworkMapImport] Checking if network map '${networkMapName}' already exists.`); // Log
      const { exists: nmExists, _key: nmKey } = await checkAndGetNetworkMap(json);
      console.log(`[processNetworkMapImport] Result of checkAndGetNetworkMap: nmExists=${nmExists}, nmKey=${nmKey}`); // Log the result
      if (nmExists) {
        console.log(`[processNetworkMapImport] Network Map '${networkMapName}' already exists. Aborting import.`); // Log
        showErrorModal(t("importNetworkMapPage.networkMapExists"));
        return; // Abort the function
      }
      console.log(`[processNetworkMapImport] Network Map '${networkMapName}' does not exist, proceeding to create.`); // Log

      const networkMapEvents: EventPayload[] = [];
      const ruleKeyMap: Map<string, string> = new Map(); // Map original_rule_id to _key
      const typologyInfoMap: Map<string, { _key: string, _id: string }> = new Map(); // Map original_typology_id to { _key, _id }

      console.log("[processNetworkMapImport] Iterating through messages..."); // Log
      for (const message of json.messages) {
        console.log(`[processNetworkMapImport] Processing message ID: ${message.id}`); // Log
        const currentEventTypologies: EmbeddedTypologyInEventPayload[] = [];
        const currentEventId = message.txTp?.replace(/\./g, "_");

        console.log("[processNetworkMapImport] Iterating through channels..."); // Log
        for (const channel of message.channels || []) {
          console.log(`[processNetworkMapImport] Processing channel ID: ${channel.id}`); // Log
          console.log("[processNetworkMapImport] Iterating through typologies..."); // Log
          for (const typology of channel.typologies || []) {
            console.log(`[processNetworkMapImport] Processing typology ID: ${typology.id}`); // Log
            const importedRuleKeys: string[] = [];
            console.log("[processNetworkMapImport] Iterating through rules..."); // Log
            for (const rule of typology.rules || []) {
              console.log(`[processNetworkMapImport] Processing rule ID: ${rule.id}`); // Log
              let rule_key = ruleKeyMap.get(rule.id);
              if (!rule_key) {
                console.log(`[processNetworkMapImport] Rule '${rule.id}' not in map. Calling checkAndGetRule.`); // Log
                rule_key = await checkAndGetRule(rule);
                ruleKeyMap.set(rule.id, rule_key);
              } else {
                console.log(`[processNetworkMapImport] Rule '${rule.id}' found in map. Key: ${rule_key}`); // Log
              }
              importedRuleKeys.push(rule_key);
            }
            console.log(`[processNetworkMapImport] All rules processed for typology '${typology.id}'. Imported Rule Keys:`, importedRuleKeys); // Log

            let typology_info: { _key: string, _id: string };
            if (!typologyInfoMap.has(typology.id)) {
              console.log(`[processNetworkMapImport] Typology '${typology.id}' not in map. Calling checkAndGetTypology.`); // Log
              typology_info = await checkAndGetTypology(typology, importedRuleKeys);
              typologyInfoMap.set(typology.id, typology_info); // Map original ID to { _key, _id }
            } else {
              console.log(`[processNetworkMapImport] Typology '${typology.id}' found in map. Info:`, typologyInfoMap.get(typology.id)); // Log
              typology_info = typologyInfoMap.get(typology.id)!;
            }
            
            // Construct typology object for Network Map payload using _key, id (_id), and active
            currentEventTypologies.push({
              _key: typology_info._key,
              id: typology_info._id, // Set 'id' to the _id of the created/fetched typology
              name: typology.id.split('@')[0], // Use the extracted name for the network map's embedded typology
              cfg: typology.cfg,
              desc: '', // Default
              state: '01_DRAFT', // Default
              typologyCategoryUUID: [], // Default
              rules_rule_configs: importedRuleKeys.map(rKey => ({ ruleId: rKey, ruleConfigId: [] })), // Attach rules
              active: true, // Re-added due to persistent error, setting to true for embedded context
            });
            console.log(`[processNetworkMapImport] Added typology '${typology.id}' to currentEventTypologies.`); // Log
          }
        }
        
        if (currentEventId && currentEventTypologies.length > 0) {
          networkMapEvents.push({
            eventId: currentEventId,
            typologies: currentEventTypologies,
          });
          console.log(`[processNetworkMapImport] Added event '${currentEventId}' with its typologies to networkMapEvents.`); // Log
        } else {
          console.log(`[processNetworkMapImport] Skipping event '${currentEventId}' due to missing ID or no typologies.`); // Log
        }
      }
      console.log("[processNetworkMapImport] All messages, channels, typologies, and rules processed."); // Log

      // Construct final Network Map Payload
      const networkMapPayload: NetworkMapPayload = {
        active: json.active === true, // Set to false by default if json.active is not explicitly true
        name: networkMapName,
        description: `Network Map for ${networkMapName}`, // Default description
        cfg: cfg,
        state: '01_DRAFT',
        events: networkMapEvents,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modifiedBy: 'system', // Placeholder
        ownerId: 'system', // Placeholder
        approvedBy: 'system', // Placeholder
        originatedId: '',
        edited: false,
        referenceId: 0,
        source: 'user_created',
      };
      console.log("[processNetworkMapImport] Final Network Map Payload:", networkMapPayload); // Log

      // Create the Network Map
      console.log("[processNetworkMapImport] Attempting to create Network Map..."); // Log
      const createNetworkMapResponse = await Api.post(`/network-map`, networkMapPayload);
      console.log("Network Map Import Successful:", createNetworkMapResponse.data); // Log

      showSuccessModal(t("importNetworkMapPage.importSuccess"));

    } catch (error: any) {
      console.error("Error during network map import (main catch block):", error); // Log
      console.error("Error response data (main catch block):", error.response?.data); // Log
      showErrorModal(error?.response?.data?.message || t("importNetworkMapPage.importFailed"));
    } finally {
      console.log("[processNetworkMapImport] Network map import process finished (finally block)."); // Log
      setLoading(false);
      setIsSavingModalVisible(false);
    }
  };


  const handleFileUpload = (file: any) => {
    console.log("[handleFileUpload] File upload initiated."); // Log
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        console.log("[handleFileUpload] Parsed Network Map JSON:", parsed); // Log

        setJsonContent(parsed); // Save parsed content for further use

        // Start the full import flow
        console.log("[handleFileUpload] Calling processNetworkMapImport."); // Log
        await processNetworkMapImport(parsed);

      } catch (error) {
        console.error("[handleFileUpload] Error parsing network map JSON:", error); // Log
        setModalMessage(t("importNetworkMapPage.errorParsingJson"));
        setIsErrorModalVisible(true);
      }
    };

    reader.readAsText(file);
    return false; // prevent default upload
  };

  const handleCancel = () => {
    console.log("[handleCancel] Modal cancelled."); // Log
    setIsErrorModalVisible(false);
    setIsModalVisible(false);
    setIsSavingModalVisible(false);
    setModalMessage(null);
  };

  const handleOk = () => {
    console.log("[handleOk] Modal confirmed."); // Log
    setIsModalVisible(false);
    setModalMessage(null);
  };

  if (!canImportRule) {
    console.log("[Render] Access denied."); // Log
    return <AccessDeniedPage />;
  }

  console.log("[Render] ImportNetWorkMap component."); // Log
  return (
    <div className="import-rule-config">
      <h1>{t('importNetworkMapPage.ImportRuleConfigTitle')}</h1> {/* Updated title */}

      <Dragger beforeUpload={handleFileUpload} showUploadList={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t('importNetworkMapPage.uploadPrompt')}</p>
        <p className="ant-upload-hint">{t('importNetworkMapPage.uploadHint')}</p>
      </Dragger>

      {loading && <Spin size="large" />}
      {isSavingModalVisible && (
        <Modal
          title={t('importNetworkMapPage.importingTitle')}
          open={isSavingModalVisible}
          footer={null}
          closable={false}
          maskClosable={false}
        >
          <Spin size="small" /> {t('importNetworkMapPage.importingMessage')}
        </Modal>
      )}

      <Modal
        title={t('importNetworkMapPage.importSuccessTitle')}
        open={isModalVisible}
        onCancel={handleOk}
        footer={[
          <Button key="ok" type="primary" style={lightBlueButtonStyle} onClick={handleOk}>
            {t('importNetworkMapPage.OK')}
          </Button>,
        ]}
      >
        <p>{modalMessage}</p>
      </Modal>

      <Modal
        title={t('importNetworkMapPage.importErrorTitle')}
        open={isErrorModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="ok" type="primary" style={lightBlueButtonStyle} onClick={handleCancel}>
            {t('importNetworkMapPage.OK')}
          </Button>,
        ]}
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default ImportNetWorkMap;