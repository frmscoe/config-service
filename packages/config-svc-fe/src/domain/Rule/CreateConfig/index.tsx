import React, { useEffect, useState } from "react"
import CreateConfig from "./Create"
import usePrivileges from "~/hooks/usePrivileges"
import AccessDeniedPage from "~/components/common/AccessDenied";
import { useParams, useSearchParams } from "next/navigation";
import { postRuleConfig } from "./service";
import { DEFAULT_EXIT_CONDITIONS } from "~/constants";

const covertValue = (value: any, type: string) => {
    if(type === 'CALENDER_DATE_TIME') {
        return new Date(value).toISOString();
    }
    return value;
}
const CreateRuleConfigPage = () => {
    const {canCreateRuleConfig} = usePrivileges();
    const [conditions, setConditions] = useState(DEFAULT_EXIT_CONDITIONS);
    const [loading, setLoading] = useState(false);
    const [version, setVersion] = useState(1);
    const {id} = useParams();
    const params = useSearchParams();
    const [success, setSuccess] = useState('');
    const [serverError, setServerError] = useState('');
    const [activeKeys, setActiveKey] = useState(['1']);

    useEffect(() => {
        const lastVersion = params.get('lastVersion');
        if(lastVersion === '0') {
            setVersion(1);
        }else {
            const previous = params.get('lastVersion')?.split('.')[0];
            if(!isNaN(Number(previous))) {
                setVersion(Number(previous) + 1);
            } else{
                setVersion(1);
            }
        }
    }, [params.values]);

    const handleClose = () => {
        setSuccess('');
        setServerError('');
    }

    const onSubmit = async (data: any) => {
        setServerError('');
        //TODO update inputs for bands/cases basing on dataType
        try {
            setLoading(true);
            const obj = {
                ruleId: id,
                desc: data.description,
                cfg: `${data.major}.${data.minor || 0}.${data.patch || 0}`,
                config: {
                    exitConditions: conditions?.map((con: any) => ({ reason: con.reason, subRuleRef: con.subRefRule })),
                    bands: data.category === 'isBand' ? [...data.bands.map((band: any, index: number) => {
                        if(index === 0) {
                            return {
                                upperLimit: covertValue(band.value, data.dataType),  
                                subRuleRef: `0.${index + 1}`,
                                reason: band.reason
                            }
                        }
                        return {
                            lowerLimit:  covertValue(data.bands[index - 1].value,band.dataType),
                            upperLimit: covertValue(band.value, data.dataType),  
                            subRuleRef: `0.${index + 1}`
                        }
                    }), {
                        lowerLimit: covertValue(data.bandMaximumCondition,data.dataType),
                        subRuleRef: `0.${data?.bands?.length + 1}`,
                        reason: data.bandMaxReason,

                    }] : [],
                    cases: data.category === 'isCase' ? data?.cases.map((cs: any, index: number) => {
                        if(data?.dataType === 'CALENDER_DATE_TIME') {
                            return {
                                subRuleRef: `0.${index + 1}`,
                                reason: cs.reason,
                                value: cs.value ?  new Date(cs.value).toISOString() : cs.value,
                            }
                        }
                        return {
                            subRuleRef: `0.${index + 1}`,
                            reason: cs.reason,
                            value: cs.value,
                        }
                    }) : [],
                    parameters: data.parameters || [],
                }
            }
            await postRuleConfig(obj);
            setLoading(false);
            setSuccess('Rule Config created');
        } catch (error: any) {
            setLoading(false);
            setServerError(error?.response?.data?.message || error?.message || 'Something went wrong')
        } finally {
            setActiveKey([]);
        }
    }
    
    if(!canCreateRuleConfig) {
        return <AccessDeniedPage/>;
    }
    return <CreateConfig
            loading={loading}
            setLoading={setLoading}
            success={success}
            activeKeys={activeKeys}
            setActiveKey={setActiveKey}
            serverError={serverError}
            onSubmit={onSubmit}
            conditions={conditions}
            setConditions={setConditions}
            handleClose={handleClose}
        />
}

export default CreateRuleConfigPage;
