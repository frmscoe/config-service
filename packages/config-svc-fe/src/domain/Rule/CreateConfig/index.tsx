// // CreateConfig/index.tsx (main page component)

// import React, { useEffect, useState } from "react"
// import CreateConfig from "./Create"
// import usePrivileges from "~/hooks/usePrivileges"
// import AccessDeniedPage from "~/components/common/AccessDenied";
// import { useParams, useSearchParams } from "next/navigation";
// import { postRuleConfig } from "./service";
// import { DEFAULT_EXIT_CONDITIONS } from "~/constants"; // Assuming DEFAULT_EXIT_CONDITIONS is an array of the full objects

// const covertValue = (value: any, type: string) => {
//     if(type === 'CALENDER_DATE_TIME') {
//         return new Date(value).toISOString();
//     }
//     return value;
// }

// const CreateRuleConfigPage = () => {
//     const {canCreateRuleConfig} = usePrivileges();
//     const [conditions, setConditions] = useState(DEFAULT_EXIT_CONDITIONS);
//     const [loading, setLoading] = useState(false);
//     const [version, setVersion] = useState(1);
//     const {id} = useParams();
//     const params = useSearchParams();
//     const [success, setSuccess] = useState('');
//     const [serverError, setServerError] = useState('');
//     const [activeKeys, setActiveKey] = useState(['1']);

//     useEffect(() => {
//         const lastVersion = params.get('lastVersion');
//         if(lastVersion === '0') {
//             setVersion(1);
//         }else {
//             const previous = params.get('lastVersion')?.split('.')[0];
//             if(!isNaN(Number(previous))) {
//                 setVersion(Number(previous) + 1);
//             } else {
//                 setVersion(1);
//             }
//         }
//     }, [params]);

//     const handleClose = () => {
//         // Implement your close logic here, e.g., redirect or clear form
//         setSuccess('');
//         setServerError('');
//         setLoading(false);
//         setConditions(DEFAULT_EXIT_CONDITIONS); // Reset conditions
//         setActiveKey(['1']); // Reset active panel
//     }

//     // const onSubmit = async (data: any) => {
//     //     setLoading(true);
//     //     setServerError('');
//     //     setSuccess('');

//     //     try {
//     //         // *** IMPORTANT: Transform exitConditions before sending ***
//     //         const transformedExitConditions = (data.exitConditions || []).map((condition: any) => ({
//     //             subRuleRef: condition.id, // Map 'id' from frontend object to 'subRuleRef' for API
//     //             reason: condition.reason, // 'reason' remains 'reason'
//     //         }));

//     //         const obj = {
//     //             cfg: `${version}.0.0`, // Assuming 'cfg' format from your example
//     //             desc: data.description, // Assuming 'description' comes from data
//     //             ruleId: id, // Rule ID from useParams
//     //             config: {
//     //                 parameters: data.parameters || [],
//     //                 exitConditions: transformedExitConditions, // Use the transformed array
//     //                 bands: data.bands ? data.bands.map((band: any, index: number) => ({
//     //                     subRuleRef: `0.${index + 1}`,
//     //                     upperLimit: band.upperLimit,
//     //                     lowerLimit: band.lowerLimit,
//     //                     reason: band.reason,
//     //                 })) : [],
//     //                 cases: data.cases ? data.cases.map((cs: any, index: number) => {
//     //                     if(data.dataType === 'CALENDER_DATE_TIME') {
//     //                         return {
//     //                             subRuleRef: `0.${index + 1}`,
//     //                             reason: cs.reason,
//     //                             value: cs.value ?  new Date(cs.value).toISOString() : cs.value,
//     //                         }
//     //                     }
//     //                     return {
//     //                         subRuleRef: `0.${index + 1}`,
//     //                         reason: cs.reason,
//     //                         value: cs.value,
//     //                     }
//     //                 }) : [],
//     //                 parameters: data.parameters || [], // Redundant, already set above. Can be removed if parameters are always empty/not needed.
//     //             }
//     //         }
//     //         await postRuleConfig(obj);
//     //         setLoading(false);
//     //         setSuccess('Rule Config created');
//     //     } catch (error: any) {
//     //         setLoading(false);
//     //         setServerError(error?.response?.data?.message || error?.message || 'Something went wrong')
//     //     } finally {
//     //         setActiveKey([]);
//     //     }
//     // }
    
//     const onSubmit = async (data: any) => {
//         setLoading(true);
//         setServerError('');
//         setSuccess('');

//         try {
//             // --- START HARDCODED EXIT CONDITIONS ---
//             // Hardcode the exitConditions here for testing purposes.
//             // This will bypass whatever values are coming from the form.
//             data.exitConditions = [
//                 { id: 'HARDCODED_CONDITION_1', reason: 'Test Reason from Hardcode 1' },
//                 { id: 'HARDCODED_CONDITION_2', reason: 'Test Reason from Hardcode 2' }
//             ];
//             // --- END HARDCODED EXIT CONDITIONS ---

//             // *** IMPORTANT: Transform exitConditions before sending ***
//             const transformedExitConditions = (data.exitConditions || []).map((condition: any) => ({
//                 subRuleRef: condition.id, // Map 'id' from frontend object to 'subRuleRef' for API
//                 reason: condition.reason, // 'reason' remains 'reason'
//             }));

//             const obj = {
//                 cfg: `${version}.0.0`, // Assuming 'cfg' format from your example
//                 desc: data.description, // Assuming 'description' comes from data
//                 ruleId: id, // Rule ID from useParams
//                 config: {
//                     parameters: data.parameters || [],
//                     exitConditions: transformedExitConditions, // Use the transformed array
//                     bands: data.bands ? data.bands.map((band: any, index: number) => ({
//                         subRuleRef: `0.${index + 1}`,
//                         upperLimit: band.upperLimit,
//                         lowerLimit: band.lowerLimit,
//                         reason: band.reason,
//                     })) : [],
//                     cases: data.cases ? data.cases.map((cs: any, index: number) => {
//                         if(data.dataType === 'CALENDER_DATE_TIME') {
//                             return {
//                                 subRuleRef: `0.${index + 1}`,
//                                 reason: cs.reason,
//                                 value: cs.value ? new Date(cs.value).toISOString() : cs.value,
//                             }
//                         }
//                         return {
//                             subRuleRef: `0.${index + 1}`,
//                             reason: cs.reason,
//                             value: cs.value,
//                         }
//                     }) : [],
//                     parameters: data.parameters || [], // Redundant, already set above. Can be removed if parameters are always empty/not needed.
//                 }
//             }
//             await postRuleConfig(obj);
//             setLoading(false);
//             setSuccess('Rule Config created');
//         } catch (error: any) {
//             setLoading(false);
//             setServerError(error?.response?.data?.message || error?.message || 'Something went wrong')
//         } finally {
//             setActiveKey([]);
//         }
//     }

//     if(!canCreateRuleConfig) {
//         return <AccessDeniedPage/>;
//     }
//     return <CreateConfig
//             loading={loading}
//             setLoading={setLoading}
//             success={success}
//             activeKeys={activeKeys}
//             setActiveKey={setActiveKey}
//             serverError={serverError}
//             onSubmit={onSubmit}
//             conditions={conditions}
//             setConditions={setConditions}
//             handleClose={handleClose}
//         />
// }

// export default CreateRuleConfigPage;