import {DeleteFilled } from "@ant-design/icons"
import { Button, Card } from "antd"
import { FunctionComponent, useCallback } from "react";
import { DEFAULT_EXIT_CONDITIONS } from "~/constants";
import { useCommonTranslations } from "~/hooks";


interface IProps {
    conditions: any[];
    setConditions: any;
}
export const ExitConditions: FunctionComponent<IProps> = ({ conditions, setConditions }) => {
    const { t } = useCommonTranslations();

    const handleDelete = useCallback((refRule: string) => {
        setConditions((prev: any[]) => {
            return [...prev.filter((c: { subRefRule: string; }, i: any) => c.subRefRule !== refRule)]
        });
    }, [])

    const handleRestore = () => {
        setConditions(DEFAULT_EXIT_CONDITIONS);
    }
    return (
        <div >
            <Button type="primary" className="bg-blue-500" onClick={handleRestore}>{t('createRuleConfigPage.exitConditionsForm.restore')}</Button>
            {conditions.map((condition, index) => (
                <div key={index} data-testid="exit-field" className="p-2 rounded-lg my-2">
                    <Card title={`${condition.subRefRule}`} className="w-full" extra={<DeleteFilled className="my-4" data-testid="minus-icon" onClick={() => handleDelete(condition.subRefRule)} style={{ fontSize: '1.2rem', cursor: 'pointer', color: 'red' }} />
                    } >
                        <p>{condition.reason}</p>

                    </Card>
                   
                </div>
            ))}
           
        </div>
    )
}

export default ExitConditions;
