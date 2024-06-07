import { Typography } from "antd"
import { useEffect, useState } from "react";
import { IConfig } from "./Rules-Attached";
import { AttachedRules } from ".";
import {UseFormWatch } from "react-hook-form";

export interface Props {
attachedRules: AttachedRules[];
watch: UseFormWatch<any>;
}
const TypologyDetails: React.FunctionComponent<Props> = ({attachedRules, watch}) => {
    const [configurations, setConfigurations] = useState<IConfig[]>([]);
    const [values, setValues] = useState({minor: null, major: null, patch: null});
    watch(['minor', 'major', 'patch']);

    useEffect(() => {}, [watch]);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if(name === 'minor' || name === 'major' || name === 'patch') {
                setValues((prev) => ({
                    ...prev,
                    [name]: value[name] || 0
                }))
            }
        }

        )
        return () => subscription.unsubscribe()
    }, [watch]);
    
    useEffect(() => {
        if(attachedRules.length) {
            const configList: IConfig[] = [];
            attachedRules.forEach((rule) => {
               rule.attachedConfigs.forEach((config) => configList.push({...config, ruleName: rule.name}));
            })
            setConfigurations([...configList])
        } else {
            setConfigurations([]);
        }
        
    }, [attachedRules]);


    return <div className="">
        <div className="flex justify-between items-center  px-2 border-t border-b border-gray-300">
            <Typography.Paragraph className="font-bold mt-3">Typology Details</Typography.Paragraph>
        </div>

        <div className="flex justify-between w-2/3 px-2">
            <Typography.Paragraph className="text-gray-500">Version</Typography.Paragraph>
            <Typography.Paragraph className="text-gray-500">{`${values.major !== null ? values.major : ''}.${values.minor !== null ? values.minor : ''}.${values.patch !== null ? values.patch : ''}`}</Typography.Paragraph>
        </div>

        <div className="flex px-2 justify-between w-2/3">
            <Typography.Paragraph className="text-gray-500">Rules</Typography.Paragraph>
            <Typography.Paragraph className="text-gray-500">{attachedRules.length || 0}</Typography.Paragraph>
        </div>

        <div className="flex px-2 justify-between w-2/3">
            <Typography.Paragraph className="text-gray-500">Rule Configs</Typography.Paragraph>
            <Typography.Paragraph className="text-gray-500">{configurations.length || 0}</Typography.Paragraph>
        </div>

    </div>
}
export default TypologyDetails;