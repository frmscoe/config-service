import React from 'react';
import { Button, Result } from 'antd';
import Link from 'next/link';
import { useCommonTranslations } from '~/hooks';

const AccessDeniedPage = () => {
    const {t} = useCommonTranslations();
    return (
        <Result
            status="403"
            title="403"
            subTitle={t('accessPage.message')}
            extra={<Button type="default" ><Link href={'/'}>{t('accessPage.back')}</Link></Button>}
        />
    );
};

export default AccessDeniedPage;
