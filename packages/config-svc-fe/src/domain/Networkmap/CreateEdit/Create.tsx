import { Row, Col, Spin, Button, Collapse, Space, Typography, Card, Checkbox } from 'antd';
import React, { DragEventHandler, useMemo } from 'react';
import { EventsProps } from './Events';
import { IRule } from '~/domain/Rule/RuleDetailPage/service';
import { RulesAttached, RulesConfigurationsAttached } from './Rules-Attached';
import { Handle, NodeMouseHandler, NodeProps, Panel, Position } from 'reactflow';
import { useCommonTranslations } from '~/hooks';
import { Flow } from '../../Typology/Create/Flow';
import { CloseOutlined, ExpandAltOutlined, MinusCircleFilled, NodeIndexOutlined, PlusCircleFilled } from '@ant-design/icons';
import styles from './style.module.scss';
import { UnAssignedTypologies, UnassignedTypologiesProps } from './Typology-List';
import { RuleWithConfig } from '~/domain/Typology/Score/service';
import Link from 'next/link';

interface Props {
  loadingTypologies: boolean;
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onConnect: any;
  onEdgesChange: any;
  onDrop: DragEventHandler;
  flowRef: any
  ruleOptions: IRule[];
  setRuleOptions: (rules: IRule[]) => void;
  selectedRule: null | string;
  setSelectedRuleIndex: (index: string | null) => void;
  attachedRules: RuleWithConfig[];
  ruleDragIndex: null | number;
  setRuleDragIndex: (index: number | null) => void;
  onNodeClick: NodeMouseHandler;
  saveLoading: boolean;
  showVersions: boolean;
  setShowVersions: (val: boolean) => void;
  events: { label: string, disabled: boolean, value: string, color?: string }[];
  expandAll: () => void;
  loadingAttached: boolean;
  handleSave: () => void;

}

const Version = React.lazy(() => import('./Versions'));

const EventNode: React.FunctionComponent<NodeProps> = ({ data, id }) => {
  const handleExpand = () => {
    if (data.handleExpand) {
      data.handleExpand(id);
    }
  }
  return <div className={styles['custom-node']}>
    <NodeIndexOutlined />
    {data.label}
    {data.expanded ? <MinusCircleFilled className='relative left-5 top-0' onClick={handleExpand} style={{ fontSize: '1.5rem', color: '#54B352', cursor: 'pointer' }} />
      : <PlusCircleFilled className='relative left-5 top-0' onClick={handleExpand} style={{ fontSize: '1.5rem', color: '#54B352', cursor: 'pointer' }} />}
    <Handle
      type="source"
      id={id}
      position={Position.Right}
      className={styles['hidden-handle']}

    />
  </div>
}

const TypologyNode: React.FunctionComponent<NodeProps> = ({ data, id }) => {
  const {t} = useCommonTranslations();
  const ruleConfigurations = useMemo(() => {
    const configurations: string[] = [];
    data?.rules_rule_configs?.forEach((r: { ruleId: string; ruleConfigId: string[] }) => {
      r?.ruleConfigId?.forEach((c: string) => {
        configurations.push(c);
      })
    });
    return configurations;
  }, [data]);

  const handleDelete = () => {
    if (data.handleDelete) {
      data.handleDelete(id, data);
    }
  }

  const handleExpandVersions = () => {
    if (data.handleExpandVersions) {
      data.handleExpandVersions(id, data.expanded);
    }
  }
  return <Card className='p-0 m-0'
    title={data.label || data.name || "Typology"}
    data-testid="typology-node"
    extra={<>
      <CloseOutlined data-testid="remove-node" className={styles['delete-icon']} onClick={handleDelete} />
      {/* <ExpandAltOutlined style={{fontSize: '1.2rem'}} onClick={handleExpand} className='cursor-pointer' /> */}
    </>}
    styles={{ header: { background: '#EEEEEE' } }}
    style={{ minWidth: 350 }}>
    <Row>
      <Col span={23}>
        <div className='flex justify-between'>
          <Typography.Paragraph>{t('createEditNetworkMap.lastUpdated')}</Typography.Paragraph>
          <Typography.Paragraph>{new Date(data.updatedAt).toDateString()}</Typography.Paragraph>
        </div>
        <div className='flex justify-between'>
          <Typography.Paragraph>{t('createEditNetworkMap.rules')}</Typography.Paragraph>
          <Typography.Paragraph>{data?.rules_rule_configs?.length}</Typography.Paragraph>
        </div>

        <div className='flex justify-between'>
          <Typography.Paragraph>{t('createEditNetworkMap.configurations')}</Typography.Paragraph>
          <Typography.Paragraph>{ruleConfigurations.length}</Typography.Paragraph>
        </div>
      </Col>
      <Col span={1} className='h-full w-full mx-auto relative left-5 top-4'>
        {data.expanded ? <MinusCircleFilled data-testid="close-expand" onClick={handleExpandVersions} style={{ fontSize: '2rem', color: '#54B352', cursor: 'pointer' }} />
          : <PlusCircleFilled data-testid="open-expand" onClick={handleExpandVersions} style={{ fontSize: '2rem', color: '#54B352', cursor: 'pointer' }} />}      </Col>
    </Row>

    <Handle type="target" id={id} position={Position.Left} />
    <Handle type="source" id={id} position={Position.Right}
      className={styles['hidden-handle']}
    />
  </Card>
}

const VersionNode: React.FunctionComponent<NodeProps> = ({ data, id }) => {
  const handleCheck = () => {
    if (data.handleCheck) {
      data.handleCheck(data, !data.checked);
    }
  }
  return <div className={styles['custom-node']} data-testid="version-node">
    <Checkbox checked={data.checked} data-testid="version-node-check" onChange={handleCheck} />
    {data.label}
    <Handle
      type="source"
      id={id}
      position={Position.Right}
      className={styles['hidden-handle']}
    />

    <Handle
      type="target"
      id={id}
      position={Position.Left}
      className={styles['hidden-handle']}
    />
  </div>
}

const nodeTypes = { eventNode: EventNode, typologyNode: TypologyNode, versionNode: VersionNode };

export const Create: React.FunctionComponent<Props & UnassignedTypologiesProps & EventsProps> = ({ loadingTypologies, ...props }) => {
  const { t } = useCommonTranslations();

  //Disabled donot delete
  // const events: MenuProps['items'] = useMemo(() => {
  //   return props.events.map((e) => ({
  //     key: e.value, icon: <CheckCircleOutlined />,
  //     label: <Tag className='rounded-full' color={e.color || 'blue'}>{e.label}</Tag>,
  //     disabled: e.disabled,
  //   }))
  // }, [props.events]);
  if (loadingTypologies) {
    return <Spin data-testid="spinner" className='w-full h-full mx-auto' />
  }

  return (
    <div className='pr-2' style={{ minHeight: '80vh' }}>
      <div className='flex justify-between w-full mb-2 gap-2'>
        <div className='flex gap-2 ml-auto'>
          <Button loading={props.saveLoading} onClick={props.handleSave} className='text-white' style={{ backgroundColor: '#56b453' }}>
            {t('createEditNetworkMap.save')}
          </Button>
          <Button loading={props.saveLoading} className='text-white bg-red-500' >
            <Link href="/network-map">{t('createEditNetworkMap.cancel')}</Link>
          </Button>

        </div>
      </div>
      <React.Suspense fallback={<Spin />}>
        <Version
          open={props.showVersions}
          setOpen={props.setShowVersions}
        />
      </React.Suspense>
      <Row className='h-full w-full'>
        <Col span={5}>
          {/* Disabled not part of this iteration */}
          {/* <Events
            {...props}
          /> */}

          <UnAssignedTypologies
            {...props}
          />
        </Col>
        <Col span={14}>
          <div style={{ height: '100%' }}>
            <Flow
              nodes={props.nodes}
              edges={props.edges}
              onNodesChange={props.onNodesChange}
              onConnect={props.onConnect}
              onEdgesChange={props.onEdgesChange}
              onDrop={props.onDrop}
              flowRef={props.flowRef}
              onNodeClick={props.onNodeClick}
              nodeTypes={nodeTypes}
            >
              {/* Disabled not part of this iteration. Donot Delete */}

              {/* <Panel position="top-left">

                  <Dropdown menu={{ items: events }}>
                    <Button className='bg-white' onClick={(e) => e.preventDefault()}>
                      <Space>
                        Active Events
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                </Panel> */}

              <Panel position="top-center">
                <Button
                  data-testid="expand-all"
                  onClick={(e) => {
                    e.preventDefault();
                    props.expandAll();
                  }}>
                  <Space className='text-gray'>
                    <ExpandAltOutlined className='cursor-pointer' />
                    {t('createEditNetworkMap.expandAll')}
                  </Space>
                </Button>
              </Panel>

            </Flow>

          </div>
        </Col>
        <Col span={5}>
          <div className='shadow-md h-full flex flex-col'>
            <Collapse
              defaultActiveKey={['1', '2']}
              expandIconPosition={"end"}
              items={[{
                key: '1',
                label: t('createEditNetworkMap.allRules'),
                children: <RulesAttached loadingAttached={props.loadingAttached} rulesAttached={props.attachedRules} />
              },
              {
                key: '2',
                label: t('createEditNetworkMap.rulesConfigurationsAttached'),
                style: { padding: 0 },
                children: <RulesConfigurationsAttached
                  loadingAttached={props.loadingAttached}
                  rulesAttached={props.attachedRules} />

              }]}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};