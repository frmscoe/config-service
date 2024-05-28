import "@testing-library/jest-dom";
import { RenderResult, render, waitFor } from "@testing-library/react";
import React from "react";
import RuleConfigListPage from '../index';
import { Api } from "~/client";
import { act } from "react-dom/test-utils";
import { AuthProvider } from "~/context/auth";
import { IRule } from "~/domain/Rule/RuleDetailPage/service";

jest.spyOn(require('~/hooks/usePrivileges'), 'default').mockReturnValue({ canViewRuleWithConfigs: true });

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
    ruleConfigs: [{"_key": "d8b3d1cb-bb9b-4dff-b7bd-985376d4424a",
    "_id": "rule/d8b3d1cb-bb9b-4dff-b7bd-985376d4424a",
    "_rev": "_hp0vfha---",
    "cfg": "text cfg",
    "state": "90_ABANDONED",
    "desc": "Test description",
    "ownerId": "admin",
    "createdAt": "2024-04-08T12:31:51.863Z",
    "updatedAt": "2024-04-08T12:31:51.863Z",
    ruleId: "kdkqpdq",
    config: {
        parameters: {
            maxQueryLimit: 0,
            tolerance: 0
        },
        exitConditions: [],
        bands: [],
        case: []
    }}],
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
describe('Rule Config List', () => {
    afterEach(() => {
        getMock.mockRestore();
    })
    it('should call get rule config', async () => {
        let component: RenderResult
        getMock.mockResolvedValue({ data: { rules: rules, count: 1 } })
        await waitFor(() => {
            component = render(
                <AuthProvider>
                <RuleConfigListPage />
                </AuthProvider>
            );
        })
        act(() => {
            expect(getMock).toHaveBeenCalled();
        });
    });

    it('should render content', async () => {
        let component: RenderResult
        getMock.mockResolvedValue({ data: { rules: rules, count: 1 } })
        await waitFor(() => {
            component = render(
               <AuthProvider>
                <RuleConfigListPage />
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
                <RuleConfigListPage />
                </AuthProvider>
            );
        });

        await act(async () => {
            expect((await component.findAllByText('An error occurred')).length).toBe(1);
        });
    });

    it('should render error', async () => {
        let component: RenderResult
        getMock.mockRejectedValueOnce({ response: { data: { message: 'An error occurred' } } })
        await waitFor(() => {
            component = render(
               <AuthProvider>
                <RuleConfigListPage />
                </AuthProvider>
            );
        });

        await act(async () => {
            expect((await component.findAllByText('An error occurred')).length).toBe(1);
        });
    });
})

  