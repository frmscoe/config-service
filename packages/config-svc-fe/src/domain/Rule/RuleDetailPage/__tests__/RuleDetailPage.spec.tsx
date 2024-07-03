import "@testing-library/jest-dom";
import { RenderResult,render, waitFor,screen, fireEvent } from "@testing-library/react";

import React from "react";
import RuleDetailPage from '../index';
import { Api } from "~/client";
import { act } from "react-dom/test-utils";
import { IRule } from "../service";
import Rule, {Props} from '../RuleDetailPage';
import { AuthProvider, IUserProfile } from "~/context/auth";
import { Modal } from "antd";
import * as service from '../service';
import { AxiosResponse } from "axios";


const userDefault: IUserProfile = {
    clientId: "",
    username: "",
    platformRoleIds: [],
    privileges: []
}
jest.spyOn(require('~/hooks/usePrivileges'), 'default').mockReturnValue({ canViewRules: true });

const defaultProps: Props =  {
  loading: false,
  error: "",
  retry: jest.fn(),
  page: 0,
  data: [],
  total: 0,
  onPageChange: jest.fn(),
  open: false,
  setOpen: jest.fn(),
  openEdit: false,
  setOpenEdit: jest.fn(),
  user:{...userDefault},
  selectedRule: null,
  setSelectedRule: jest.fn(),
}
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


const getMock = jest.spyOn(service, "getRules");

describe('Rule Detail', () => {
    it('should call get rules', async () => {
        let component: RenderResult
        getMock.mockResolvedValue({ data: { rules, count: 1 } } as AxiosResponse)
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
        getMock.mockResolvedValue({ data: { rules, count: 1 } } as AxiosResponse)
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
});

describe('Rule component', () => {
    it('should render create button when user has create privilege', () => {
      const user = { privileges: ['SECURITY_CREATE_RULE'] };
      render(
        <Rule
          {...defaultProps}
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
        {...defaultProps}

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
        {...defaultProps}

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
        {...defaultProps}

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
        {...defaultProps}
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

    it('should render error', () => {
      const setOpen = jest.fn();
      const user = { privileges: ['SECURITY_CREATE_RULE'] };
      render(
        <Rule
        {...defaultProps}
          loading={false}
          error="error"
          page={1}
          data={[]}
          total={0}
          onPageChange={() => {}}
          open={false}
          setOpen={setOpen}
         user={{...userDefault,...user}}
        />
      );
      fireEvent.click(screen.getByText(/Retry/));
      expect(defaultProps.retry).toHaveBeenCalled();
    });

    it('should call confirm when state of rule is not 01_DRAFT', () => {
      const setOpen = jest.fn();
      const confirm = jest.fn();
      jest.spyOn(Modal, "useModal").mockImplementation(() => ([{
        confirm: () => {
         confirm();
        },
      } as any, <div/>]))
      const user = { privileges: ['SECURITY_CREATE_RULE', 'SECURITY_UPDATE_RULE'] };
      render(
        <Rule
        {...defaultProps}
          loading={false}
          error=""
          retry={() => {}}
          page={1}
          data={rules}
          total={0}
          onPageChange={() => {}}
          open={false}
          setOpen={setOpen}
         user={{...userDefault,...user}}
        />
      );
      fireEvent.click(screen.getByTestId('modify-button'));
      expect(confirm).toHaveBeenCalled();
    });

    it('should call setEditOpen when state of rule is 01_DRAFT', () => {
      const setOpen = jest.fn();
      const confirm = jest.fn();
      jest.spyOn(Modal, "useModal").mockImplementation(() => ([{
        confirm: () => {
         confirm();
        },
      } as any, <div/>]))
      const user = { privileges: ['SECURITY_CREATE_RULE', 'SECURITY_UPDATE_RULE'] };
      render(
        <Rule
        {...defaultProps}
          loading={false}
          error=""
          retry={() => {}}
          page={1}
          data={[{
            state: '01_DRAFT',
            _key: "",
            _id: "",
            _rev: "",
            cfg: "",
            dataType: "",
            desc: "",
            ownerId: "",
            createdAt: "",
            updatedAt: "",
            name: "",
            ruleConfigs: []
          }]}
          total={0}
          onPageChange={() => {}}
          open={false}
          setOpen={setOpen}
         user={{...userDefault,...user}}
        />
      );
      fireEvent.click(screen.getByTestId('modify-button'));
      expect(defaultProps.setSelectedRule).toHaveBeenCalled();
      expect(defaultProps.setOpenEdit).toHaveBeenCalled();
    });

  });