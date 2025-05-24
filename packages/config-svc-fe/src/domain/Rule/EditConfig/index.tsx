// SPDX-License-Identifier: (c) LexTego Ltd
'use client';

import { useCallback, useEffect, useState } from "react";
import usePrivileges from "~/hooks/usePrivileges";
import AccessDeniedPage from "~/components/common/AccessDenied";
import { getRule, getRuleConfig } from "./service";
import { useParams } from "next/navigation";
import { IRuleConfig } from "../RuleConfig/RuleConfigList/types";
import { IRule } from "../RuleDetailPage/service";
import { useAuth } from "~/context/auth";
import { canTransition } from "../../../../machine/guards";
import EditConfigForm from "./EditConfigForm"; // New form component

const EditConfigPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [configuration, setConfiguration] = useState<IRuleConfig | null>(null);
    const [rule, setRule] = useState<IRule | null>(null);
    const { id } = useParams();
    const { privileges } = usePrivileges();
    const { profile } = useAuth();

    const fetchConfig = useCallback(() => {
        setLoading(true);
        setError('');
        getRuleConfig(id as string)
            .then(({ data }) => {
                setConfiguration(data);
                const [, ruleId] = data?.ruleId?.split('/');
                if (ruleId) {
                    getRule(ruleId)
                        .then((res) => {
                            setRule(res.data);
                        }).catch(() => Promise.resolve());
                }
            })
            .catch((e) => {
                setError(e?.response?.data?.message || e?.message || 'Something went wrong');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const canEdit = configuration && canTransition(privileges, 'RULE_CONFIG', configuration.state, 'EDIT');

    if (configuration && !canEdit) {
        return <AccessDeniedPage />;
    }

    return (
        <EditConfigForm
            loading={loading}
            configuration={configuration}
            error={error}
            fetchConfig={fetchConfig}
            rule={rule}
            user={profile}
        />
    );
};

export default EditConfigPage;
