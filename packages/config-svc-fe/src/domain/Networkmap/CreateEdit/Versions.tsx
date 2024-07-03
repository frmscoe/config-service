import { Checkbox, Col, Modal, Row } from "antd"
import { Position } from "reactflow";
import { Flow } from "../../Typology/Create/Flow";
import { ExpandAltOutlined } from "@ant-design/icons";
import styles from './style.module.scss';

const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    type: 'eventNode'
};
const initialNodes = [
    {
        id: '1',
        position: { x: 0, y: 150 },
        data: { label: 'Event', showDelete: false },
        ...nodeDefaults,

    },
    {
        id: '2',
        position: { x: 300, y: 200 },
        data: { label: 'Typology 2', showDelete: false },
        ...nodeDefaults,
        type: 'typologyNode'

    },

    {
        id: '3',
        position: { x: 400, y: 200 },
        data: { label: 'Version 1.3.5', showDelete: false },
        ...nodeDefaults,
        type: 'versionNode'

    },
];

const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep'
    },

    {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'smoothstep'
    },
];
interface Props {
    open: boolean;
    setOpen: (val: boolean) => void;
}

const VersionList: React.FunctionComponent<{ versions: any[] }> = ({ versions }) => {
    return versions.map((v, i) => {
        return <div key={i.toString()} className="mb-5 p-2"
            style={{borderBottom: '10px', borderBottomColor: '#54B352'}}
        >
            <Flow
                nodes={initialNodes}
                edges={initialEdges}
                onDrop={console.log}
                onNodesChange={console.log}
                onConnect={console.log}
                onEdgesChange={console.log} flowRef={undefined}
                handleDelete={console.log}
                onNodeClick={console.log}
                style={{ minHeight: '20vh',  backgroundColor: 'white'}}
                className={ styles['version-card'] + " mb-2 shadow-md"}

            >
            </Flow>
            <div className={'flex justify-start gap-5 px-10'}>
                <Checkbox />
                Version {i + 1}
            </div>

        </div>
    })
}


const Version: React.FunctionComponent<Props> = ({ open, setOpen }) => {
    const versionsList = [1, 2, 3, 5, 6]
    return <Modal
        closable={false}
        footer={null}
        styles={{content: {
           padding: 0,
        }}}
        title={
            <div className="flex justify-between items-center border-b border-grey-300 px-10 py-2">
                <div>Typology 1 Design</div>
                <ExpandAltOutlined onClick={() => setOpen(false)} className="cursor-pointer" />
            </div>
        }
        
        style={{ minWidth: '70vw', minHeight: '80vh'}} 
        open={open} onCancel={() => setOpen(false)} destroyOnClose>
        <Row gutter={10} className="px-2">
            <Col span={18}>
                <Flow
                    nodes={initialNodes}
                    edges={initialEdges}
                    onDrop={console.log}
                    onNodesChange={console.log}
                    onConnect={console.log}
                    onEdgesChange={console.log} flowRef={undefined}
                    handleDelete={console.log}
                    onNodeClick={console.log}
                    style={{ minHeight: '60vh' }}

                >

                </Flow>

            </Col>
            <Col span={6} className="bg-gray-100 border border-grey-200" style={{ overflowY: 'scroll', height: '60vh' }}>
                <VersionList
                    versions={versionsList}
                />

            </Col>

        </Row>

    </Modal>
}

export default Version;

