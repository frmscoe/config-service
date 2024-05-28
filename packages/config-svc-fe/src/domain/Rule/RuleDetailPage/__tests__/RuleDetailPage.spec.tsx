import "@testing-library/jest-dom";
import { RenderResult,render, waitFor,screen, fireEvent } from "@testing-library/react";

import React from "react";
import RuleDetailPage from '../index';
import { Api } from "~/client";
import { act } from "react-dom/test-utils";
import { IRule } from "../service";
import Rule from '../RuleDetailPage';
import { AuthProvider, IUserProfile } from "~/context/auth";

const userDefault: IUserProfile = {
    clientId: "",
    username: "",
    platformRoleIds: [],
    privileges: []
}
jest.spyOn(require('~/hooks/usePrivileges'), 'default').mockReturnValue({ canViewRules: true });

const rules: IRule[] = [{
    "_key": "d8b3d1cb-bb9b-4dff-b7bd-985376d4424a",
    "_id": "rule/d8b3d1cb-bb9b-4dff-b7bd-985376d4424a",
    "_rev": "_hp0vfha---",
    "cfg": "text cfg",
    "state": "90_ABANDONED",
    "dataType": "currency",
    "desc": "Test description",
    "ownerId": "admin",
    "createdAt": "2024-04-08T12:31:51.863Z",
    "updatedAt": "2024-04-08T12:31:51.863Z",
    name: "rule",
    ruleConfigs: [],
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

const getMock = jest.spyOn(Api, 'get')
describe('Rule Detail', () => {
    afterEach(() => {
        getMock.mockRestore();
    });
    it('should call get rules', async () => {
        let component: RenderResult
        getMock.mockResolvedValue({ data: { rules, count: 1 } })
        await waitFor(() => {
            component = render(
                <AuthProvider>
                <RuleDetailPage />
                </AuthProvider>
            );
        })

        act(() => {
            expect(getMock).toHaveBeenCalled();
        });
    });

    it('should render content', async () => {
        let component: RenderResult
        getMock.mockResolvedValue({ data: { rules, count: 1 } })
        await waitFor(() => {
            component = render(
                <AuthProvider>
                <RuleDetailPage />
                </AuthProvider>
            );
        });
        await waitFor(async () => await component.findAllByText(rules[0].cfg))
        await act(async () => {
            expect((await component.findAllByText(rules[0].cfg)).length).toBe(1);
        });
    });

    it('should render error', async () => {
        let component: RenderResult
        getMock.mockRejectedValueOnce({ response: { data: { message: 'An error occurred' } } })
        await waitFor(() => {
            component = render(
                <AuthProvider>
                <RuleDetailPage />
                </AuthProvider>
            );
        });

        await act(async () => {
            expect((await component.findAllByText('An error occurred')).length).toBe(1);
        });
    });
});

describe('Rule component', () => {
    it('should render create button when user has create privilege', () => {
      const user = { privileges: ['SECURITY_CREATE_RULE'] };
      render(
        <Rule
          loading={false}
          error=""
          retry={() => {}}
          page={1}
          data={[]}
          total={0}
          onPageChange={() => {}}
          open={false}
          setOpen={() => {}}
         user={{...userDefault,...user}}
        />
      );
      expect(screen.getByText('Create')).toBeInTheDocument();
    });
  
    it('should render CreateRule component when open is true', () => {
      const user = { privileges: ['SECURITY_CREATE_RULE'] };
      render(
        <Rule
          loading={false}
          error=""
          retry={() => {}}
          page={1}
          data={[]}
          total={0}
          onPageChange={() => {}}
          open={true}
          setOpen={() => {}}
         user={{...userDefault,...user}}
        />
      );
      //Exit button on Modal
      expect(screen.getByText('Exit')).toBeInTheDocument();
    });
  
    it('should hide create button when user does not have create privilege', () => {
      const user = { privileges: [] };
      render(
        <Rule
          loading={false}
          error=""
          retry={() => {}}
          page={1}
          data={[]}
          total={0}
          onPageChange={() => {}}
          open={false}
          setOpen={() => {}}
         user={{...userDefault,...user}}
        />
      );
      expect(screen.queryByText('Create')).not.toBeInTheDocument();
    });
  
    it('should hide CreateRule component when open is false', () => {
      const user = { privileges: ['SECURITY_CREATE_RULE'] };
      render(
        <Rule
          loading={false}
          error=""
          retry={() => {}}
          page={1}
          data={[]}
          total={0}
          onPageChange={() => {}}
          open={false}
          setOpen={() => {}}
         user={{...userDefault,...user}}
        />
      );
    //   page has exit button
      expect(screen.queryByText('Exit')).not.toBeInTheDocument();
    });
  
    it('should call setOpen with true when create button is clicked', () => {
      const setOpen = jest.fn();
      const user = { privileges: ['SECURITY_CREATE_RULE'] };
      render(
        <Rule
          loading={false}
          error=""
          retry={() => {}}
          page={1}
          data={[]}
          total={0}
          onPageChange={() => {}}
          open={false}
          setOpen={setOpen}
         user={{...userDefault,...user}}
        />
      );
      fireEvent.click(screen.getAllByText('Create')[0]);
      expect(setOpen).toHaveBeenCalledWith(true);
    });

  });