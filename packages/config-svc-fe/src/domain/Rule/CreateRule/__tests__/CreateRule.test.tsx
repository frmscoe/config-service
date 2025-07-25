// CreateRule.test.tsx
// import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateRulePage from '../index';
import * as service from '../service';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

jest.mock('../service', () => ({
  createRule: jest.fn(),
  checkRuleDuplicate: jest.fn().mockResolvedValue(false),
}));

describe('CreateRulePage', () => {
  const afterCreateMock = jest.fn();
  const setOpenMock = jest.fn();

  const defaultProps = {
    open: true,
    setOpen: setOpenMock,
    afterCreate: afterCreateMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Create Rule drawer with form inputs', () => {
    render(<CreateRulePage {...defaultProps} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/submit/i)).toBeInTheDocument();
    expect(screen.getByText(/exit/i)).toBeInTheDocument();
  });

  it('validates required fields and shows error messages', async () => {
    render(<CreateRulePage {...defaultProps} />);
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  it('calls createRule API and shows success modal on success', async () => {
    (service.createRule as jest.Mock).mockResolvedValueOnce({});

    render(<CreateRulePage {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'My Test Rule' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test rule description' } });
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(service.createRule).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Test Rule',
          desc: 'Test rule description',
          cfg: '1.0.0',
          dataType: 'NUMERIC',
        })
      );
      expect(setOpenMock).toHaveBeenCalledWith(false);
    });

    expect(await screen.findByText(/success/i)).toBeInTheDocument();
  });

  it('shows error alert if createRule fails', async () => {
    (service.createRule as jest.Mock).mockRejectedValueOnce(new Error('Failed to create rule'));

    render(<CreateRulePage {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Error Rule' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(screen.getByText(/failed to create rule/i)).toBeInTheDocument();
    });
  });

  it('shows duplicate modal and aborts if checkRuleDuplicate returns true', async () => {
    (service.checkRuleDuplicate as jest.Mock).mockResolvedValueOnce(true);

    render(<CreateRulePage {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Duplicate' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Some desc' } });
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(service.createRule).not.toHaveBeenCalled();
      expect(screen.getByText(/duplicate rule detected/i)).toBeInTheDocument();
    });
  });

  it('calls afterCreate after success modal is closed', async () => {
    (service.createRule as jest.Mock).mockResolvedValueOnce({});

    render(<CreateRulePage {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Close Modal' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Closing test' } });
    fireEvent.click(screen.getByText(/submit/i));

    const okButton = await screen.findByRole('button', { name: /ok/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(afterCreateMock).toHaveBeenCalled();
    });
  });
});