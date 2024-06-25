import { Empty, Input} from "antd"
import { ReactNode, useEffect } from "react"
import { useCommonTranslations } from "~/hooks";
import { sortAlphabetically } from "~/utils";

export interface IListProps {
    list: any[];
    options: any[];
    setOptions: (list: any[]) => void;
    handleSearch?: (val: string) => void;
    searchPlaceHolder?: string;
    render: (option: any, index: number) => ReactNode;
    sortKey: string;
}
export const List: React.FunctionComponent<IListProps> = ({
    list,
    options,
    setOptions,
    handleSearch = () => {},
    searchPlaceHolder = 'Search',
    sortKey,
    render,
}) => {
    const { t } = useCommonTranslations();

    useEffect(() => {
        setOptions(list);
    }, [list]);

    return <div className="mx-0 px-0 w-full h-full">
        <Input
            placeholder={searchPlaceHolder}
            className="border-none shadow-none focus:ring-0 my-2"
            onChange={(e) => handleSearch(e?.target?.value || '')}
            data-testid="search-input"
        />
        {!options.length ? <Empty /> : null}

        {
            (sortAlphabetically(options, sortKey)).map((option: any, index) => {
                return render(option, index)
            })
        }
    </div>

}

export default List;