// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { useEffect } from "react"
import List from "~/components/common/List";
import { FileDoneOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { getOutcomeLabelFromType } from "./helpers"; 


export interface IRemovedProps {
    removed: any[];
    removeOptions: any[];
    setRemovedOptions: (others: any[]) => void;
    selectedRemoved: null | string;
    setSelectedRemoved: (index: string | null) => void;

}
export const Removed: React.FunctionComponent<IRemovedProps> = ({
    removed,
    removeOptions,
    setRemovedOptions,
    setSelectedRemoved,
}) => {

    // useEffect(() => {
    //     setRemovedOptions(removed);
    // }, [removed]);

    // const handleSearch = (val: any) => {
    //     if (val.trim().length) {
    //         setRemovedOptions(removed.filter((rule) => rule.name.toLowerCase().includes(val.toLowerCase())))
    //     }
    //     if (!val.trim().length) {
    //         setRemovedOptions(removed);
    //     }
    //     setSelectedRemoved(null);
    // }

    // const handleSearch = (val: any) => {
    //     if (val.trim().length) {
    //         setRemovedOptions(
    //             removed.filter(
    //                 (rule) => rule.name?.toLowerCase().includes(val.toLowerCase())
    //             )
    //         );
    //     } else {
    //         setRemovedOptions(removed);
    //     }
    //     setSelectedRemoved(null);
    // }

    // const handleSearch = (val: any) => {
    //     const lowerVal = val.trim().toLowerCase();

    //     if (lowerVal.length === 0) {
    //         setRemovedOptions(removed);
    //     } else {
    //         const filtered = removed.filter((rule) => {
    //             return (
    //                 rule?.name?.toLowerCase().includes(lowerVal) ||
    //                 rule?.type?.toLowerCase().includes(lowerVal) ||
    //                 rule?.subRuleRef?.toLowerCase().includes(lowerVal)
    //             );
    //         });

    //         setRemovedOptions(filtered.length ? filtered : removed); // fallback to all if no match
    //     }

    //     setSelectedRemoved(null);
    // };

    // Removed.tsx

    useEffect(() => {
      // Build a stable display-based key: what the user actually sees.
      const norm = (s?: string) => (s || "").trim().toLowerCase();
      const keyOf = (o: any) => `${norm(o.customNode)}::${norm(o.subRuleRef)}`;

      // De-dupe the incoming list before showing it
      const unique = Array.from(
        new Map((removed || []).map((r: any) => [keyOf(r), r])).values()
      );
      setRemovedOptions(unique);
    }, [removed]);

    const handleSearch = (val: any) => {
      const q = (val || "").trim().toLowerCase();

      const norm = (s?: string) => (s || "").trim().toLowerCase();
      const keyOf = (o: any) => `${norm(o.customNode)}::${norm(o.subRuleRef)}`;

      const baseUnique = Array.from(
        new Map((removed || []).map((r: any) => [keyOf(r), r])).values()
      );

      const filtered = q
        ? baseUnique.filter(
            (rule) =>
              norm(rule?.name).includes(q) ||
              norm(rule?.type).includes(q) ||
              norm(rule?.subRuleRef).includes(q) ||
              norm(rule?.customNode).includes(q)
          )
        : baseUnique;

      setRemovedOptions(filtered);
      setSelectedRemoved(null);
    };




    return <List
            handleSearch={handleSearch}
            options={removeOptions}
            list={removed}
            setOptions={setRemovedOptions}
            sortKey="subRuleRef"
            render={(outcome, index) =><div
                key={index}
                data-testid="outcome-removed-item"
                style={{ border: '2px solid #4CAE47' }}
                className="flex cursor-move justify-between items-center px-2 border mx-1 p-2 mb-2">
                <FileDoneOutlined className="w-1/4" style={{ fontSize: '1rem', cursor: 'pointer' }} />
                {/*<Typography className="w-3/4 text-gray-500">
                   {outcome.type}: {outcome.subRuleRef}
                </Typography>*/}
                <Typography className="w-3/4 text-gray-500">
                  {outcome.customNode}:{outcome.subRuleRef} 
                </Typography>
            </div>}
    />

}