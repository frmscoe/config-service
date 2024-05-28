import React from 'react';
import { render, fireEvent, screen, renderHook, waitFor } from '@testing-library/react';
import Information from '../Information';
import { useForm } from 'react-hook-form';
import '../../../../../../setup';

const { result } = renderHook(() => useForm());

const Props = {
    formState: {
        errors: {
            information: {
                0: { dataType: { message: 'Reason Required' }, minor: { message: 'Value Required' } }
            }
        },
    },
    handleSubmit: jest.fn(),
    onSubmit: jest.fn(),
    setValue: jest.fn(),
    control: result.current.control,
}
describe('Information component', () => {
    it('renders form with correct elements', () => {
        render(<Information {...Props} />);

        // Check if form elements are rendered
        expect(screen.getByTestId(/data-type/i)).toBeInTheDocument();
        expect(screen.getByTestId(/description/i)).toBeInTheDocument();
        expect(screen.getByTestId(/minor/i)).toBeInTheDocument();
        expect(screen.getByTestId(/patch/i)).toBeInTheDocument();
    });

    test('displays error messages', () => {
        // Simulate form validation errors
        const formState = {
            errors: {
                dataType: { message: 'Data type is required' },
                description: { message: 'Description is required' },
                minor: { message: 'Minor version is required' },
                patch: { message: 'Patch version is required' },
                category: { message: 'At least one category must be selected' },
            }
        };

        render(<Information
            formState={formState}
            handleSubmit={jest.fn()}
            onSubmit={jest.fn()}
            control={result.current.control}
            setValue={jest.fn()}
        />);

        // Check if error messages are displayed
        expect(screen.getByText(/data type is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/minor version is required/i)).toBeInTheDocument();
        expect(screen.getByText(/patch version is required/i)).toBeInTheDocument();
        expect(screen.getByText(/at least one category must be selected/i)).toBeInTheDocument();
    });
    it('toggles checkboxes and sets category values', () => {
        render(<Information {...Props} />);

        const casesCheckbox: any = screen.getByLabelText(/cases/i)
        const bandsCheckbox: any = screen.getByLabelText(/bands/i);

        // Toggle cases checkbox
        fireEvent.click(casesCheckbox);
        expect(casesCheckbox.checked).toBe(true);
        expect(bandsCheckbox.checked).toBe(false);

        // Toggle bands checkbox
        waitFor(() => {
            fireEvent.click(bandsCheckbox);
            expect(bandsCheckbox.checked).toBe(true);
            expect(casesCheckbox.checked).toBe(false);
        });
    });

});

