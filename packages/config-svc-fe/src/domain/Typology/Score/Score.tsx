import { Row, Col, Spin, CollapseProps, Collapse, Button, Result } from 'antd';
import React, { DragEventHandler, useMemo } from 'react';
import { IRule } from '~/domain/Rule/RuleDetailPage/service';
import { Flow } from '../Create/Flow';
import { IRuleConfig } from '~/domain/Rule/RuleConfig/RuleConfigList/types';
import { AttachedRules } from '../Create/index';
import { NodeMouseHandler, ReactFlowProps } from 'reactflow';
import { Conditions } from './Conditions';
import { Rules } from './Rules';
import styles from './style.module.scss';
import { Outcomes, OutComeProps } from './Outcomes';
import { IOtherProps, Others } from './Others';
import { IRemovedProps, Removed } from './Removed';
import TypologyDetails from './TypologyInfo';
import { OutcomesAttached, RulesAttached } from './Attached';
import { useCommonTranslations } from '~/hooks';
import { RuleWithConfig } from './service';

interface Props {
  rules: RuleWithConfig[] | any[];
  loadingRules: boolean;
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onConnect: any;
  onEdgesChange: any;
  onDrop: DragEventHandler;
  flowRef: any
  ruleOptions: RuleWithConfig[];
  setRuleOptions: (rules: RuleWithConfig[]) => void;
  selectedRule: null | string;
  setSelectedRuleIndex: (index: string | null) => void;
  attachedRules: AttachedRules[];
  ruleDragIndex: null | number;
  setRuleDragIndex: (index: number | null) => void;
  handleDelete: (id: string, type: string) => void;
  recentlyRemovedRules: RuleWithConfig[] | IRuleConfig[];
  onNodeClick: NodeMouseHandler;
  saveLoading: boolean;
  handleSelectRule: (id: string) => void;
  activeKeys: string | string[];
  setActiveKeys: (key: string | string[]) => void;
  fetchTypology: () => void;
  error: string;
  onOpenTypologyView: () => void;

}
export const Score: React.FunctionComponent<Props & OutComeProps & IOtherProps & IRemovedProps & ReactFlowProps> = ({ rules, loadingRules, ...props }) => {
  const {t} = useCommonTranslations();

  const items: CollapseProps['items'] = useMemo(() => {
    return [
      {
        key: '1',
        label: t('typologyScorePage.conditions'),
        children: <Conditions onDrop={props.onDrop} />
      },
      {
        key: '2',
        label: t('typologyScorePage.rules'),
        style: { padding: 0 },
        children: <Rules 
          rules={rules} 
          {...props} 
          />,
      },
      {
        key: '3',
        label: t('typologyScorePage.outcomes'),
        children: <Outcomes {...props} />
      },
      {
        key: '4',
        label: t('typologyScorePage.others'),
        children: <Others {...props} />,
      },
      {
        key: '5',
        label: t('typologyScorePage.recentlyRemoved'),
        children: <Removed {...props} />,
      },
    ];
  }, [props, t]);

  if (loadingRules) {
    return <Spin data-testid="spinner" className='w-full h-full mx-auto' />
  }

  if (props.error) {
    return <Result
        date-testid="result-error"
        status="500"
        title="500"
        subTitle={props.error}
        extra={<Button type="primary" className="bg-blue-500" onClick={props.fetchTypology}>Retry</Button>}
    />
}
  
  return (
    <div className='pr-2' style={{ minHeight: '80vh' }}>
      <div className='flex justify-end w-full mb-2 gap-2'>
      <Button onClick={props.onOpenTypologyView}>{t('typologyScorePage.openScoringView')}</Button>
      <Button>{t('typologyScorePage.keepInDrafts')}</Button>
      <Button className='bg-green-500 text-white'>{t('submit')}</Button>
      </div>
      <Row className='h-full w-full'>
        <Col span={5}>
          <Collapse items={items}
            onChange={props.setActiveKeys} 
            activeKey={props.activeKeys}
            className={styles['custom-collapse']} />
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
              handleDelete={props.handleDelete}
              onNodeClick={props.onNodeClick}
            />
          </div>
        </Col>
        <Col span={5}>
          <div className='shadow-md h-full flex flex-col'>
            <Collapse
              defaultActiveKey={['11']}
              items={[
                {
                  key: '11',
                  label: t('typologyScorePage.typologyInformation'),
                  children: <TypologyDetails
                    outcomes={props.selectedOutcomes} 
                    rules={rules}
                    nodes={props.nodes}
                  />
                },
                {
                  key: '12',
                  label: t('typologyScorePage.rulesAttached'),
                  children: <RulesAttached
                    outcomes={props.selectedOutcomes}
                    rules={rules}
                  />
                },
                {
                  key: '13',
                  label: t('typologyScorePage.outcomesAttached'),
                  children: <OutcomesAttached
                    outcomes={props.selectedOutcomes}
                  />
                }
              ]}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};