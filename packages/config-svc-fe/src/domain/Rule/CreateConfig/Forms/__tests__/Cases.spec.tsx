import React from 'react';
import { render, fireEvent, RenderResult, renderHook, screen, waitFor } from '@testing-library/react';
import Cases, { ValueField } from '../Cases';
import { useForm } from 'react-hook-form';
import '../../../../../../setup';


const { result } = renderHook(() => useForm())

describe('cases component', () => {
    const getValue = jest.fn()
    const controlMock = result.current.control;
    const casesFieldsMock = {
        append: jest.fn(),
        remove: jest.fn(),
        fields: [
            { id: 1, reason: 'Test Reason 1', value: 'Value 1' },
            { id: 2, reason: 'Test Reason 2', value: 'Value 2' }
        ],
        move: jest.fn(),
        prepend: jest.fn(),
        insert: jest.fn(),

    };
    const formStateMock = {
        errors: {
            cases: {
                0: { reason: { message: 'Reason Required' }, value: { message: 'Value Required' } }
            }
        }
    };
    let component: RenderResult;

    it('renders correctly with given props', () => {

        component = render(
            <Cases control={result.current.control} getValue={getValue} caseFields={casesFieldsMock} formState={formStateMock} />
        );
        expect(component).toBeDefined();
        expect(screen.getAllByTestId('case-field').length).toBe(2);
    });

    it('calls remove function when minus button is clicked', () => {
        render(
            <Cases control={result.current.control} getValue={getValue} caseFields={casesFieldsMock} formState={formStateMock} />
        );
        fireEvent.click(screen.getAllByTestId('minus-icon')[0]);
        expect(casesFieldsMock.remove).toHaveBeenCalledWith(0);
    });

    it('removes field when minus icon pressed', () => {
        render(
            <Cases getValue={getValue} control={result.current.control} caseFields={casesFieldsMock} formState={formStateMock} />
        );
        expect(screen.getAllByTestId('case-field').length).toBe(2);
        fireEvent.click(screen.getAllByTestId('minus-icon')[0]);
        waitFor(() => {
            expect(casesFieldsMock.remove).toHaveBeenCalledWith(0);
            expect(screen.getAllByTestId('case-field').length).toBe(1);
        });

    });

    it('call prepend function when item clicked on is at index 0 ', () => {
        render(
            <Cases getValue={getValue} control={result.current.control} caseFields={{...casesFieldsMock}} formState={formStateMock} />
        );
        fireEvent.click(screen.getAllByTestId('prepend-button')[0]);
        expect(casesFieldsMock.prepend).toHaveBeenCalled();
    });

    it('call insert function when item clicked on is at index greater than 0 ', () => {
        render(
            <Cases getValue={getValue} control={result.current.control} caseFields={{...casesFieldsMock}} formState={formStateMock} />
        );
        fireEvent.click(screen.getAllByTestId('prepend-button')[1]);
        expect(casesFieldsMock.insert).toHaveBeenCalled();
    });

    it('call append function is items are 0 ', () => {
        render(
            <Cases getValue={getValue} control={result.current.control} caseFields={{...casesFieldsMock, fields: []}} formState={formStateMock} />
        );
        expect(screen.getByTestId('add-new-button')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('add-new-button'));
        expect(casesFieldsMock.append).toHaveBeenCalled();
    });

    it('calls show hide add new button when there are more than 1 item', () => {
        render(
            <Cases control={result.current.control} getValue={getValue} caseFields={casesFieldsMock} formState={formStateMock} />
        );
        expect(screen.queryAllByTestId('add-new-button').length).toBe(0);
    });

    it('calls insert function when more than one item', () => {
        render(
            <Cases control={result.current.control} getValue={getValue} caseFields={casesFieldsMock} formState={formStateMock} />
        );
        fireEvent.click(screen.getAllByTestId('append-button')[0]);
        expect(casesFieldsMock.insert).toHaveBeenCalled();
    });

    it('displays error messages correctly', () => {
        render(
            <Cases getValue={getValue} control={controlMock} caseFields={casesFieldsMock} formState={formStateMock} />
        );

        // Find error messages
        const reasonErrorMessage = screen.getAllByText('Reason Required')[0];
        const valueErrorMessage = screen.getAllByText('Reason Required')[0];

        // Assert that error messages are displayed
        expect(reasonErrorMessage).toBeInTheDocument();
        expect(valueErrorMessage).toBeInTheDocument();
    });

    it('renders error state correctly for input fields', () => {
        render(
            <Cases getValue={getValue} control={controlMock} caseFields={casesFieldsMock} formState={formStateMock} />
        );

        // Find input fields and their associated error messages
        const reasonInput = screen.getAllByTestId('reason-input')[0];
        const reasonErrorMessage = screen.getAllByText('Reason Required')[0];

        const valueInput = screen.getAllByTestId('value-input')[0];
        const valueErrorMessage = screen.getAllByText('Value Required')[0];

        // Assert that input fields have error state
        expect(reasonInput).toHaveClass('ant-input ant-input-status-error');
        expect(reasonErrorMessage).toBeInTheDocument();

        expect(valueInput).toHaveClass('ant-input ant-input-status-error');
        expect(valueErrorMessage).toBeInTheDocument();
    });

    it('should allow dragging and dropping of fields', () => {
        // Mock caseFields
        const caseFields = {
            fields: [
                { id: 1, reason: 'Reason 1', value: 'Value 1' },
                { id: 2, reason: 'Reason 2', value: 'Value 2' },
                // Add more fields as needed
            ],
            append: jest.fn(),
            remove: jest.fn(),
            move: jest.fn(),
            prepend: jest.fn(),
            insert: jest.fn(),
        };

        render(<Cases caseFields={caseFields} getValue={getValue} control={controlMock} formState={formStateMock} />);

        // Drag and drop simulation
        const field1 = screen.getAllByTestId('case-field')[0];
        const field2 = screen.getAllByTestId('case-field')[1];

        fireEvent.dragStart(field1, { dataTransfer: { setData: jest.fn(), getData: jest.fn(() => 0) } });
        fireEvent.dragEnter(field2, { dataTransfer: { setData: jest.fn(), getData: jest.fn(() => 0) } });
        fireEvent.drop(field2, { dataTransfer: { setData: jest.fn(), getData: jest.fn(() => 0) } });
        expect(caseFields.move).toHaveBeenCalledWith(0, 1);

    });

    it('render date-picker for calender time', () => {
        getValue.mockReturnValueOnce('CALENDER_DATE_TIME')
        render(
            <Cases getValue={getValue} control={result.current.control} caseFields={casesFieldsMock} formState={formStateMock} />
        );
        expect(screen.getByTestId('value-input-date')).toBeInTheDocument();
    });
});


const defaultProps = {
    onChange: jest.fn()
}

describe('ValueField component', () => {
  test('renders Numeric input when dataType is NUMERIC', () => {
    const { getByTestId } = render(<ValueField {...defaultProps} dataType="NUMERIC" data-testid="numeric-input" />);
    expect(getByTestId('numeric-input')).toBeInTheDocument();
  });

  test('renders DatePicker input when dataType is CALENDER_DATE_TIME', () => {
    const { getByTestId } = render(<ValueField {...defaultProps}  dataType="CALENDER_DATE_TIME" />);
    expect(getByTestId('value-input-date')).toBeInTheDocument();
  });

  test('renders Time input when dataType is TIME', () => {
    const { getByTestId } = render(<ValueField {...defaultProps}  dataType="TIME" />);
    expect(getByTestId('data-type')).toBeInTheDocument();
    expect(getByTestId('days-input')).toBeInTheDocument();
    expect(getByTestId('hours-input')).toBeInTheDocument();
    expect(getByTestId('minutes-input')).toBeInTheDocument();
    expect(getByTestId('seconds-input')).toBeInTheDocument();
  });

  test('calls onChange with epoch time when dataType is TIME', () => {
    const onChangeMock = jest.fn();
    const { getByTestId } = render(<ValueField {...defaultProps}  dataType="TIME" onChange={onChangeMock} />);
    fireEvent.change(getByTestId('days-input'), { target: { value: '1' } });
    fireEvent.change(getByTestId('hours-input'), { target: { value: '10' } });
    fireEvent.change(getByTestId('minutes-input'), { target: { value: '30' } });
    fireEvent.change(getByTestId('seconds-input'), { target: { value: '45' } });
    expect(onChangeMock).toHaveBeenCalledWith(expect.any(Number));
  });

  test('resets minutes to zero when it reaches 59', () => {
    const { getByTestId } = render(<ValueField {...defaultProps}  dataType="TIME" />);
    const minutesInput = getByTestId('minutes-input');

    // Set minutes to 59
    fireEvent.change(minutesInput, { target: { value: '59' } });

    // Check if minutes value is updated
    expect(minutesInput).toHaveValue('59');

    // Set minutes to 60
    fireEvent.change(minutesInput, { target: { value: '60' } });

    // Check if minutes value is reset to 0
    expect(minutesInput).toHaveValue('0');
  });

  test('resets hours to zero when it reaches 24', () => {
    const { getByTestId } = render(<ValueField {...defaultProps}  dataType="TIME" />);
    const hoursInput = getByTestId('hours-input');

    // Set hours to 24
    fireEvent.change(hoursInput, { target: { value: '23' } });

    // Check if hours value is updated
    expect(hoursInput).toHaveValue('23');

    // Set hours to 24
    fireEvent.change(hoursInput, { target: { value: '24' } });

    // Check if hours value is reset to 0
    expect(hoursInput).toHaveValue('0');
  });

  test('resets seconds to zero when it reaches 59', () => {
    const { getByTestId } = render(<ValueField {...defaultProps}  dataType="TIME" />);
    const minutesInput = getByTestId('seconds-input');

    // Set minutes to 59
    fireEvent.change(minutesInput, { target: { value: '59' } });

    // Check if minutes value is updated
    expect(minutesInput).toHaveValue('59');

    // Set minutes to 60
    fireEvent.change(minutesInput, { target: { value: '60' } });

    // Check if seconds value is reset to 0
    expect(minutesInput).toHaveValue('0');
  });

  it('should update epoch time when days, hours, minutes, and seconds are changed', () => {
    const onChange = jest.fn();
    render(<ValueField value={0} onChange={onChange} dataType="TIME" />);

    // Change days
    fireEvent.change(screen.getByTestId('days-input'), { target: { value: 1 } });
    expect(onChange).toHaveBeenCalledWith(86400); // 1 day = 24 hours * 60 minutes * 60 seconds = 86400 seconds

    // Change hours
    fireEvent.change(screen.getByTestId('hours-input'), { target: { value: 24 } });
    expect(onChange).toHaveBeenCalledWith(86400); // 2 days = 48 hours * 60 minutes * 60 seconds = 172800 seconds

    // // Change minutes
    fireEvent.change(screen.getByTestId('minutes-input'), { target: { value: 30 } });
    expect(onChange).toHaveBeenCalledWith(86400); // 2 days, 2 hours, 30 minutes = (48*60*60) + (2*60*60) + (30*60) = 180300 seconds

    // Change seconds
    fireEvent.change(screen.getByTestId('seconds-input'), { target: { value: 45 } });
    expect(onChange).toHaveBeenLastCalledWith(133200); // 2 days, 2 hours, 30 minutes, 45 seconds = (48*60*60) + (2*60*60) + (30*60) + 45 = 180345 seconds
  });

  it('should update days, hours, minutes, and seconds when epoch time is changed', () => {
    const onChange = jest.fn();
    render(<ValueField value={0} onChange={onChange} dataType="TIME" />);
  
    // Change epoch time
    fireEvent.change(screen.getByTestId('epoch-input'), { target: { value: 1000 } });
  
    // Check if onChange function is called with the correct epoch time
    expect(onChange).toHaveBeenCalledWith(1000);
  
    // Check if days, hours, minutes, and seconds are updated accordingly
    expect((screen.getByTestId('days-input') as any).value).toBe('11');
    expect((screen.getByTestId('hours-input') as any).value).toBe('13');
    expect((screen.getByTestId('minutes-input') as any).value).toBe('46');
    expect((screen.getByTestId('seconds-input') as any).value).toBe('40');
  });

  it('should update data type and epoch time when data type is changed to positive', () => {
    const onChange = jest.fn();
    render(<ValueField value={0} onChange={onChange} dataType="TIME" />);

    // Change data type to positive
    fireEvent.mouseDown(screen.getByTestId('data-type').querySelector('.ant-select-selector') as any);

    fireEvent.click(screen.getByText('+ve'));

    // Check if setDateType is called with the correct value
    expect(screen.getByTestId('data-type').textContent).toContain('+ve');

    // Check if onChange function is called with the correct epoch time (positive)
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('should update data type and epoch time when data type is changed to negative', () => {
    const onChange = jest.fn();
    render(<ValueField value={0} onChange={onChange} dataType="TIME" />);

    // Change data type to negative
    fireEvent.mouseDown(screen.getByTestId('data-type').querySelector('.ant-select-selector') as any);

    fireEvent.click(screen.getByText('-ve'));

    // Check if setDateType is called with the correct value
    expect(screen.getByTestId('data-type').textContent).toContain('-ve');

    // Check if onChange function is called with the correct epoch time (negative)
    expect(onChange).toHaveBeenCalledWith(-0);
  });


});
