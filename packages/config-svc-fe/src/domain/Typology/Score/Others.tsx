import { FileDoneOutlined } from "@ant-design/icons"
import { Empty, Input, Typography } from "antd"
import { useEffect } from "react"
import { useCommonTranslations } from "~/hooks";
import { sortAlphabetically } from "~/utils";

export interface IOtherProps {
    others: any[];
    otherOptions: any[];
    setOtherOptions: (others: any[]) => void;
    selectedOther: null | string;
    setSelectedOther: (index: string | null) => void;

}
export const Others: React.FunctionComponent<IOtherProps> = ({
    others,
    otherOptions,
    setOtherOptions,
    setSelectedOther,
}) => {
    const { t } = useCommonTranslations();

    useEffect(() => {
        setOtherOptions(others);
    }, [others]);


    const handleSearch = (val: any) => {
        if (val.trim().length) {
            setOtherOptions(others.filter((rule) => rule.name.toLowerCase().includes(val.toLowerCase())))
        }
        if (!val.trim().length) {
            setOtherOptions(others);
        }
        setSelectedOther(null);
    }


    return <div className="mx-0 px-0 w-full h-full">
        <Input
            placeholder={t('typologyCreatePage.searchRules')}
            className="border-none shadow-none focus:ring-0 my-2"
            onChange={(e) => handleSearch(e?.target?.value || '')}
            data-testid="search-rules-input"
        />
        {!otherOptions.length ? <Empty /> : null}

        {
            (sortAlphabetically(otherOptions, 'name')).map((r: any, index) => {
                return <div
                    key={index}
                    onClick={() => setSelectedOther(r._key)}
                    data-testid="rule-drag-item"
                    style={{ border: '2px solid #4CAE47' }}
                    className="flex cursor-move justify-between items-center px-2 border mx-1 p-2 mb-2">
                    <FileDoneOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />
                    <Typography className="w-3/4 text-gray-500">
                        {r.name}
                    </Typography>
                </div>
            })
        }
    </div>

}