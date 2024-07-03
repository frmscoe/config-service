import { Collapse, CollapseProps, Empty, Input, Typography } from "antd"
import { useEffect } from "react"
import { sortAlphabetically } from "~/utils";
import { GroupedTypology } from "./service";
import { ITypology } from "~/domain/Typology/List/service";
import { useCommonTranslations } from "~/hooks";

function sortByCfgDesc(data: ITypology[]) {
    function parseCfg(cfg: string) {
        return cfg.split('.').map(Number);
    }
    data.sort((a, b) => {
        const aParsed = parseCfg(a.cfg);
        const bParsed = parseCfg(b.cfg);

        // Compare each part of the version number
        for (let i = 0; i < aParsed.length; i++) {
            if (aParsed[i] > bParsed[i]) {
                return -1; // a comes before b
            } else if (aParsed[i] < bParsed[i]) {
                return 1; 
            }
        }

        return 0; 
    });

    return data;
}


export interface UnassignedTypologiesProps {
    typologies: GroupedTypology[];
    typologyOptions: GroupedTypology[];
    setTypologyOptions: (rules: GroupedTypology[]) => void;
    selectedTypology: null | string;
    setSelectedTypology: (index: string | null) => void;

}
export const UnAssignedTypologies: React.FunctionComponent<UnassignedTypologiesProps> = ({
    typologies,
    typologyOptions,
    setTypologyOptions,
    selectedTypology,
    setSelectedTypology,
}) => {
    const {t: tn} = useCommonTranslations();

    useEffect(() => {
        setTypologyOptions(typologies);
    }, [typologies]);

    const handleSearch = (val: any) => {
        if (val.trim().length) {
            setTypologyOptions(typologies.filter((rule) => rule.name.toLowerCase().includes(val.toLowerCase())))
        }
        if (!val.trim().length) {
            setTypologyOptions(typologies);
        }
        setSelectedTypology(null);

    }

    return <div>
        <div className="unassigned-typologies">
            <div className="flex justify-between items-center px-2 border-t border-b border-gray-300 my-0">
                <Typography.Paragraph className="font-bold mt-3">{tn('createEditNetworkMap.unassignedTypologies')}</Typography.Paragraph>
            </div>
            <Input
                className="border-none shadow-none focus:ring-0 text-gray-500 mb-3"
                placeholder={tn('createEditNetworkMap.searchTypologies')}
                onChange={(e) => handleSearch(e?.target?.value)}
                data-testid="removed-items-input"
            />
            {
                !typologyOptions.length ? <Empty className="mb-2" /> : null
            }
            <div style={{ overflowY: 'scroll', height: '70vh' }}>
                {
                    (sortAlphabetically(typologyOptions, 'name')).map((t: GroupedTypology, index) => {
                       
                        const items: CollapseProps['items'] = [
                            {
                                key: '1',
                                label: t.name.slice(0, 25),
                                children: <div>

                                    {
                                        sortByCfgDesc(t.versions).map((t) => <Typography key={t._key} className="text-gray">
                                            {tn('createEditNetworkMap.version')} {t.cfg}
                                        </Typography>)
                                    }
                                </div>
                            },

                        ];
                        return <div
                            draggable
                            key={t._key}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow', 'node');
                                e.dataTransfer.setData('type', 'typology');
                                e.dataTransfer.setData('index', (selectedTypology)?.toString() as string);
                                e.dataTransfer.setData('data', JSON.stringify(t));
                                e.dataTransfer.effectAllowed = 'move';
                                setSelectedTypology(t._key as string);
                            }}
                            onClick={() => setSelectedTypology(t._key as string)}
                            data-testid={`typology-drag-item-${index}`}
                            className="flex cursor-move justify-between items-center px-1 mx-1 mb-2">
                            <Collapse
                                items={items}
                                defaultActiveKey={['1']}
                                expandIconPosition={"end"}
                                style={{ width: '14rem' }}
                            />
                        </div>
                    })
                }
            </div>



        </div>

    </div>
}