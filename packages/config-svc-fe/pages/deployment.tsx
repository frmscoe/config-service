// SPDX-License-Identifier: Apache-2.0
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Tabs,Table, Button, Space, message } from "antd";
import { getApprovedRuleConfigs, 
         getApprovedTypologies, 
         getRuleConfigById, 
         getApprovedNetworkMaps ,
         getTypologyById
       } from "./service";




const Deployment = () => {
  const [configs, setConfigs] = useState([]);
  const [typologies, setTypologies] = useState<any[]>([]);
  const [networkMaps, setNetworkMaps] = useState<any[]>([]);



  useEffect(() => {
    getApprovedRuleConfigs()
      .then((ruleConfigs) => {
        setConfigs(ruleConfigs);
      })
      .catch(() => message.error("Failed to fetch rule configs"));
  }, []);

  

const exportConfig = (record) => {
  let exportData;
  let filename;

  if (record.recordType === "typology") {
    const typologyId = `${record.name?.replace(/\s+/g, "-").toLowerCase()}@${record.cfg}`;
    exportData = {
      typology_name: record.name,
      id: typologyId,
      cfg: record.cfg,
      threshold: 50,
      rules: record.score?.rules || [],
      expression: record.score?.expression || {},
    };
    filename = `${typologyId.replace(/@/, ".")}.json`;
  } else if (record.recordType === "networkMap") {
    const mapId = record.name?.replace(/\s+/g, "-").toLowerCase();
    exportData = {
      active: record.active,
      messages: record.events.map(event => ({
        id: mapId,
        host: `http://gateway.openfaas:8080/function/off-transaction-aggregation-decisioning-processor-rel-${record.cfg}`,
        cfg: record.cfg,
        txTp: event.eventId,
        channels: [
          {
            id: "001@1.0.0",
            host: "http://gateway.openfaas:8080/function/off-channel-aggregation-decisioning-processor-rel-1-0-0",
            cfg: "1.0.0",
            typologies: (event.typologies || []).map(typ => ({
              id: `${typ.name}@${typ.cfg}`,
              host: `http://gateway.openfaas:8080/function/off-typology-processor-rel-${typ.cfg}`,
              cfg: typ.cfg,
              rules: (typ.rulesWithConfigs || [])
                .filter(rwc => rwc.rule)
                .map(rwc => ({
                  id: `${rwc.rule.name}@${rwc.rule.cfg}`,
                  host: `http://gateway.openfaas:8080/function/off-rule-${rwc.rule.name}-rel-${rwc.rule.cfg}`,
                  cfg: rwc.rule.cfg,
                })),
            })),
          }
        ]
      }))
    };
    filename = `${mapId}.${record.cfg}.json`;
  } else {
    const { ruleName, cfg: version } = record;
    const id = `${ruleName}@${version}`;
    filename = `${id}.json`;
    exportData = {
      id,
      cfg: version,
      ...(record.desc ? { desc: record.desc } : {}),
      config: record.config,
    };
  }

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  message.success(`Exported as ${filename}`);
};


  useEffect(() => {
    getApprovedTypologies()
      .then(async (typologies) => {
        const enriched = await Promise.all(
          typologies.map(async (typology) => {
            const ruleConfigIds = typology.rules_rule_configs.flatMap(r => r.ruleConfigId);

            const results = await Promise.all(
              ruleConfigIds.map(id =>
                getRuleConfigById(id).catch(() => null)
              )
            );

            const allApproved = results.every(cfg => cfg?.state === "20_APPROVED");

            return {
              ...typology,
              exportEligible: allApproved,
            };
          })
        );

        setTypologies(enriched);
      })
      .catch(() => message.error("Failed to fetch typologies"));
  }, []);

  

useEffect(() => {
  getApprovedNetworkMaps()
    .then(async (maps) => {
      const enriched = await Promise.all(
        maps.map(async (map) => {
          // Extract all typology IDs from all events
          const typologyRefs = map.events.flatMap((evt) => evt.typologies || []);
          const typologyIds = typologyRefs.map((t) => t.id);

          const results = await Promise.all(
            typologyIds.map((id) =>
              getTypologyById(id).catch(() => null)
            )
          );

          const allApproved = results.every((t) => t?.state === "20_APPROVED");

          return {
            ...map,
            exportEligible: allApproved,
            typologyCount: typologyRefs.length,
            recordType: "networkMap",
          };
        })
      );

      setNetworkMaps(enriched);
    })
    .catch(() => message.error("Failed to fetch network maps"));
}, []);



  const columns = [
    { title: "Item", dataIndex: "item", key: "item" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Dependencies", dataIndex: "dependencies", key: "dependencies" },
    {
      title: "",
      key: "actions",
      render: (_, record) => (
        <Space>
          {/*<Button
            onClick={() => exportConfig(record)}
            disabled={!record.exportEligible}
          >
            Export
          </Button>*/}
          <Button onClick={() => exportConfig(record)}>Export</Button>
        </Space>
      ),
    },
  ];


  

const data = [
  ...configs.map(cfg => ({
    key: cfg._key,
    item: cfg.ruleName || "Unnamed Rule",
    type: `Rule Config (v${cfg.cfg})`,
    dependencies: "–",
    exportEligible: true,
    recordType: "ruleConfig",
    ...cfg,
  })),
  ...typologies.map(typ => ({
    key: typ._key,
    item: typ.name || "Unnamed Typology",
    type: `Typology (v${typ.cfg})`,
    dependencies: `Rule Configs (${typ.rules_rule_configs?.reduce((sum, r) => sum + r.ruleConfigId.length, 0) || 0})`,
    exportEligible: typ.exportEligible,
    recordType: "typology",
    ...typ,
  })),
  ...networkMaps.map(map => ({
    key: map._key,
    item: map.name || "Unnamed Network Map",
    type: `Network Map (v${map.cfg})`,
    dependencies: `Typologies (${map.typologyCount})`,
    exportEligible: map.exportEligible,
    recordType: "networkMap",
    ...map,
  })),
];



  return (
    <>
      <Head>
        <title>Tazama - Configuration Service</title>
      </Head>
      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 24 }}>Deployment Page</h2>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </div>
    </>
  );
};

export default Deployment;
