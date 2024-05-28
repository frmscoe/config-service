import { render, fireEvent, waitFor } from '@testing-library/react';
import { ConfigForm } from '../index';
import '../../../../../../setup';
import { act } from 'react-dom/test-utils';


const defaultProps = {
    conditions: [],
    setConditions: jest.fn()
}
// Mock the module containing useForm and useParams
jest.mock('react-hook-form', () => ({
    useForm: jest.fn(() => ({
        control: {},
        handleSubmit: jest.fn(),
        formState: { errors: {} },
        watch: jest.fn(() => ({ unsubscribe: jest.fn() })),
        setValue: jest.fn(),
        reset: jest.fn(),
        getValues: jest.fn(),
    })),
    useFieldArray: jest.fn(() => ({
        fields: [],
        append: jest.fn(),
        remove: jest.fn(),
        prepend: jest.fn(),
        insert: jest.fn(),
    })),
}));

jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({ id: 'mockId' })),
}));

describe('ConfigForm', () => {
    test('renders without crashing', () => {
        render(
            <ConfigForm
                {...defaultProps}
                open={true}
                setOpen={() => { }}
                onSubmit={() => { }}
                loading={false}
                setLoading={() => { }}
                success=""
                serverError=""
                activeKeys={[]}
                setActiveKey={() => { }}
            />
        );
    });



    test('clicking exit button calls setOpen with false', async () => {
        const setOpenMock = jest.fn();
        const { getByText } = render(
            <ConfigForm
                {...defaultProps}

                open={true}
                setOpen={setOpenMock}
                onSubmit={() => { }}
                loading={false}
                setLoading={() => { }}
                success=""
                serverError=""
                activeKeys={[]}
                setActiveKey={() => { }}
            />
        );

        act(() => {
            fireEvent.click(getByText('Exit'));

        })
        await waitFor(() => expect(setOpenMock).toHaveBeenCalledWith(false));
    });

    test('clicking save button calls onSubmit', async () => {
        const useFormMock = jest.spyOn(require('react-hook-form'), 'useForm');
        const onSubmitMock = jest.fn();

        // Mock the handleSubmit function
        const handleSubmitMock = jest.fn().mockImplementationOnce(() => onSubmitMock());

        // Provide the mocked useForm hook implementation
        useFormMock.mockReturnValue({
            control: {},
            handleSubmit: handleSubmitMock,
            formState: {
                errors: {},
            },
            watch: jest.fn(() => ({ unsubscribe: jest.fn() })),
            setValue: jest.fn(),
            reset: jest.fn(),
            errors: {},

            getValues: jest.fn(),

        });

        const handleClose = jest.fn();

        const { getByText } = render(
            <ConfigForm
                {...defaultProps}

                open={true}
                setOpen={() => { }}
                onSubmit={onSubmitMock}
                loading={false}
                setLoading={() => { }}
                success=""
                serverError=""
                activeKeys={[]}
                setActiveKey={() => { }}
                handleClose={handleClose}
            />
        );

        act(() => {
            fireEvent.click(getByText('Save'));
        });
        await waitFor(() => {
            expect(handleSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledTimes(1);
        });
    });
});
