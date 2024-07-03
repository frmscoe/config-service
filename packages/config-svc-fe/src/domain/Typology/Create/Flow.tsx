import { CloseOutlined } from "@ant-design/icons";
import { DragEventHandler, useCallback, useMemo } from "react";
import ReactFlow, {
    Edge,  Node, Handle, OnConnect, OnEdgesChange,
     OnNodesChange, Position, NodeMouseHandler, 
     ConnectionLineType,
    ReactFlowProps
} from "reactflow";
import styles from './style.module.scss';
import React from "react";
import { Form, InputNumber } from "antd";

interface Props {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onConnect: OnConnect;
    onEdgesChange: OnEdgesChange;
    onDrop: DragEventHandler,
    flowRef: any;
    handleDelete?: (id: string, type: string) => void;
    onNodeClick: NodeMouseHandler;
}


export const CustomNode: React.FunctionComponent<any> = ({ id, data }) => {
    const handleDelete = () => {
        if (data.onDelete) {
            data.onDelete(id, data.type);
        }
    };
    const showDelete = useMemo(() => {
        return data.showDelete !== undefined ? data.showDelete : true
    }, [data]);
    return (
        <div
            className={styles['custom-node']}
            data-testid="node"
        >
            <div className={styles['custom-node-content']}>
                {data?.label}
                {showDelete ? <CloseOutlined data-testid="remove-node" className={styles['delete-icon']} onClick={handleDelete} /> : null}
            </div>
            <Handle type="target" id={id} position={Position.Left} />
            <Handle type="source" id={id} position={Position.Right} />
        </div>
    );
};


const ScoreNode: React.FunctionComponent<any> = ({ data, id }) => {
    const onChange = (val: null | number) => {
        if (val && data.onScoreChange) {
            data.onScoreChange(id, val, data.ruleId);
        }
    }
    return (
        <div
            className={styles['custom-node']}
            data-testid="score-node">
            <div >
                <Form layout="vertical" className="py-0 my-0" >
                    <Form.Item className="py-0 my-0 text-center">
                        <InputNumber
                            data-testid={`score-input`}
                            type="number"
                            className={`${styles['custom-input']} w-4/4 py-0 my-0`}
                            placeholder="Score"
                            value={data.score || 0}
                            onChange={onChange}
                        />
                    </Form.Item>
                </Form>
            </div>
            <Handle type="target" id={id} position={Position.Left} />
            <Handle type="source" id={id} position={Position.Right} />

        </div>
    );
};


const OperatorNode: React.FunctionComponent<any> = ({ data, id }) => {
    return (
        <div
            style={{}}
            className="text-start"
            data-testid="operator-node">

            <div >
                <p style={{ fontSize: '5rem' }}
                    className={'text-black'}>{data.label}</p>
            </div>
            <Handle type="target" id={id} position={Position.Left} />
        </div>
    );
};


const nodeTypes = { customNode: CustomNode, scoreNode: ScoreNode, operatorNode: OperatorNode };

export const Flow: React.FunctionComponent<Props & ReactFlowProps> = ({
    nodes,
    edges,
    onNodesChange,
    onConnect,
    onEdgesChange,
    onDrop,
    flowRef,
    handleDelete,
    onNodeClick,
    children,
    ...props
}) => {

    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const updatedNodes = React.useMemo(() => {
        return nodes.map((node) => {
            if (node.type === 'customNode') {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        onDelete: handleDelete,
                    },
                };
            }
            return node;
        });
    }, [nodes]);

    return (
        <ReactFlow
            nodes={updatedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            style={{ backgroundColor: '#D9EBE5' }}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            snapToGrid={true}
            ref={flowRef}
            connectionLineType={ConnectionLineType.SmoothStep}
            {...props}
        >
            {children}
        </ReactFlow>
    );

}
