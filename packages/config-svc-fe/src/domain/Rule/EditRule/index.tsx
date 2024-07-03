import React, { useEffect, useState } from 'react';
import EditRule, { FormData } from './Edit';
import { updateRule } from './service';
import { useCommonTranslations } from '~/hooks';
import { IRule, getRules } from '../RuleDetailPage/service';
import { createRule } from '../CreateRule/service';
import { incrementVersion } from '~/utils';

interface Props {
    open: boolean;
    setOpen(val: boolean): void;
    afterCreate(): void;
    rule: IRule | null;
    setSelectedRule(rule: IRule | null): void;
}
const EditRulePage: React.FunctionComponent<Props> = (props) => {
    const { t } = useCommonTranslations();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [rules, setRules] = useState<IRule[]>([]);

    const handleSubmit = async (data: FormData) => {
        try {
            setSuccess('');
            setError('');
            setLoading(true);
            if (!(data.state === "01_DRAFT")) {
                const version = incrementVersion(props.rule?.cfg as string, data.changeType as string, (rules || []).map((r) => r.cfg));
                await createRule(
                    {
                        cfg: version,
                        desc: data.description,
                        state: '01_DRAFT',
                        name: data.name,
                        dataType: 'NUMERIC',
                    }
                );
                setSuccess('Rule has been created successfully');
            } else {
                await updateRule({
                    cfg: `${data.major}.${data.minor}.${data.patch}`,
                    desc: data.description,
                    state: '01_DRAFT',
                    name: data.name,
                    dataType: 'NUMERIC',
                }, props.rule?._key as string);
                setSuccess('Rule has been updated successfully');
            }
            props.afterCreate && props.afterCreate();
            setTimeout(() => {
                setSuccess('');
            }, 3000);
            props.setOpen(false);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t('generalError'));
        } finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        getRules({ page: 1, limit: 99999 })
            .then(({ data }) => {
                setRules(data.rules);
            }).catch((e) => {
                setError(e.response?.data?.message || e?.message || 'Something went wrong')
            });
    }, []);
    return <EditRule
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success={success}
        {...props}
    />
}

export default EditRulePage;