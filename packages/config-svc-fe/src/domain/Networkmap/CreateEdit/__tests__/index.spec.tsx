import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NetworkMapPage from '../index';
import * as service from '../service';
import '../../../../../setup';
import { mockData } from '../mock';

class ResizeObserver {
    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
}
global.ResizeObserver = ResizeObserver;

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

const getTypologies = jest.spyOn(service, "getTypologies");
const getTypology = jest.spyOn(service, "getTypology");
const createNetworkMap = jest.spyOn(service, "createNetworkMap");
const usePrivileges = jest.spyOn(require('~/hooks/usePrivileges'), 'default');

describe.only('NetworkMapPage', () => {
    beforeEach(() => {
        (usePrivileges as jest.Mock).mockReturnValue({
            canCreateNetworkMap: true,
            canViewTypologyList: true,
            canReviewTypology: true,
        });
        // (getTypologies as jest.Mock).mockResolvedValue({ data: { data: [] } });
        // (getTypology as jest.Mock).mockResolvedValue({ data: {} });
        // (createNetworkMap as jest.Mock).mockResolvedValue({});
    });

    test('renders without crashing', () => {
        getTypologies.mockResolvedValue({data: {data: mockData}} as any);
        render(<NetworkMapPage />);
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    test('displays error message when user lacks canCreateNetworkMap', () => {
        getTypologies.mockResolvedValue({data: {data: mockData}} as any);

        (usePrivileges).mockReturnValue({
            canCreateNetworkMap: false,
            canViewTypologyList: true,
            canReviewTypology: true,
        });
        render(<NetworkMapPage />);
        expect(screen.getByText(/You don't have permission to create a network map/)).toBeInTheDocument();
    });

    test('displays error message when user lacks canViewTypologyList', () => {
        getTypologies.mockResolvedValue({data: {data: mockData}} as any);

        (usePrivileges).mockReturnValue({
            canCreateNetworkMap: true,
            canViewTypologyList: false,
            canReviewTypology: true,
        });
        render(<NetworkMapPage />);
        expect(screen.getByText(/You don't have permission to view typology list/)).toBeInTheDocument();
    });

    test('displays error message when user lacks canReviewTypology', () => {
        getTypologies.mockResolvedValue({data: {data: mockData}} as any);

        (usePrivileges).mockReturnValue({
            canCreateNetworkMap: true,
            canViewTypologyList: true,
            canReviewTypology: false,
        });
        render(<NetworkMapPage />);
        expect(screen.getByText(/You don't have permission to get details for a single typology/)).toBeInTheDocument();
    });

    test('handles save with no attached rules', async () => {
        (usePrivileges).mockReturnValue({
            canCreateNetworkMap: true,
            canViewTypologyList: true,
            canReviewTypology: true,
        });
        render(<NetworkMapPage />);
        getTypologies.mockResolvedValue({data: {data: mockData}} as any)
        await waitFor(() => expect(screen.getByTestId('typology-drag-item-0')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Save'));
        expect(screen.getByText('Please add at least one typology')).toBeInTheDocument();
    });

      test('handle drop typology node on page', async () => {
        (usePrivileges).mockReturnValue({
            canCreateNetworkMap: true,
            canViewTypologyList: true,
            canReviewTypology: true,
        });
        render(<NetworkMapPage />);
        getTypologies.mockResolvedValue({data: {data: mockData}} as any)
        await waitFor(() => expect(screen.getByTestId('typology-drag-item-0')).toBeInTheDocument());
        await waitFor(() => expect(screen.queryAllByTestId(/typology-node/).length).toBe(0));;
        const flow = document.querySelector('.react-flow') as Element;
        const typologyNode = screen.getByTestId('typology-drag-item-0');
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'typology'
                }
                return JSON.stringify({...mockData[0], versions: [mockData[0], mockData[1]]})
            }),
        };
        const preventDefault = jest.fn();
        fireEvent.dragStart(typologyNode, { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        expect(dataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'node');
        expect(dataTransfer.setData).toHaveBeenCalledWith('type', 'typology');
        await waitFor(() => expect(screen.getAllByTestId(/typology-node/).length).toBe(1));;
      });

      test('handle expand typology to see versions', async () => {
        (usePrivileges).mockReturnValue({
            canCreateNetworkMap: true,
            canViewTypologyList: true,
            canReviewTypology: true,
        });
     
        getTypologies.mockResolvedValue({data: {data: mockData}} as any);
        jest.spyOn(service, 'groupTypologies').mockReturnValueOnce([
            {
                ...mockData[0],
                versions: [mockData[0], mockData[1]]
            }, 
            {
                ...mockData[2],
                versions: [],
            }
        ]);
    
        render(<NetworkMapPage />);

        await waitFor(() => expect(screen.getByTestId('typology-drag-item-0')).toBeInTheDocument());
        await waitFor(() => expect(screen.queryAllByTestId(/typology-node/).length).toBe(0));;
        const flow = document.querySelector('.react-flow') as Element;
        const typologyNode = screen.getByTestId('typology-drag-item-0');
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'typology'
                }
                return JSON.stringify({...mockData[0], versions: [mockData[0], mockData[1]]})
            }),
        };
        const preventDefault = jest.fn();
        fireEvent.dragStart(typologyNode, { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        expect(dataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'node');
        expect(dataTransfer.setData).toHaveBeenCalledWith('type', 'typology');
        await waitFor(() => expect(screen.getAllByTestId(/typology-node/).length).toBe(1));
        const expandIcon = screen.getAllByTestId('open-expand')[0];
        fireEvent.click(expandIcon);
        await waitFor(() => expect(screen.getAllByTestId('version-node').length).toBe(2));
      });

      test('handle expand all to see versions', async () => {
        (usePrivileges).mockReturnValue({
            canCreateNetworkMap: true,
            canViewTypologyList: true,
            canReviewTypology: true,
        });
     
        getTypologies.mockResolvedValue({data: {data: mockData}} as any);
        jest.spyOn(service, 'groupTypologies').mockReturnValueOnce([
            {
                ...mockData[0],
                versions: [mockData[0], mockData[1]]
            }, 
            {
                ...mockData[2],
                versions: [],
            }
        ]);
    
        render(<NetworkMapPage />);
        await waitFor(() => expect(screen.getByTestId('typology-drag-item-0')).toBeInTheDocument());
        await waitFor(() => expect(screen.queryAllByTestId(/typology-node/).length).toBe(0));;
        const flow = document.querySelector('.react-flow') as Element;
        const typologyNode = screen.getByTestId('typology-drag-item-0');
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'typology'
                }
                return JSON.stringify({...mockData[0], versions: [mockData[0], mockData[1]]})
            }),
        };
        const preventDefault = jest.fn();
        fireEvent.dragStart(typologyNode, { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        expect(dataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'node');
        expect(dataTransfer.setData).toHaveBeenCalledWith('type', 'typology');
        await waitFor(() => expect(screen.getAllByTestId(/typology-node/).length).toBe(1));
        const expandAllIcon = screen.getByTestId('expand-all');
        fireEvent.click(expandAllIcon);
        await waitFor(() => expect(screen.getAllByTestId('version-node').length).toBe(2));
      });

      test('handle check version node to set rules and configs', async () => {
        (usePrivileges).mockReturnValue({
            canCreateNetworkMap: true,
            canViewTypologyList: true,
            canReviewTypology: true,
        });
     
        getTypologies.mockResolvedValue({data: {data: mockData}} as any);
        jest.spyOn(service, 'groupTypologies').mockReturnValueOnce([
            {
                ...mockData[0],
                versions: [mockData[0], mockData[1]]
            }, 
            {
                ...mockData[2],
                versions: [],
            }
        ]);
    
        render(<NetworkMapPage />);
        await waitFor(() => expect(screen.getByTestId('typology-drag-item-0')).toBeInTheDocument());
        await waitFor(() => expect(screen.queryAllByTestId(/typology-node/).length).toBe(0));;
        const flow = document.querySelector('.react-flow') as Element;
        const typologyNode = screen.getByTestId('typology-drag-item-0');
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'typology'
                }
                return JSON.stringify({...mockData[0], versions: [mockData[0], mockData[1]]})
            }),
        };
        const preventDefault = jest.fn();
        fireEvent.dragStart(typologyNode, { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        getTypology.mockResolvedValue({data: mockData[0]} as any);
        expect(dataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'node');
        expect(dataTransfer.setData).toHaveBeenCalledWith('type', 'typology');
        await waitFor(() => expect(screen.getAllByTestId(/typology-node/).length).toBe(1));
        const expandAllIcon = screen.getByTestId('expand-all');
        fireEvent.click(expandAllIcon);
        await waitFor(() => expect(screen.getAllByTestId('version-node').length).toBe(2));
        const versionNodeCheckBox = screen.getAllByTestId('version-node-check')[0];
        fireEvent.click(versionNodeCheckBox);
        await waitFor(() => expect(screen.getAllByTestId('attached-rule').length).toBe(2));
        await waitFor(() => expect(screen.getAllByTestId('attached-config').length).toBe(2));

      });

      test('handle uncheck version node to remove rules and configs', async () => {
        (usePrivileges).mockReturnValue({
            canCreateNetworkMap: true,
            canViewTypologyList: true,
            canReviewTypology: true,
        });
     
        getTypologies.mockResolvedValue({data: {data: mockData}} as any);
        jest.spyOn(service, 'groupTypologies').mockReturnValueOnce([
            {
                ...mockData[0],
                versions: [mockData[0], mockData[1]]
            }, 
            {
                ...mockData[2],
                versions: [],
            }
        ]);
    
        render(<NetworkMapPage />);
        await waitFor(() => expect(screen.getByTestId('typology-drag-item-0')).toBeInTheDocument());
        await waitFor(() => expect(screen.queryAllByTestId(/typology-node/).length).toBe(0));;
        const flow = document.querySelector('.react-flow') as Element;
        const typologyNode = screen.getByTestId('typology-drag-item-0');
        const dataTransfer = {
            setData: jest.fn(),
            getData: jest.fn().mockImplementation((arg) => {
                if (arg === 'type') {
                    return 'typology'
                }
                return JSON.stringify({...mockData[0], versions: [mockData[0], mockData[1]]})
            }),
        };
        const preventDefault = jest.fn();
        fireEvent.dragStart(typologyNode, { dataTransfer });
        fireEvent.drop(flow, {
            dataTransfer,
            preventDefault,
        });
        getTypology.mockResolvedValue({data: mockData[0]} as any);
        expect(dataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'node');
        expect(dataTransfer.setData).toHaveBeenCalledWith('type', 'typology');
        await waitFor(() => expect(screen.getAllByTestId(/typology-node/).length).toBe(1));
        const expandAllIcon = screen.getByTestId('expand-all');
        fireEvent.click(expandAllIcon);
        await waitFor(() => expect(screen.getAllByTestId('version-node').length).toBe(2));
        const versionNodeCheckBox = screen.getAllByTestId('version-node-check')[0];
        fireEvent.click(versionNodeCheckBox);
        await waitFor(() => expect(screen.getAllByTestId('attached-rule').length).toBe(2));
        await waitFor(() => expect(screen.getAllByTestId('attached-config').length).toBe(2));
        //Uncheck Boxes
        fireEvent.click(versionNodeCheckBox);
        await waitFor(() => expect(screen.queryAllByTestId('attached-rule').length).toBe(0));
        await waitFor(() => expect(screen.queryAllByTestId('attached-config').length).toBe(0));


      });
});
