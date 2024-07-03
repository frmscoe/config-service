import React from 'react';
import { render, fireEvent, RenderResult, getByPlaceholderText, getByText, renderHook, screen, waitFor, getAllByText } from '@testing-library/react';
import Parameters from '../Parameters';
import { useForm } from 'react-hook-form';
import '../../../../../../setup';

const { result } = renderHook(() => useForm())

describe('Parameters component', () => {

    const controlMock = result.current.control;
    const parameterFields = {
        append: jest.fn(),
        remove: jest.fn(),
        prepend: jest.fn(),
        fields: [
            { id: 1, ParameterName: 'Test ParameterName 1', ParameterType: 'number', ParameterValue: 'ParameterValue 1' },
            { id: 2, ParameterName: 'Test Reason 2', ParameterType: 'string', ParameterValue: 'ParameterValue 2' }
        ],
        insert: jest.fn(),
    };
    const formStateMock = {
        errors: {
            parameters: {
                0: { ParameterName: { message: 'ParameterName Required' }, ParameterType: { message: 'ParameterType Required' } }
            }
        }
    };
    let component: RenderResult;

    it('renders correctly with given props', () => {

        component = render(
            <Parameters control={result.current.control} parameterFields={parameterFields} formState={formStateMock} />
        );
        expect(component).toBeDefined();
        expect(screen.getAllByTestId('parameter-field').length).toBe(2);
    });

    it('calls remove function when minus button is clicked', () => {
        render(
            <Parameters control={result.current.control} parameterFields={parameterFields} formState={formStateMock} />
        );
        fireEvent.click(screen.getAllByTestId('minus-icon')[0]);
        expect(parameterFields.remove).toHaveBeenCalledWith(0);
    });

    it('removes field when minus icon pressed', () => {
        render(
            <Parameters control={result.current.control} parameterFields={parameterFields} formState={formStateMock} />
        );
        expect(screen.getAllByTestId('parameter-field').length).toBe(2);
        fireEvent.click(screen.getAllByTestId('minus-icon')[0]);
        waitFor(() => {
            expect(parameterFields.remove).toHaveBeenCalledWith(0);
            expect(screen.getAllByTestId('parameter-field').length).toBe(1);
        });

    });

    it('add field when add button pressed', () => {
        render(
            <Parameters control={result.current.control} parameterFields={parameterFields} formState={formStateMock} />
        );
        expect(screen.getAllByTestId('parameter-field').length).toBe(2);
        fireEvent.click(screen.getByTestId('append-button-0'));
        waitFor(() => {
            expect(parameterFields.append).toHaveBeenCalled();
            expect(screen.getAllByTestId('parameter-field').length).toBe(3);
        });

    });

    it('add field when prepend button pressed and should be at top', () => {
        render(
            <Parameters control={result.current.control} parameterFields={parameterFields} formState={formStateMock} />
        );
        expect(screen.getAllByTestId('parameter-field').length).toBe(2);
        fireEvent.click(screen.getByTestId('prepend-button-0'));
        expect(parameterFields.insert).toHaveBeenCalled();


    });

    it('calls append function when add button is clicked', () => {
        render(
            <Parameters control={result.current.control} parameterFields={{...parameterFields, fields: []}} formState={formStateMock} />
        );
        fireEvent.click(screen.getByTestId('add-button'));
        expect(parameterFields.append).toHaveBeenCalled();
    });

    it('displays error messages correctly', () => {
        render(
            <Parameters control={controlMock} parameterFields={parameterFields} formState={formStateMock} />
        );

        // Find error messages
        const nameErrorMessage = screen.getAllByText('ParameterName Required')[0];
        const valueErrorMessage = screen.getAllByText('ParameterType Required')[0];

        // Assert that error messages are displayed
        expect(nameErrorMessage).toBeInTheDocument();
        expect(valueErrorMessage).toBeInTheDocument();
    });

    it('renders error state correctly for input fields', () => {
        render(
            <Parameters control={controlMock} parameterFields={parameterFields} formState={formStateMock} />
        );

        // Find input fields and their associated error messages
        const parameterNameInput = screen.getAllByTestId('parameterName-input')[0];
        const parameterNameMessage = screen.getAllByText('ParameterName Required')[0];

        const valueErrorMessage = screen.getAllByText('ParameterType Required')[0];

        // Assert that input fields have error state
        expect(parameterNameInput).toHaveClass('ant-input ant-input-status-error');
        expect(parameterNameMessage).toBeInTheDocument();

        expect(valueErrorMessage).toBeInTheDocument();
    });
});
