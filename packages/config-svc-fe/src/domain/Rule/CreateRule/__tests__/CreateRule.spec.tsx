import { RenderResult, render, waitFor, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '../../../../../setup';
import CreateRule, { Props } from '../CreateRule';

const defaultProps: Props = {
    setOpen: jest.fn(),
    open: true,
    onSubmit: jest.fn(),
    error: '',
    success: '',
    loading: false
}

describe('CreateRulePage', () => {
    let component: RenderResult
    it('should render page', () => {
        waitFor(() => {
            component = render(<CreateRule
                {...defaultProps}
            />)
        })
        expect(component).toBeDefined();
    });

    it('should render error', async () => {
        waitFor(() => {
            component = render(<CreateRule
                {...defaultProps}
                error='Something went wrong'
            />)
        })

        await waitFor(() => component.findAllByText('Error'));
        expect((await component.findAllByText('Error')).length).toBe(1);
    });

    it('should render success', async () => {
        waitFor(() => {
            component = render(<CreateRule
                {...defaultProps}
                success='Creation successful'
                error=''
            />)
        })

        await waitFor(() => component.findAllByText('Success'));
        expect((await component.findAllByText('Success')).length).toBe(1);
    });
})

describe('CreateRule Form', () => {
    // Test case: Verify that the form renders correctly
    it('renders form correctly', () => {
        render(<CreateRule {...defaultProps} />);
        // Check if the form fields are rendered
        expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText(/submit/i)).toBeInTheDocument();
    });

    // Test case: Verify that form submission works correctly
    it('submits form with valid data', async () => {
        render(<CreateRule {...defaultProps} />);

        // Fill in the form fields
        await waitFor(() => {
            fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'Test Rule' } });
            fireEvent.change(screen.getByPlaceholderText(/description/i), { target: { value: 'Test Description' } });
        });
        fireEvent.mouseDown(screen.getByRole("combobox"));
        fireEvent.click(screen.getAllByText(/currency/i)[1]);
        fireEvent.click(screen.getByText(/submit/i));  

        // Wait for the form submission to be called
        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        });
    });

    // Test case: Verify form validation for required fields
    it('validates required fields', async () => {
        render(<CreateRule {...defaultProps} />);

        // Submit the form without filling any fields
        fireEvent.click(screen.getByText(/submit/i));

        // Check for validation errors
        await waitFor(() => {
            expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Data type required/i)).toBeInTheDocument();
        });
    });

    // Test case: Verify error alert displays correctly
    it('displays error alert', async () => {
        const propsWithError = {
            ...defaultProps,
            error: 'Test error message',
        };

        render(<CreateRule {...propsWithError} />);

        // Check if error alert is displayed
        await waitFor(() => {
            expect(screen.getByText(/test error message/i)).toBeInTheDocument();
        });
    });

    // Test case: Verify success alert displays correctly
    it('displays success alert', async () => {
        const propsWithSuccess = {
            ...defaultProps,
            success: 'Test success message',
        };

        render(<CreateRule {...propsWithSuccess} />);

        // Check if success alert is displayed
        await waitFor(() => {
            expect(screen.getByText(/test success message/i)).toBeInTheDocument();
        });
    });
})