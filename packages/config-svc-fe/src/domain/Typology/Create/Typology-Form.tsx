import { Button, Form, Input, Select, Typography } from "antd"
import { useEffect, useState } from "react";
import { Control, Controller, FormState, UseFormHandleSubmit } from "react-hook-form";
import { AccordionArrows } from "~/components/common/AccordionArrows";
import { useCommonTranslations } from "~/hooks";

export interface Props {
  formState: FormState<any>,
  control: Control<any>,
  handleSubmit: UseFormHandleSubmit<any>,
  onSubmit: (data: any) => void;
}
const TypologyForm: React.FunctionComponent<Props> = ({ formState, control, handleSubmit, onSubmit }) => {
  const [showForm, setShowForm] = useState(false);
  const {t} = useCommonTranslations();

  useEffect(() => {
    if(Object.keys(formState.errors || {}).length && !showForm) {
      setShowForm(true);
    }
  }, [formState.errors, showForm]);

  return <div className="">
    <div className="flex justify-between items-center  px-2 border-t border-gray-300">
      <Typography.Paragraph className="font-bold mt-3">Typology Form</Typography.Paragraph>
      <AccordionArrows open={showForm} setOpen={setShowForm} />
    </div>
    {showForm ? <Form layout="vertical" className="px-2 mb-2" data-testid="typology-form">
      <Form.Item label="Name" 
      className="my-0 py-0"
        validateStatus={(formState?.errors?.name?.message) ? 'error' : ''}
        help={(formState?.errors?.name?.message) as any}
      >
        <Controller
          control={control}
          name='name'
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item
       className="my-0 py-0"
        label="Description"
        validateStatus={(formState?.errors?.description?.message) ? 'error' : ''}
        help={(formState?.errors?.description?.message) as any}
      >
        <Controller
          control={control}
          name='description'
          render={({ field }) => <Input.TextArea {...field} />}
        />
      </Form.Item>
       <Form.Item  className="my-0 py-0" label={t('createRuleConfigPage.informationForm.version')}>
                <div className='flex gap-2'>
                    <Form.Item
                        className="w-1/2 flex-grow"
                        validateStatus={(formState?.errors?.major && formState?.errors?.major?.message || formState?.errors?.patch && formState?.errors?.patch?.message) ? 'error' : ''}
                        help={(formState?.errors?.major && formState?.errors?.major?.message) as any}
                    >
                        <Controller
                            name={'major'}
                            control={control}
                            render={({ field }) => (
                                <Select data-testid="major-select"  {...field} placeholder={'Major'} >
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                                        <Select.Option value={val} key={val}>
                                            {val}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        />

                    </Form.Item>

                    <Form.Item
                        className="w-1/2 flex-grow"
                        validateStatus={(formState?.errors?.patch && formState?.errors?.minor?.message || formState?.errors?.minor && formState?.errors?.minor?.message) ? 'error' : ''}
                        help={(formState?.errors?.minor && formState?.errors?.minor?.message) as any}
                    >
                        <Controller
                            name={'minor'}
                            control={control}
                            render={({ field }) => (
                                <Select data-testid="minor-select"  {...field} placeholder={'Minor'}>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                                        <Select.Option value={val} key={val}>
                                            {val}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        />

                    </Form.Item>

                    <Form.Item
                        className="w-1/2 flex-grow"
                        validateStatus={(formState?.errors?.patch && formState?.errors?.patch?.message || formState?.errors?.patch && formState?.errors?.patch?.message) ? 'error' : ''}
                        help={(formState?.errors?.patch && formState?.errors?.patch?.message) as any}
                    >
                        <Controller
                            name={'patch'}
                            control={control}
                            render={({ field }) => (
                                <Select data-testid="patch-select"  {...field} placeholder={'Patch'}>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                                        <Select.Option value={val} key={val}>
                                            {val}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        />

                    </Form.Item>
                </div>

        </Form.Item>
    </Form> : null}
  </div>
}
export default TypologyForm;