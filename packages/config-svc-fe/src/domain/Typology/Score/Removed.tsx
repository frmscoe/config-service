import { useEffect } from "react"
import List from "~/components/common/List";
import { FileDoneOutlined } from "@ant-design/icons";
import { Typography } from "antd";

export interface IRemovedProps {
    removed: any[];
    removeOptions: any[];
    setRemovedOptions: (others: any[]) => void;
    selectedRemoved: null | string;
    setSelectedRemoved: (index: string | null) => void;

}
export const Removed: React.FunctionComponent<IRemovedProps> = ({
    removed,
    removeOptions,
    setRemovedOptions,
    setSelectedRemoved,
}) => {

    useEffect(() => {
        setRemovedOptions(removed);
    }, [removed]);

    const handleSearch = (val: any) => {
        if (val.trim().length) {
            setRemovedOptions(removed.filter((rule) => rule.name.toLowerCase().includes(val.toLowerCase())))
        }
        if (!val.trim().length) {
            setRemovedOptions(removed);
        }
        setSelectedRemoved(null);
    }


    return <List
            handleSearch={handleSearch}
            options={removeOptions}
            list={removed}
            setOptions={setRemovedOptions}
            sortKey="subRuleRef"
            render={(outcome, index) =><div
                key={index}
                data-testid="outcome-removed-item"
                style={{ border: '2px solid #4CAE47' }}
                className="flex cursor-move justify-between items-center px-2 border mx-1 p-2 mb-2">
                <FileDoneOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />
                <Typography className="w-3/4 text-gray-500">
                   {outcome.type}: {outcome.subRuleRef}
                </Typography>
            </div>}
    />

}