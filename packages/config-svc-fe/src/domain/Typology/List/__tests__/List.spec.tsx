import "@testing-library/jest-dom";
import { RenderResult,render, waitFor,screen } from "@testing-library/react";
import React from "react";
import TypologyListPage from '../index';
import { act } from "react-dom/test-utils";
import {  ITypology } from "../service";
import List from '../List';
import { AuthProvider } from "~/context/auth";
import * as service from '../service';

jest.spyOn(require('~/hooks/usePrivileges'), 'default').mockReturnValue({ canViewTypologyList: true });

const typologies: ITypology[] = [{
    "_key": "d8b3d1cb-bb9b-4dff-b7bd-985376d4424a",
    "_id": "rule/d8b3d1cb-bb9b-4dff-b7bd-985376d4424a",
    "state": "90_ABANDONED",
    "desc": "Test description",
    "ownerId": "admin",
    "createdAt": "2024-04-08T12:31:51.863Z",
    "updatedAt": "2024-04-08T12:31:51.863Z",
    name: "typology 1",
    "cfg": "1.0.0"
}]
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false, // You can adjust this value based on your test scenario
        media: query,
        onchange: null,
        addListener: jest.fn(), // You can also mock other methods if needed
        removeListener: jest.fn(),
    })),
});
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

const getMock = jest.spyOn(service, 'getTypologies');
describe('Typology List', () => {
    afterEach(() => {
        getMock.mockClear();
    });
    it('should call get typologies', async () => {
        let component: RenderResult
        getMock.mockResolvedValue({ data: { typologies, count: 1 } } as any);
        await waitFor(() => {
            component = render(
                <AuthProvider>
                <TypologyListPage />
                </AuthProvider>
            );
        })

        act(() => {
            expect(getMock).toHaveBeenCalled();
        });
    });

    it('should render content', async () => {
        let component: RenderResult
        getMock.mockResolvedValue({ data: { typologies, count: 1 } } as any)
        await waitFor(() => {
            component = render(
                <AuthProvider>
                <TypologyListPage />
                </AuthProvider>
            );
        });
        expect(screen.findAllByText(typologies[0].cfg));
        
    });

    it('should render error', async () => {
        let component: RenderResult
        getMock.mockRejectedValueOnce({ response: { data: { message: 'An error occurred' } } })
        await waitFor(() => {
            component = render(
                <AuthProvider>
                <TypologyListPage />
                </AuthProvider>
            );
        });

        expect((await screen.findAllByText('An error occurred')).length).toBe(1);

    });
});

describe('Typology component', () => {
    it('should render create button when user has create privilege', () => {
    jest.spyOn(require('~/hooks/usePrivileges'), 'default').mockReturnValue({ canCreateTypology: true });

      render(
       <List
          loading={false}
          error=""
          retry={() => {}}
          page={1}
          data={[]}
          total={0}
          onPageChange={() => {}}
        />
      );
      expect(screen.getByTestId('create-button')).toBeInTheDocument();
    });
  
    it('should hide create button when user does not have create privilege', () => {
    jest.spyOn(require('~/hooks/usePrivileges'), 'default').mockReturnValue({ canCreateTypology: false });

     const {queryByTestId} = render(
       <List
          loading={false}
          error=""
          retry={() => {}}
          page={1}
          data={[]}
          total={0}
          onPageChange={() => {}}
        />
      );
      expect(queryByTestId('create-button')).not.toBeInTheDocument();
    });

  });