// <!-- SPDX-License-Identifier: Apache-2.0 -->

import { IRule } from "~/domain/Rule/RuleDetailPage/service";
import { ITypology } from "~/domain/typology/types";
import { IRuleConfig } from "~/domain/Rule/RuleConfig/RuleConfigList/types";
import { Node, Edge, Position } from "reactflow";

// Helper to extract major, minor, patch from cfg string
export const parseConfigVersion = (cfg?: string) => {
    // Ensures 'cfg' is always treated as a string, even if null or undefined,
    // so split does not fail.
    const parts = (cfg || '0.0.0').split('.').map(Number);
    return {
        major: parts[0] || 0,
        minor: parts[1] || 0,
        patch: parts[2] || 0,
    };
};

// Helper function to create initial nodes and edges for React Flow from typology data
// This logic aims for a more readable layout: Typology -> (vertically stacked) Rules -> (horizontally from rule) Rule Configurations
export const createNodesAndEdges = (
    rulesArray: IRule[],
    handleDelete: (id: string, type: string) => void
): { nodes: Node[]; edges: Edge[] } => {
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    // Base position for the first rule node relative to the typology node
    const typologyNodeWidth = 150; // Approximate width of the typology node (ID '1') for horizontal offset
    const typologyNodeX = 0;
    const typologyNodeY = 150; // Typology node's Y position

    const ruleStartX = typologyNodeX + typologyNodeWidth + 100; // Starting X position for rule nodes, offset from typology
    const ruleStartY = typologyNodeY - (rulesArray.length * 75 / 2); // Center rules vertically around typology node's Y

    // Vertical spacing between rule nodes
    const ruleVerticalSpacing = 150; // Increased spacing for better separation

    // Horizontal spacing between a rule node and its first config
    const configOffsetX = 250; // Keep reasonable space from rule

    rulesArray.forEach((rule, ruleIndex) => {
        // FIXED: Ensure rule.name is present, fallback if not
        const ruleName = rule.name || rule._key.split('/')[1] || 'Unnamed Rule';
        
        // Calculate position for the current rule node (vertically stacked)
        const ruleNodeY = ruleStartY + (ruleIndex * ruleVerticalSpacing);

        // Add rule node
        const ruleNode: Node = {
            id: rule._key,
            type: 'customNode',
            position: { x: ruleStartX, y: ruleNodeY },
            data: {
                label: ruleName, // Use safe rule name
                ...rule,
                type: 'rule', // Custom type to identify as a rule node
                onDelete: handleDelete, // Callback for delete functionality
                showDelete: true, // Flag to display delete button
            },
            sourcePosition: Position.Right, // Exit point for edges
            targetPosition: Position.Left,  // Entry point for edges
        };
        nodes.push(ruleNode);

        // Add edge from initial '1' (Typology) node to this rule node
        edges.push({
            id: `edge-1-${rule._key}`, // Unique ID for the edge
            source: '1', // Source node (Typology)
            target: rule._key, // Target node (current rule)
            type: 'smoothstep', // Visual style of the edge
            animated: false // Ensure no animation
        });

        // Add rule configuration nodes for the current rule
        // These configs will be laid out horizontally from their parent rule,
        // and vertically if multiple configs for the same rule
        // CRITICAL FIX: Iterate over rule.attachedConfigs, not rule.ruleConfigs
        rule.attachedConfigs?.forEach((config, configIndex) => { // CHANGED FROM rule.ruleConfigs
            // FIXED: Ensure config.cfg and name are present, fallback if not
            const configLabel = config.cfg || config._key.split('/')[1] || 'Unnamed Config';

            const configNode: Node = {
                id: config._key,
                type: 'customNode',
                // Position relative to its parent rule node,
                // horizontally offset, and slightly vertically stacked if multiple configs
                position: {
                    x: ruleNode.position.x + configOffsetX,
                    y: ruleNode.position.y + (configIndex * 60) // Slight vertical offset for configs of same rule
                },
                data: {
                    label: `${ruleName} - ${configLabel}`, // More descriptive label for config
                    ...config,
                    type: 'config', // Custom type to identify as a config node
                    onDelete: handleDelete,
                    showDelete: true,
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            };
            nodes.push(configNode);

            // Add edge from the rule node to its configuration node
            edges.push({
                id: `edge-${rule._key}-${config._key}`,
                source: rule._key, // Source node (parent rule)
                target: config._key, // Target node (current config)
                type: 'smoothstep',
                animated: false // Ensure no animation
            });
        });
    });

    return { nodes, edges };
};

// This function is intended for layouting nodes.
// Given your current `onDrop` logic explicitly sets positions, this function
// will simply return the nodes as they are. If a graph layout library (e.g., Dagre, Elk)
// were integrated, its logic would go here to automatically calculate positions.
export const updateLayout = (nodes: Node[], edges: Edge[]): Node[] => {
    // For automatic layout, you would integrate a library here.
    // For now, it returns the nodes as they are (or a deep copy)
    // as positions are largely managed by the drag-and-drop logic.
    return JSON.parse(JSON.stringify(nodes));
};

// Compares the current form state and attached rules against the original loaded data
// to determine if there are unsaved changes.
export const hasChanged = (
    originalData: ITypology & { attachedRules: IRule[] },
    currentFormData: any,
    currentAttachedRules: IRule[]
): boolean => {
    // If there's no original data to compare against (e.g., on a new creation form),
    // and current form data or rules exist, it implies changes have been made.
    if (!originalData || !originalData._key) {
        // Check for non-empty string for name/description, or if rules have been added
        return (currentFormData.name && currentFormData.name.trim() !== '') ||
               (currentFormData.description && currentFormData.description.trim() !== '') ||
               currentAttachedRules.length > 0;
    }

    // Compare form fields (name, description)
    const formFieldsChanged = originalData.name !== currentFormData.name ||
        originalData.desc !== currentFormData.description;

    // Compare version (cfg) using parsed numeric values
    // FIXED: Ensure originalData.cfg is not undefined when passed to parseConfigVersion
    const originalCfgParts = parseConfigVersion(originalData.cfg || '0.0.0');
    const currentCfgParts = parseConfigVersion(`${currentFormData.major}.${currentFormData.minor}.${currentFormData.patch}`);
    const versionChanged = originalCfgParts.major !== currentCfgParts.major ||
                           originalCfgParts.minor !== currentCfgParts.minor ||
                           originalCfgParts.patch !== currentCfgParts.patch;

    // Compare attached rules and their configurations
    // First, check if the number of rules differs
    if (originalData.attachedRules.length !== currentAttachedRules.length) {
        return true;
    }

    // Then, deep compare rules and their configs
    for (const originalRule of originalData.attachedRules) {
        const currentRule = currentAttachedRules.find(r => r._key === originalRule._key);

        // If a rule from original data is not found in current attached rules, it's a change
        if (!currentRule) {
            return true;
        }

        // Compare attached configurations for each rule
        if (originalRule.attachedConfigs.length !== currentRule.attachedConfigs.length) {
            return true;
        }

        for (const originalConfig of originalRule.attachedConfigs) {
            const currentConfig = currentRule.attachedConfigs.find(c => c._key === originalConfig._key);
            // If a config from original rule is not found in current rule's configs, or its 'cfg' changed
            // Assuming 'cfg' is the only relevant differentiating property for configs when comparing
            if (!currentConfig || originalConfig.cfg !== currentConfig.cfg) {
                return true;
            }
        }
    }

    // Also check if any new rules were added that weren't in the original data (important for newly added rules)
    for (const currentRule of currentAttachedRules) {
        if (!originalData.attachedRules.some(r => r._key === currentRule._key)) {
            return true;
        }
    }

    return formFieldsChanged || versionChanged;
};