// <!-- SPDX-License-Identifier: Apache-2.0 -->
import React, { useEffect, useState } from 'react';
import EditRule, { FormData } from './Edit';
import { updateRule } from './service';
import { useCommonTranslations } from '~/hooks';
import { IRule, getRules } from '../RuleDetailPage/service';
import { createRule } from '../CreateRule/service';
import { incrementVersion } from '~/utils';
import { Modal, Button } from 'antd'; // Import Modal and Button from antd

interface Props {
    open: boolean;
    setOpen(val: boolean): void;
    afterEdit(): void;
    rule: IRule | null;
    setSelectedRule(rule: IRule | null): void;
}

const EditRulePage: React.FunctionComponent<Props> = (props) => {
    const { t } = useCommonTranslations();
    const [error, setError] = useState('');
    const [modalSuccessMessage, setModalSuccessMessage] = useState(''); // State for success message specifically for the modal
    const [loading, setLoading] = useState(false);
    const [rules, setRules] = useState<IRule[]>([]);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false); // State for success modal visibility

    const handleSubmit = async (data: FormData) => {
        try {
            setError('');
            setModalSuccessMessage(''); // Clear previous success message
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
                setModalSuccessMessage('Rule has been created successfully'); // Set message for modal
            } else {
                await updateRule(
                    {
                        cfg: `${data.major}.${data.minor}.${data.patch}`,
                        desc: data.description,
                        state: '01_DRAFT', // Assuming state remains DRAFT after edit
                        name: data.name,
                        dataType: 'NUMERIC',
                    },
                    props.rule?._key as string
                );
                setModalSuccessMessage('Rule has been updated successfully'); // Set message for modal
            }

            props.setOpen(false); // Close the edit drawer
            setIsSuccessModalVisible(true); // Show the success modal

        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || t('generalError'));
        } finally {
            setLoading(false);
        }
    }

    // Handler to close the success modal and trigger refresh
    const handleSuccessModalClose = () => {
        setIsSuccessModalVisible(false); // Hide the success modal
        setModalSuccessMessage(''); // Clear message after modal close
        props.afterEdit && props.afterEdit(); // Trigger the list refresh
    };

    useEffect(() => {
        // This useEffect seems to fetch all rules on mount, which might be a performance concern if you have many rules.
        // It's not directly related to the edit flow but worth noting.
        getRules({ page: 1, limit: 99999 })
            .then(({ data }) => {
                setRules(data.rules);
            }).catch((e) => {
                setError(e.response?.data?.message || e?.message || 'Something went wrong')
            });
    }, []);

    return (
        <>
            <EditRule
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                // success={modalSuccessMessage !== '' ? 'successTrigger' : ''} // This line is now REMOVED
                // We no longer pass `success` to EditRule as it no longer displays it.
                {...props}
            />

            {/* New Success Modal */}
            <Modal
                title={t('createRulePage.success') || 'Success!'} // Reusing translation key
                open={isSuccessModalVisible}
                onOk={handleSuccessModalClose}
                onCancel={handleSuccessModalClose}
                footer={[
                    <Button
                        key="ok"
                        type="primary"
                        onClick={handleSuccessModalClose}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        {t('createRulePage.ok') || 'OK'}
                    </Button>,
                ]}
            >
                <p>{modalSuccessMessage}</p> {/* Display the success message */}
            </Modal>
        </>
    )
}

export default EditRulePage;