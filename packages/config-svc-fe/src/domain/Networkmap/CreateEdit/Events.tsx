import { FileDoneOutlined } from "@ant-design/icons"
import { Input, Typography } from "antd"
import { useEffect, useMemo } from "react"
import { useCommonTranslations } from "~/hooks";
import { sortAlphabetically } from "~/utils";

export interface IEvent {
    label: string;
    disabled: boolean;
    value: string;
    color: string;
}
export interface EventsProps {
    events: IEvent[];
    eventOptions: IEvent[];
    setEventOptions: (rules: IEvent[]) => void;
    selectEvent: null | string;
    setSelectedEvent: (index: string | null) => void;
    attachedEvents: IEvent[];

}
export const Events: React.FunctionComponent<EventsProps> = ({
    events,
    eventOptions,
    setEventOptions,
    selectEvent,
    setSelectedEvent,
    attachedEvents,
}) => {
    const attachedEventsIds = useMemo(() => {
        return attachedEvents.map((r) => r.value);

    }, [attachedEvents]);

    useEffect(() => {
        setEventOptions(events);
    }, [events]);

    const handleSearch = (val: any) => {
        if (val.trim().length) {
            setEventOptions(events.filter((rule) => rule.value.toLowerCase().includes(val.toLowerCase())))
        }
        if (!val.trim().length) {
            setEventOptions(events);
        }
        setSelectedEvent(null);
    }

    return <div>
        <div className="flex justify-between items-center  px-2 border-t border-b border-gray-300">
            <Typography.Paragraph className="font-bold mt-3">Events</Typography.Paragraph>
        </div>
        <div className="px-2">
            <Input
                placeholder={'Search Events'}
                disabled
                className="border-none shadow-none focus:ring-0 my-2"
                onChange={(e) => handleSearch(e?.target?.value || '')}
                data-testid="search-rules-input"
            />

            {
                (sortAlphabetically(eventOptions, 'label')).map((r: IEvent, index) => {
                    if (attachedEventsIds.includes(r.value)) {
                        return null;
                    }
                    return <div
                        draggable
                        key={index}
                        onDragStart={(e) => {
                            e.dataTransfer.setData('application/reactflow', 'node');
                            e.dataTransfer.setData('type', 'rule');
                            e.dataTransfer.setData('index', (selectEvent)?.toString() as string);
                            e.dataTransfer.setData('data', JSON.stringify(r));
                            e.dataTransfer.effectAllowed = 'move';
                            setSelectedEvent(r.value);
                        }}
                        onClick={() => setSelectedEvent(r.value)}
                        data-testid="rule-drag-item"
                        style={{ border: selectEvent === r.value ? '2px solid #4CAE47' : '' }}
                        className="flex cursor-move justify-between items-center border-gray-400 px-2 border mx-1 p-2 mb-2">
                        <FileDoneOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />
                        <Typography className="w-3/4 font-bold">
                            {r.label}
                        </Typography>
                    </div>
                })
            }
        </div>

    </div>
}