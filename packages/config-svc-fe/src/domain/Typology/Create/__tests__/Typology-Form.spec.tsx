import React from "react";
import { render, screen, fireEvent, renderHook, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import TypologyForm, {Props} from "../Typology-Form";
import '../../../../../setup';

const { result } = renderHook(() => useForm());

const defaultProps: Props = {
    formState: {
        isDirty: false,
        isLoading: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        isSubmitting: false,
        isValidating: false,
        isValid: false,
        disabled: false,
        submitCount: 0,
        defaultValues: {},
        dirtyFields: {},
        touchedFields: {},
        validatingFields: {},
        errors: {}
    },
    control: result.current.control,
    handleSubmit: jest.fn(),
    onSubmit: jest.fn(),
}

describe("TypologyForm", () => {
  
  it("renders TypologyForm component", async() => {
    render(<TypologyForm {...defaultProps} />);
    fireEvent.click(screen.getByTestId('show-recently-removed'));
    expect(screen.getByText("Typology Form")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('typology-form')).toBeInTheDocument());
  });

  it("hide TypologyForm component is show is false", async() => {
    render(<TypologyForm {...defaultProps} />);
    expect(screen.queryByTestId('typology-form')).not.toBeInTheDocument()
  });

  it("shows form when there are errors", async() => {
    render(<TypologyForm {...defaultProps} formState={{errors: {name: {message: 'Name is required'}}} as any} />);
    expect(screen.getByText("Typology Form")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('typology-form')).toBeInTheDocument());
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

});
 