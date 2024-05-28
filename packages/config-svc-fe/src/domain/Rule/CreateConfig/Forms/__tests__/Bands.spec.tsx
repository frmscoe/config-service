import React from 'react';
import { render, fireEvent, RenderResult, renderHook, screen, waitFor, getAllByRole } from '@testing-library/react';
import Bands, { ValueField, ValueProps } from '../Bands';
import { useForm } from 'react-hook-form';
import '../../../../../../setup';
import * as utils from "~/utils";


const { result } = renderHook(() => useForm())

const getValue = result.current.getValues
const setValue = result.current.setValue;

const setError = jest.fn();

describe('Bands component', () => {
    const controlMock = result.current.control;
    const bandsFieldsMock = {
        append: jest.fn(),
        remove: jest.fn(),
        fields: [
            { id: 1, reason: 'Test Reason 1', value: 10, upperLimit: 99 },
            { id: 2, reason: 'Test Reason 2',  value: 9, upperLimit: 100 }
        ],
        prepend: jest.fn(),
        update: jest.fn(),
        insert: jest.fn(),
    };
    const formStateMock = {
        errors: {
            bands: {
                0: { reason: { message: 'Reason Required' }, value: { message: 'Value Required' } }
            }
        }
    };
    let component: RenderResult;

    it('renders correctly with given props', () => {

        component = render(
            <Bands setError={setError} setValue={setValue} getValue={getValue} control={result.current.control} bandsFields={bandsFieldsMock} formState={formStateMock} />
        );
        expect(component).toBeDefined();
        expect(screen.getAllByTestId('band-field').length).toBe(2);
    });

    it('calls remove function when minus button is clicked', () => {
        const spy = jest.spyOn(result.current, 'getValues');
        spy.mockReturnValue([{value: 0, reason: ''}])
        render(
            <Bands setError={setError} setValue={setValue} getValue={spy} control={result.current.control} bandsFields={bandsFieldsMock} formState={formStateMock} />
        );
        fireEvent.click(screen.getAllByTestId('minus-icon')[1]);
        expect(bandsFieldsMock.remove).toHaveBeenCalledWith(1);
        spy.mockClear();
    });

    it('should not call remove function when minus button is clicked on index 0', () => {
        const spy = jest.spyOn(result.current, 'getValues');
        spy.mockReturnValue([{value: 0, reason: ''}])
        render(
            <Bands setError={setError} setValue={setValue} getValue={spy} control={result.current.control} bandsFields={bandsFieldsMock} formState={formStateMock} />
        );
        fireEvent.click(screen.getAllByTestId('minus-icon')[0]);
        expect(bandsFieldsMock.remove).not.toHaveBeenCalledWith();
        spy.mockClear();
    });

    it('removes field when minus icon pressed', () => {
        render(
            <Bands setError={setError} setValue={setValue} getValue={getValue} control={result.current.control} bandsFields={bandsFieldsMock} formState={formStateMock} />
        );
        expect(screen.getAllByTestId('band-field').length).toBe(2);
        fireEvent.click(screen.getAllByTestId('minus-icon')[0]);
        waitFor(() => {
            expect(bandsFieldsMock.remove).toHaveBeenCalledWith(0);
            expect(screen.getAllByTestId('band-field').length).toBe(1);
        });

    });

    it('add field when prepend button pressed', () => {
        const spy = jest.spyOn(result.current, 'getValues').mockReturnValueOnce(10 as any);

        render(
            <Bands setError={setError} setValue={setValue} getValue={getValue} control={result.current.control} bandsFields={bandsFieldsMock} formState={formStateMock} />
        );
        expect(screen.getAllByTestId('band-field').length).toBe(2);
        fireEvent.click(screen.getAllByTestId('prepend-button')[0]);
        expect(bandsFieldsMock.prepend).toHaveBeenCalled();
        spy.mockRestore()
    });

    it('add field when add button pressed', () => {
        render(
            <Bands setError={setError} setValue={setValue} getValue={getValue} control={result.current.control} bandsFields={{...bandsFieldsMock, fields: []}} formState={formStateMock} />
        );
        fireEvent.click(screen.getByTestId('add-button'));
        expect(bandsFieldsMock.append).toHaveBeenCalled();
    });

    it('add field when add button pressed and calls update if bands in list greater than 1  ', () => {
        //tests it triggers update upper limit for bands in the list if an item is added to bottom and there are some bands
        const updateMock = jest.fn();
        render(
            <Bands setError={setError} setValue={setValue} getValue={getValue} control={result.current.control} bandsFields={{...bandsFieldsMock, update: updateMock, fields: [{value: 10, reason:'Yes'}, {value: 100, reason:'Yes'}]}} formState={formStateMock} />
        );
        expect(screen.getAllByTestId('band-field').length).toBe(2);
        fireEvent.click(screen.getAllByTestId('append-button')[1]);
        expect(bandsFieldsMock.append).toHaveBeenCalled();
        expect(updateMock).toHaveBeenCalledTimes(2);
    });

    it('add field when add button pressed and not call update if there are no bands  ', () => {
        //tests it triggers update upper limit for bands in the list if an item is added to bottom and there are some bands
        const spy = jest.spyOn(result.current, 'getValues').mockReturnValue([]);
        const updateMock = jest.fn();
        const appendMock = jest.fn();
        render(
            <Bands setError={setError} setValue={setValue} getValue={result.current.getValues} control={controlMock} bandsFields={{...bandsFieldsMock, update: updateMock, append: appendMock, fields: []}} formState={formStateMock} />
        );
        fireEvent.click(screen.getByTestId('add-button'));
        expect(appendMock).toHaveBeenCalled();
        expect(updateMock).not.toHaveBeenCalled();
        spy.mockReset();
    });

    it('calls insert function when append button is clicked and more than 1 band', () => {
        const getValueSpy = jest.spyOn(result.current, 'getValues');
        getValueSpy.mockReturnValue([]);
        render(
            <Bands setError={setError} setValue={setValue} getValue={getValue} control={result.current.control} bandsFields={bandsFieldsMock} formState={formStateMock} />
        );
        fireEvent.click(screen.getAllByTestId('append-button')[0]);
        expect(bandsFieldsMock.insert).toHaveBeenCalled();
        getValueSpy.mockClear();
    });

    it('displays error messages correctly', () => {
        render(
            <Bands setError={setError} setValue={setValue} getValue={getValue} control={controlMock} bandsFields={bandsFieldsMock} formState={formStateMock} />
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
            <Bands setError={setError} setValue={setValue} getValue={getValue} control={controlMock} bandsFields={bandsFieldsMock} formState={formStateMock} />
        );

        // Find input fields and their associated error messages
        const reasonInput = screen.getAllByTestId('reason-input')[0];
        const reasonErrorMessage = screen.getAllByText('Reason Required')[0];

        const valueErrorMessage = screen.getAllByText('Value Required')[0];

        // Assert that input fields have error state
        expect(reasonInput).toHaveClass('ant-input ant-input-status-error');
        expect(reasonErrorMessage).toBeInTheDocument();

        expect(valueErrorMessage).toBeInTheDocument();
    });

    it('updates band maximum condition and upper limits of bands when maximum condition input is changed', async () => {
        const { result: {current: {control, ...props}} } = renderHook(() => useForm())
        const getValueSpy = jest.spyOn(props, 'getValues');
        getValueSpy.mockReturnValue([]);
        const { getByTestId } = render(<Bands setError={setError} setValue={props.setValue} getValue={getValueSpy} control={control} bandsFields={{...bandsFieldsMock, fields: []}} formState={formStateMock} />
        );

        // Get the maximum condition input
        const maxConditionInput = getByTestId('bandMaximumConditionInput');

        // Change the maximum condition input value
        fireEvent.change(maxConditionInput, { target: { value: 10 } });

        // Check if the maximum condition input value is updated
        expect(maxConditionInput).toHaveValue(10);

        expect(getByTestId('bandMaximumConditionInput')).toHaveValue(10);
        getValueSpy.mockClear();

    });

    it('should render slider if dataType is time or Numeric', async () => {
        const { result: {current: {control}} } = renderHook(() => useForm())
        const getValueSpy = jest.fn(() => 'TIME') 
        const updateMock = jest.fn();
        const setValue = jest.fn();
       
        const { container, rerender } = render(<Bands setError={setError} setValue={setValue} getValue={getValueSpy} control={control} bandsFields={{...bandsFieldsMock, update: updateMock}} formState={formStateMock} />
        );
        // Get the slider element
        const slider = getAllByRole(container,"slider")[1]; 

       expect(slider).toBeInTheDocument();
       const getValueSpyNumeric = jest.fn(() => 'NUMERIC');
       rerender(<Bands setError={setError} setValue={setValue} getValue={getValueSpyNumeric} control={control} bandsFields={{...bandsFieldsMock, update: updateMock}} formState={formStateMock} />);
       const slider2 = getAllByRole(container,"slider")[1]; 
       expect(slider2).toBeInTheDocument();
       getValueSpy.mockReset();

      });


      it('should clear error on change calender input', () => {
        const bandsFields = {
          append: jest.fn(),
          remove: jest.fn(),
          fields: [{value: 100, reason: ''}],
          prepend: jest.fn(),
          update: jest.fn(),
          insert: jest.fn(),
        }; // Mock the bandsFields object
        const formState = {}; // Mock the formState object
        const getValueMock = jest.fn()
        getValueMock.mockReturnValueOnce('CALENDER_DATE_TIME')
        .mockReturnValueOnce(1000); // Mock the getValue function to return 'CALENDER_DATE_TIME' for the first call and 1000 for the second call
        const setValue = jest.fn(); // Mock the setValue function
        const setError = jest.fn(); // Mock the setError function
    
        const { getByTestId } = render(
          <Bands control={controlMock} bandsFields={bandsFields} formState={formState} getValue={getValueMock} setValue={setValue} setError={setError} />
        );
    
        // Simulate user interactions to trigger handleChangeValueField function
        fireEvent.change(getByTestId('value-input'), { target: { value: 9000 } });
    
        // Assert that setError is called with the expected message
        expect(setError).toHaveBeenCalledWith('bands[0].value', undefined);
        });

      it('should update the value and time fields when the slider is changed', () => {
        const mockProps = {
          bandsFields: {
            fields: [{ id: '1', value: 100, upperLimit: 100 }],
            update: jest.fn(),
            prepend: jest.fn(),
            insert: jest.fn(),
            append: jest.fn(),
            remove: jest.fn(),
          },
          formState: { errors: {} }, // mock formState object
          getValue: jest.fn((key) => {
            if (key === 'dataType') return 'TIME';
            if (key === 'bands') return [{ value: 100, upperLimit: 100 }];
            return null;
          }),
          setValue: jest.fn(),
          setError: jest.fn(),
        };
    
        const { getByTestId } = render(<Bands {...mockProps} control={result.current.control}/>);
        const convertMillisecondsToDHMS = jest.spyOn(utils, 'convertMillisecondsToDHMS').mockReturnValueOnce({days: 1, hours: 1, minutes: 1, seconds: 1});

        // Simulate changing the slider value
        const slider = getByTestId('slider-wrapper-0').querySelector('.ant-slider') as HTMLElement;
        fireEvent.mouseDown(slider, { clientY: 0 });
        fireEvent.mouseMove(slider, { clientY: 50 }); // Change as needed
        fireEvent.mouseUp(slider);
    
        // Check if the setValue function was called with the correct parameters
        expect(mockProps.setValue).toHaveBeenCalledWith('bands[0].value', expect.any(Number));
    
        // Check if the time values were updated correctly
        expect(mockProps.setValue).toHaveBeenCalledWith(
          'bands[0].value',
          expect.any(Number)
        );
        expect(convertMillisecondsToDHMS).toHaveBeenCalled();
      });

      it('should call update bands if bands list greater than 1 and slider is changed', () => {
        const mockProps = {
          bandsFields: {
            fields: [{ id: '1', value: 100, upperLimit: 100 }, { id: '2', value: 100, upperLimit: 100 },],
            update: jest.fn(),
            prepend: jest.fn(),
            insert: jest.fn(),
            append: jest.fn(),
            remove: jest.fn(),
          },
          formState: { errors: {} }, // mock formState object
          getValue: jest.fn((key) => {
            if (key === 'dataType') return 'NUMERIC';
            if (key === 'bands') return [{ value: 100, upperLimit: 100 }, {value: 200, upperLimit: 400}];
            return null;
          }),
          setValue: jest.fn(),
          setError: jest.fn(),
        };
    
        const { getByTestId } = render(<Bands {...mockProps} control={result.current.control}/>);

        // Simulate changing the slider value
        const slider = getByTestId('slider-wrapper-1').querySelector('.ant-slider') as HTMLElement;
        fireEvent.mouseDown(slider, { clientY: 0 });
        fireEvent.mouseMove(slider, { clientY: 50 }); // Change as needed
        fireEvent.mouseUp(slider);
    
    
        // Check if the time values were updated correctly
        expect(mockProps.setValue).toHaveBeenCalledWith(
          'bands[1].value',
          expect.any(Number)
        );
        expect(mockProps.bandsFields.update).toHaveBeenCalled();
      });    
});

const defaultProps: ValueProps = {
    dataType: '',
    handleTimeChange: jest.fn(),
    timeValues: [],
    index: 0,
    setTimeValues: jest.fn(),
    onChange: jest.fn(),
    max: 0,
    value: 0,
    getValue: jest.fn(),
}
describe('ValueField component', () => {
    it('renders with numeric data type', () => {
      const { getByTestId } = render(<ValueField {...defaultProps} data-testid="numeric-input" dataType="NUMERIC" max={100} />);
      const numericInput = getByTestId('numeric-input');
      expect(numericInput).toBeInTheDocument();
      // Add more assertions if needed
    });
  
    it('renders with time data type', () => {
      const { getByTestId } = render(<ValueField {...defaultProps} dataType="TIME" />);
      const timeInput = getByTestId('epoch-input');
      expect(timeInput).toBeInTheDocument();
      // Add more assertions if needed
    });
  
    it('handles changes for numeric data type', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(<ValueField {...defaultProps} data-testid="numeric-input" dataType="NUMERIC" max={100} onChange={onChange} />);
      const numericInput = getByTestId('numeric-input');
  
      // Simulate value change
      fireEvent.change(numericInput, { target: { value: '50' } });
  
      // Check if onChange function is called with the correct value
      expect(onChange).toHaveBeenCalledWith(50);
    });
  
    it('handles changes for time data type when epoch time entered', () => {
      const onChange = jest.fn();
      const setTimeValues = jest.fn();
      const { getByTestId } = render(<ValueField {...defaultProps} dataType="TIME" onChange={onChange} setTimeValues={setTimeValues} />);
      const epochInput = getByTestId('epoch-input');
   
  
      // Simulate epoch value change
      fireEvent.change(epochInput, { target: { value: '3600000' } });
  
      // Check if onChange function is called with the correct value
      expect(onChange).toHaveBeenCalledWith(3600000);
  
      expect(setTimeValues).toHaveBeenCalledWith(expect.any(Function)); // Assuming the function passed to setTimeValues updates state correctly
    });

    it('handles changes epoch if seconds changed', () => {
        const onChange = jest.fn();
        const setTimeValues = jest.fn();
        const { getByTestId } = render(<ValueField {...defaultProps} dataType="TIME" onChange={onChange} setTimeValues={setTimeValues} />);
        const secondInput = getByTestId('seconds-input');
        fireEvent.change(secondInput, { target: { value: '1' } });
    
        // Check if onChange function is called with the correct value
        expect(onChange).toHaveBeenCalledWith(1);
    
      });

      it('handles changes epoch if hours changed', () => {
        const onChange = jest.fn();
        const setTimeValues = jest.fn();
        const { getByTestId } = render(<ValueField {...defaultProps} dataType="TIME" onChange={onChange} setTimeValues={setTimeValues} />);
        const hourInput = getByTestId('hours-input');
        fireEvent.change(hourInput, { target: { value: '1' } });
    
        expect(onChange).toHaveBeenCalledWith(3600);
    
      });


      it('handles changes epoch if minutes changed', () => {
        const onChange = jest.fn();
        const setTimeValues = jest.fn();
        const { getByTestId } = render(<ValueField {...defaultProps} dataType="TIME" onChange={onChange} setTimeValues={setTimeValues} />);
        const MinuteInput = getByTestId('minutes-input');
        fireEvent.change(MinuteInput, { target: { value: '1' } });
    
        expect(onChange).toHaveBeenCalledWith(60);
    
      });

      it('handles changes epoch if days changed', () => {
        const onChange = jest.fn();
        const setTimeValues = jest.fn();
        const { getByTestId } = render(<ValueField {...defaultProps} dataType="TIME" onChange={onChange} setTimeValues={setTimeValues} />);
        const dayInput = getByTestId('days-input');
        fireEvent.change(dayInput, { target: { value: '1' } });
    
        expect(onChange).toHaveBeenCalledWith(86400);
    
      });
  
  });
