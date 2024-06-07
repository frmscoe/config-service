import { CloseOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons"
import styles from './style.module.scss';
import { DragEvent, DragEventHandler } from "react";

const SlashIcon: React.FunctionComponent<{ width?: string; height?: string; className?: string }> = ({ width, height, className }) => (
    <svg
        width={width || '1rem'}
        height={height || '1rem'}
        viewBox="0 0 1024 1024"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className || ''}

    >
        <path d="M742.6 273.4l-448 448c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l448-448c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z" />
    </svg>
);

const DashedBoxIcon: React.FunctionComponent<{ width?: string; height?: string; className?: string }> = ({ width, height, className }) => (
    <svg
        width={width || '1rem'}
        height={height || '1rem'}
        viewBox="0 0 1024 1024"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className || ''}
    >
        <rect
            x="112"
            y="112"
            width="800"
            height="800"
            fill="none"
            stroke="currentColor"
            strokeWidth="32"
            strokeDasharray="16 16"
        />
    </svg>
);
export interface Props {
    onDrop?: DragEventHandler<any>
}
export const Conditions: React.FunctionComponent<Props> = ({ onDrop }) => {
    const onDragStart = (event: DragEvent, sign: string) => {
        event.dataTransfer.setData('type', 'operator');
        event.dataTransfer.setData('data', sign);
        event.dataTransfer.effectAllowed = 'move';
    }

    return <div className="flex gap-2">
        <PlusOutlined onDrop={onDrop} onDragStart={(e) => onDragStart(e, '+')} draggable className={styles['icon']} />
        <MinusOutlined onDrop={onDrop} onDragStart={(e) => onDragStart(e, '-')} draggable className={styles['icon']} />
        <CloseOutlined onDrop={onDrop} onDragStart={(e) => onDragStart(e, 'x')} draggable className={styles['icon']} />
        <div draggable onDrop={onDrop} onDragStart={(e) => onDragStart(e, '/')} >
            <SlashIcon width="2rem" height="2.2rem" className="border border-gray-500 cursor-pinter" />

        </div>
        <div draggable onDrop={onDrop} onDragStart={(e) => onDragStart(e, 'group')} >
            <DashedBoxIcon width="2rem" height="2.2rem" className="border border-gray-500 cursor-pinter" />
        </div>
    </div>
}