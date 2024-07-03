import { RenderResult, render, waitFor, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import '../../../../../setup';
import EditRule, { Props } from '../Edit';
import { IRule } from '../../RuleDetailPage/service';

const defaultProps: Props = {
    setOpen: jest.fn(),
    open: true,
    onSubmit: jest.fn(),
    error: '',
    success: '',
    loading: false,
    setSelectedRule: jest.fn(),
    rule: {
        name: 'rule-001',
        cfg: '1.9.0',
        _key: '1235',
        _id: 'rule/1235',
        _rev: 'rev',
        state: '01_DRAFT',
        ownerId: 'test@gmail.com',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        dataType: 'NUMERIC',
        desc: 'random',
        ruleConfigs: [],
    },
}


describe('EditRule', () => {
    let component: RenderResult
    it('should render page', () => {
        waitFor(() => {
            component = render(<EditRule
                {...defaultProps}
            />)
        })
        expect(component).toBeDefined();
    });

    it('should render error', async () => {
        waitFor(() => {
            component = render(<EditRule
                {...defaultProps}
                error='Something went wrong'
            />)
        })

        await waitFor(() => component.findAllByText('Error'));
        expect((await component.findAllByText('Error')).length).toBe(1);
    });

    it('should render success', async () => {
        waitFor(() => {
            component = render(<EditRule
                {...defaultProps}
                success='Creation successful'
                error=''
            />)
        })

        await waitFor(() => component.findAllByText('Success'));
        expect((await component.findAllByText('Success')).length).toBe(1);
    });
})

describe('EditRule Form', () => {
    // Test case: Verify that the form renders correctly
    it('renders form correctly', () => {
        render(<EditRule {...defaultProps} />);
        // Check if the form fields are rendered
        expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
        expect(screen.getByText(/submit/i)).toBeInTheDocument();
    });

    // Test case: Verify that form submission works correctly
    it('submits form with valid data', async () => {

        render(<EditRule {...defaultProps} rule={{ ...defaultProps.rule, state: '10_PENDING_REVIEW' } as IRule} />);

        act(() => {
            fireEvent.mouseDown(screen.getByRole('combobox'));
        });

        act(() => {
            fireEvent.click(screen.getByText('MAJOR'));
        });
        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        });

    });

    // Test case: Verify form validation for required fields
    it('validates required fields', async () => {
        render(<EditRule {...defaultProps} rule={{ ...defaultProps.rule, state: '10_PENDING_REVIEW' } as IRule} />);

        // Submit the form without filling any fields
        fireEvent.click(screen.getByText(/submit/i));

        // Check for validation errors
        await waitFor(() => {
            expect(screen.getByText(/required/i)).toBeInTheDocument();
        });
    });

    // Test case: Verify error alert displays correctly
    it('displays error alert', async () => {
        const propsWithError = {
            ...defaultProps,
            error: 'Test error message',
        };

        render(<EditRule {...propsWithError} />);

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

        render(<EditRule {...propsWithSuccess} />);

        // Check if success alert is displayed
        await waitFor(() => {
            expect(screen.getByText(/test success message/i)).toBeInTheDocument();
        });
    });
})