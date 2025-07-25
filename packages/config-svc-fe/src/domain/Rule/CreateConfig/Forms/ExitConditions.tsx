// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Button, Checkbox, Card, Spin, Alert } from "antd";
import { FunctionComponent, useCallback, useState, useEffect } from "react";
import { useCommonTranslations } from "~/hooks";
import { Control, UseFormSetValue, Controller } from 'react-hook-form';

interface IProps {
    control: Control<any>;
    setValue: UseFormSetValue<any>;
    availableExitConditionsForDisplay: any[];
    systemDefaults: any[];
    userPersonalDefaults: any[];
}

export const ExitConditions: FunctionComponent<IProps> = ({
    control,
    setValue,
    availableExitConditionsForDisplay = [],
    systemDefaults = [],
    userPersonalDefaults = [],
}) => {
    const { t } = useCommonTranslations();
    const [searchText, setSearchText] = useState("");

    // LOG: Initial props received by ExitConditions
    console.log("ExitConditions.tsx: --- Component Render Start ---");
    console.log("ExitConditions.tsx: Props received:");
    console.log("  control:", control);
    console.log("  setValue:", setValue);
    console.log("  availableExitConditionsForDisplay:", availableExitConditionsForDisplay);
    console.log("  systemDefaults:", systemDefaults);
    console.log("  userPersonalDefaults:", userPersonalDefaults);



    return (
        <Controller
            name="exitConditions" // This must match the name in useForm's defaultValues and schema
            control={control}
            render={({ field }) => {
                // LOG: Current value of exitConditions from react-hook-form
                // Ensure currentSelectedConditions is always an array to prevent .some() errors
                const currentSelectedConditions = field.value || [];
                console.log("ExitConditions.tsx: Controller field.value (currentSelectedConditions):", currentSelectedConditions);

                // Map selected conditions to their IDs for checkbox 'checked' state
                const selectedConditionIds = currentSelectedConditions.map((cond: any) => cond.id);
                console.log("ExitConditions.tsx: selectedConditionIds for Checkbox 'checked' state:", selectedConditionIds);

                const handleCheckboxChange = useCallback((checkedId: string, isChecked: boolean) => {
                    console.log("ExitConditions.tsx: handleCheckboxChange called. checkedId:", checkedId, "isChecked:", isChecked);
                    console.log("ExitConditions.tsx: currentSelectedConditions BEFORE update (from field.value):", currentSelectedConditions);

                    if (isChecked) {
                        const conditionToAdd = availableExitConditionsForDisplay.find(cond => cond.id === checkedId);
                        console.log("ExitConditions.tsx: conditionToAdd (full object):", conditionToAdd);

                        if (conditionToAdd) {
                            // As requested: Store only id and reason
                            const conditionToStore = { id: conditionToAdd.id, reason: conditionToAdd.reason };
                            const newConditions = [...currentSelectedConditions, conditionToStore]; // No duplicate check
                            setValue('exitConditions', newConditions);
                            console.log("ExitConditions.tsx: Checkbox checked. NEW conditions array (after setValue - id and reason only):", newConditions);
                        } else {
                            console.error("ExitConditions.tsx: conditionToAdd is undefined for checkedId:", checkedId);
                        }
                    } else {
                        // When unchecking, filter by ID and update the form value
                        const updatedConditions = currentSelectedConditions.filter((cond: any) => cond.id !== checkedId);
                        setValue('exitConditions', updatedConditions);
                        console.log("ExitConditions.tsx: Checkbox unchecked. UPDATED conditions array (after setValue):", updatedConditions);
                    }
                    console.log("ExitConditions.tsx: currentSelectedConditions AFTER update (note: this might not reflect immediately due to useCallback closure):", currentSelectedConditions);
                }, [availableExitConditionsForDisplay, currentSelectedConditions, setValue]); // Dependencies for useCallback

                // const handleRestore = useCallback(() => {
                //     // As requested: Map default conditions to only id and reason
                //     const restoredConditions = [
                //         ...systemDefaults.map((cond: any) => ({ id: cond.id, reason: cond.reason })),
                //         ...userPersonalDefaults.map((cond: any) => ({ id: cond.id, reason: cond.reason }))
                //     ];
                //     console.log("ExitConditions.tsx: handleRestore called. Restored conditions to be set (id and reason only):", restoredConditions);
                //     setValue('exitConditions', restoredConditions); // Update the form value
                //     console.log("ExitConditions.tsx: Exit conditions restored (setValue called).");
                // }, [setValue, systemDefaults, userPersonalDefaults]); // Dependencies for useCallback

                const handleRestore = useCallback(() => {
                  const restoredConditions = [
                    ...systemDefaults.map((cond: any) => ({ id: cond.id, reason: cond.reason })),
                    ...userPersonalDefaults.map((cond: any) => ({ id: cond.id, reason: cond.reason })),
                  ];

                  // Remove duplicates by ID
                  const uniqueConditionsMap = new Map();
                  for (const cond of restoredConditions) {
                    uniqueConditionsMap.set(cond.id, cond); // if same ID appears twice, the last one is kept
                  }

                  const uniqueConditions = Array.from(uniqueConditionsMap.values());

                  console.log("ExitConditions.tsx: handleRestore - unique restored conditions:", uniqueConditions);
                  setValue('exitConditions', uniqueConditions);
                }, [setValue, systemDefaults, userPersonalDefaults]);


                const filteredConditions = availableExitConditionsForDisplay.filter((cond) =>
                    cond.reason.toLowerCase().includes(searchText.toLowerCase()) ||
                    cond.id.toLowerCase().includes(searchText.toLowerCase())
                );

                // return (
                //     <div className="space-y-4">
                //         <div className="flex justify-end mb-4">
                //             <Button type="primary" className="bg-blue-500" onClick={handleRestore}>
                //                 {t('createRuleConfigPage.exitConditionsForm.restore')}
                //             </Button>
                //         </div>

                //         <div
                //             className="border border-gray-300 rounded-md p-2 overflow-y-auto"
                //             style={{ height: '200px' }}
                //         >
                //             {availableExitConditionsForDisplay.length === 0 ? (
                //                 <div className="text-center text-gray-500 py-4">
                //                     {t('createRuleConfigPage.exitConditionsForm.noConditionsAvailable') || "No exit conditions available."}
                //                 </div>
                //             ) : (
                //                 availableExitConditionsForDisplay.map((condition) => (
                //                     <div key={condition.id} className="mb-2">
                //                         <Checkbox
                //                             // Check if the condition's ID is in the list of selected IDs
                //                             checked={selectedConditionIds.includes(condition.id)}
                //                             onChange={(e) => handleCheckboxChange(condition.id, e.target.checked)}
                //                         >
                //                             {/*{condition.reason}*/}
                //                             <span className="text-gray-800">
                //                               <strong>{condition.id}</strong>: {condition.reason}
                //                             </span>

                //                         </Checkbox>
                //                     </div>
                //                 ))
                //             )}
                //         </div>
                //     </div>
                // );
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between mb-4">
                      <input
                        type="text"
                        placeholder="Search exit conditions..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="border px-3 py-1 rounded w-full max-w-sm"
                      />
                      <Button type="primary" className="bg-blue-500 ml-2" onClick={handleRestore}>
                        {t('createRuleConfigPage.exitConditionsForm.restore')}
                      </Button>
                    </div>

                    <div className="border border-gray-300 rounded-md p-2 overflow-y-auto" style={{ height: '200px' }}>
                      {filteredConditions.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                          {t('createRuleConfigPage.exitConditionsForm.noConditionsAvailable') || "No exit conditions available."}
                        </div>
                      ) : (
                        filteredConditions.map((condition) => (
                          <div key={condition.id} className="mb-2">
                            <Checkbox
                              checked={selectedConditionIds.includes(condition.id)}
                              onChange={(e) => handleCheckboxChange(condition.id, e.target.checked)}
                            >
                              <span className="text-gray-800">
                                <strong>{condition.id}</strong>: {condition.reason}
                              </span>
                            </Checkbox>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
            }}
        />
    );
};

export default ExitConditions;