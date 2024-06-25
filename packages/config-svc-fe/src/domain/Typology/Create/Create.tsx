import { Row, Col, Spin, Button } from 'antd';
import React, { DragEventHandler } from 'react';
import { Rules } from './Rules';
import { IRule } from '~/domain/Rule/RuleDetailPage/service';
import TypologyForm from './Typology-Form';
import { Flow } from './Flow';
import { RulesAttached, RulesConfigurationsAttached } from './Rules-Attached';
import { Structure } from './Structure';
import TypologyDetails from './Typology-Details';
import { IRuleConfig } from '~/domain/Rule/RuleConfig/RuleConfigList/types';
import { AttachedRules } from '.';
import { NodeMouseHandler } from 'reactflow';
import { FormState, Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form';
import { useCommonTranslations } from '~/hooks';

interface Props {
  rules: IRule[];
  loadingRules: boolean;
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
  attachedRules: AttachedRules[];
  ruleDragIndex: null | number;
  setRuleDragIndex: (index: number | null) => void;
  handleDelete: (id: string, type: string) => void;
  recentlyRemovedRules: IRule[] | IRuleConfig[];
  onNodeClick: NodeMouseHandler;
  formState: FormState<any>,
  control: Control<any>,
  handleSubmit: UseFormHandleSubmit<any>,
  onSubmit: (data: any) => void;
  watch: UseFormWatch<any>;
  saveLoading: boolean;
  onOpenScoreMode: () => void

}
export const Create: React.FunctionComponent<Props> = ({ rules, loadingRules, ...props }) => {
  const{t} = useCommonTranslations();
  if (loadingRules) {
    return <Spin data-testid="spinner" className='w-full h-full mx-auto' />
  }
  return (
    <div className='pr-2' style={{ minHeight: '80vh' }}>
      <div className='flex justify-end w-full mb-2 gap-2'>
        <Button disabled={props.saveLoading} onClick={props.onOpenScoreMode}>{t('typologyScorePage.openScoringView')}</Button>
        <Button disabled={props.saveLoading} onClick={props.handleSubmit(props.onSubmit)}>{t('typologyScorePage.keepInDrafts')}</Button>
        <Button loading={props.saveLoading} onClick={props.handleSubmit(props.onSubmit)} className='text-white' style={{ backgroundColor: '#56b453' }}>Save</Button>
      </div>
      <Row className='h-full w-full'>
        <Col span={5}>
          <Rules
            attachedRules={props.attachedRules}
            selectedRule={props.selectedRule}
            setSelectedRuleIndex={props.setSelectedRuleIndex}
            rules={rules}
            ruleOptions={props.ruleOptions}
            setRuleOptions={props.setRuleOptions}
            ruleDragIndex={props.ruleDragIndex}
            setRuleDragIndex={props.setRuleDragIndex}
            recentlyRemoveRules={props.recentlyRemovedRules}
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
              handleDelete={props.handleDelete}
              onNodeClick={props.onNodeClick}
            />

          </div>
        </Col>
        <Col span={5}>

          <div className='shadow-md h-full flex flex-col'>

            <TypologyDetails attachedRules={props.attachedRules} watch={props.watch} />
            <TypologyForm {...props} />
            <RulesAttached rulesAttached={props.attachedRules} />
            <RulesConfigurationsAttached rulesAttached={props.attachedRules} />
            <Structure rulesAttached={props.attachedRules} />
          </div>
        </Col>
      </Row>
    </div>
  );
};