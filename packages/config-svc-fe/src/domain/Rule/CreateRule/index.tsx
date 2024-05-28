import React, { useState } from 'react';
import CreateRule, { FormData } from './CreateRule';
import { createRule } from './service';
import { useCommonTranslations } from '~/hooks';

interface Props {
    open: boolean;
    setOpen(val: boolean): void;
    afterCreate(): void
}
const CreateRulePage: React.FunctionComponent<Props> = (props) => {
    const {t} = useCommonTranslations();
    const[error, setError] = useState('');
    const[success, setSuccess] = useState('');
    const[loading, setLoading] = useState(false);

    const handleSubmit = async(data: FormData) => {
        try {
            setSuccess('');
            setError('');
            setLoading(true);
            await createRule({
                cfg:  '1.0.0',
                desc: data.description,
                state: '01_DRAFT',
                dataType: data.dataType,
                name: data.name,
            });
            setSuccess(t('successCreate'));
            props.afterCreate && props.afterCreate();
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t('generalError'));
        } finally {
            setLoading(false);
        }

    }
    return <CreateRule
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success={success}
        {...props}
    />
}

export default CreateRulePage;