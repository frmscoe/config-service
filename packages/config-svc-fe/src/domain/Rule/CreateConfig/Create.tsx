import React, { useEffect, useRef, useState } from 'react';
import { Typography } from 'antd';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';

import { ConfigForm } from './Forms';

export interface IProps {
    loading: boolean;
    setLoading: (val: boolean) => void,
    success: string;
    serverError: string;
    activeKeys: string[];
    setActiveKey: (keys: string[]) => void;
    onSubmit: (data: any) => void;
    conditions: any[];
    setConditions: (conditions: any[]) => void;
    handleClose: () => void;
}
const CreateConfig: React.FunctionComponent<IProps> = (props) => {
    const [open, setOpen] = useState(false);
    const reactFlowWrapper = useRef<any>(null);
    const [center, setCenter] = useState({ x: 0, y: 0 });

    const showDrawer = () => {
        setOpen(true);
    };

    useEffect(() => {
        const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect();
        const centerX = reactFlowBounds.width / 2;
        const centerY = reactFlowBounds.height / 4;
        setCenter({ x: centerX, y: centerY })
    }, [reactFlowWrapper]);


    const nodes = [
        {
            id: '1',
            data: { label: 'New Rule Config' },
            position: { x: 0, y: 0 },
            width: 200,
            height: 100,
        },
    ];

    const handleElementClick = () => {
        showDrawer();
    }
    return (
        <>
            <Typography.Title className='px-2' level={3}>New Rule Configuration</Typography.Title>
            <div style={{ height: '100%' }}>
                <ReactFlow fitView onNodeClick={handleElementClick} nodes={nodes} ref={reactFlowWrapper}>
                    <Background />
                    <Controls />
                    <MiniMap nodeStrokeWidth={3} zoomable pannable />
                </ReactFlow>
            </div>
            <ConfigForm
                open={open}
                setOpen={setOpen}
                {...props}
            />
        </>
    )
}



export default CreateConfig;
