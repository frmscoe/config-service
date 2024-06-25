import { RenderResult, render, screen, waitFor } from "@testing-library/react";
import { ConfigTable, IProps } from "../ConfigTable";
import '../../../../../../setup';
import { IRuleConfig } from "../types";

jest.mock('~/hooks/usePrivileges', () => ({
    usePrivileges: jest.fn(() => ({ canViewRuleWithConfigs: true })),
}));

const defaultProps: IProps = {
    searchConfigText: "",
    handleSearchConfig: jest.fn(),
    setSearchConfigText: jest.fn(),
    data: [],
    setSearchSubmitted: jest.fn(),
    canEditConfig: false,
    canReviewConfig: false,
    searchSubmitted: false,
    searchConfigResults: []
}
const rules: IRuleConfig[] = [{
    "_key": "d8b3d1cb-bb9b-4dff-b7bd-985376d4424a",
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
        parameters: [],
        exitConditions: [],
        bands: [],
        cases: []
    }
}]
describe('ConfigTable component', () => {
    let component: RenderResult;
    it('should render table', async () => {
        await waitFor(() => {
            component = render(
                <ConfigTable {...defaultProps} />
            );

        })
        expect(component).toBeDefined();
    });

    it('should render data', async () => {
        await waitFor(() => {
            component = render(
                <ConfigTable {...defaultProps} data={rules} />
            );

        })
        expect(screen.getAllByText(rules[0].cfg).length).toBe(1);
    });

    it('should render modify button if has permission', async () => {
        await waitFor(() => {
            component = render(
                <ConfigTable {...defaultProps} data={rules} canEditConfig={true} />
           );
        })
     
        expect(screen.queryAllByText('Modify').length).toBe(1);
    });

    it('should hide modify button if has no permission', async () => {
        await waitFor(() => {
            component = render(
                <ConfigTable {...defaultProps} data={rules} canEditConfig={false} />
           );
        })
        expect(screen.queryAllByText('Modify').length).toBe(0);
    });

    it('should show review button if has permission', async () => {
        await waitFor(() => {
            component = render(
                <ConfigTable {...defaultProps} data={rules} canReviewConfig={true} />
           );
        })
        expect(screen.queryAllByText('Review').length).toBe(1);
    });

    it('should hide review button if has no permission', async () => {
        await waitFor(() => {
            component = render(
                <ConfigTable {...defaultProps} data={rules} canReviewConfig={false} />
           );
        })
        expect(screen.queryAllByText('Review').length).toBe(0);
    });
});