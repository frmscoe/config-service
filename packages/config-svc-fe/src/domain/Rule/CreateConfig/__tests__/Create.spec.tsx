import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import CreateConfig, {IProps} from '../Create';
import '../../../../../setup';


jest.mock('axios', () => ({
    create: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
        interceptors: {
            request: {
                use: jest.fn(),
                eject: jest.fn(),
            },
            response: {
                use: jest.fn(),
                eject: jest.fn(),
            },
        },
    })),
}));

const props: IProps = {
  loading: false,
  setLoading: jest.fn(),
  success: '',
  serverError: '',
  activeKeys: ['1'],
  setActiveKey: jest.fn(),
  onSubmit:jest.fn()
}

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))



describe('CreateConfig component', () => {
  test('renders component with React Flow and ConfigForm', () => {
    render(<CreateConfig {...props} />);
    
    expect(screen.getByText('New Rule Configuration')).toBeInTheDocument();
    expect(screen.getByTestId('rf__background')).toBeInTheDocument();
  });

  test('opens ConfigForm on node click', () => {
    render(<CreateConfig {...props} />);
    
    // Click on the node to open ConfigForm
    fireEvent.click(screen.getByText('New Rule Config'));

    // Check if ConfigForm is open
    expect(screen.getByTestId('config-form')).toBeInTheDocument();
  });

});
