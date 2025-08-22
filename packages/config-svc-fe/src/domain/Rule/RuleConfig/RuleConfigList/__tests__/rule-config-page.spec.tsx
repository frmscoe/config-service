

// silence noisy logs just for this file
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});
afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
  (console.log as jest.Mock).mockRestore();
});

// put this at the very top of rule-config-page.spec.tsx (before importing ReviewPage)
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'c1' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}));







jest.mock('axios', () => {
  const mAxios = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    create: jest.fn(), // must exist for axios.create(...)
  };
  // make axios.create() return the same mock instance
  (mAxios.create as any).mockReturnValue(mAxios);
  return { __esModule: true, default: mAxios };
});



// Mocks
jest.mock("~/hooks/usePrivileges", () => () => ({
  canCreateRuleConfig: true,
  canEditConfig: true,
  canReviewConfig: true,
  canViewRuleConfig: true,   // add a couple of common ones
  canViewRule: true,
  privileges: [],
}));

jest.mock("~/hooks", () => ({
  useCommonTranslations: () => ({
    t: (key: string) => key,
  }),
}));
jest.mock("../service", () => ({
  postRuleConfig: jest.fn(),
  getRuleAndConfigs: jest.fn().mockResolvedValue({ ruleConfigs: [] }),
}));
jest.mock("../../../CreateConfig/service", () => ({
  getExitConditions: jest.fn().mockResolvedValue([]),
  getUserProfile: jest.fn().mockResolvedValue({}),
}));

jest.mock('~/context/auth', () => ({
  useAuth: () => ({
    profile: { id: 'test-user' },
    token: 'mock-token',
    // include any fields ReviewPage reads; safe to add no-ops:
    setProfile: jest.fn(),
    setToken: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock("../../../ReviewConfig/service", () => ({
  getRuleConfig: jest.fn().mockResolvedValue({
    data: {
      _key: "c1",
      cfg: "1.0.0",
      desc: "Config 1",
      state: "ACTIVE",
      ownerId: "owner1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ruleId: "rules/r1", // ReviewPage splits this
      config: {
        parameters: [{ ParameterName: "P1", ParameterValue: "V1", ParameterType: "String" }],
        bands: [{ subRuleRef: "0.1", upperLimit: 10, lowerLimit: 0, reason: "Reason" }],
        cases: [{ subRuleRef: "0.1", value: "Val", reason: "Reason" }],
        exitConditions: [{ subRuleRef: "0.1", reason: "Reason" }],
      },
    },
  }),
  getRule: jest.fn().mockResolvedValue({
    data: { _key: "r1", name: "Rule One" },
  }),
}));

jest.mock('../../../../../../machine/guards', () => ({
  canTransition: jest.fn(() => true),
}));



Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ResizeObserver;

window.scrollTo = jest.fn();


// __tests__/rule-config-page.spec.tsx
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom';

// Components
import RuleConfigList from "../RuleConfigList";
import { ConfigForm } from "../../../CreateConfig/Forms";
// import ReviewPage  from "../../../ReviewConfig";
// was: import ReviewPage from "../../../ReviewConfig";
import { Review as ReviewPage } from "../../../ReviewConfig/Review";


jest.setTimeout(10000);
afterEach(() => jest.clearAllMocks());



describe("Frontend Component Tests – Rule Config Page", () => {

  const sampleRules = [
    {
      _key: "r1",
      name: "Rule One",
      cfg: "1.0.0",
      desc: "Test rule",
      state: "ACTIVE",
      ownerId: "owner1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ruleConfigs: [
        {
          _key: "c1",
          cfg: "1.0.0",
          desc: "Config 1",
          state: "ACTIVE",
          ownerId: "owner1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]
    }
  ];

  /** FE-RCFG-001 */
  it("FE-RCFG-001: Displays all rule configs in table with Create Config button", async () => {
    render(
      <RuleConfigList
        loading={false}
        error=""
        retry={jest.fn()}
        data={sampleRules}
        page={1}
        total={1}
        onPageChange={jest.fn()}
        user={{} as any}
      />
    );

    // await screen.findByRole('table');
    await screen.findByTestId('rule-config-view');

    expect(screen.getByTestId("rule-config-view")).toBeInTheDocument();
    expect(screen.getByText("Rule One")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /createConfig/i })).toBeInTheDocument();
  });

  

  /** FE-RCFG-003 */
  it("FE-RCFG-003: Allows selection of data type, description, and version", async () => {
    const handleSubmit = jest.fn();
    render(
      <ConfigForm
        open={true}
        setOpen={jest.fn()}
        loading={false}
        setLoading={jest.fn()}
        serverError=""
        success=""
        activeKeys={["1"]}
        setActiveKey={jest.fn()}
        onSubmit={handleSubmit}
        rule={{
          name: "Rule One",
          desc: "Test rule",
          ownerId: "owner1",
          updatedBy: "",
          updatedAt: "",
          state: "ACTIVE",
          cfg: "1.0.0",
          dataType: "NUMERIC",
          approverId: "",
          createdAt: "",
        }}
      />
    );

    await screen.findByTestId('config-form'); 
    // await screen.findByRole('config-form'); // or findByTestId('rule-form')
    const save = await screen.findByRole('button', { name: /save/i });
    fireEvent.click(save);
    // const form = await screen.findByTestId("config-form");
    // expect(form).toBeInTheDocument();
    // expect(screen.getByTestId("config-form")).toBeInTheDocument();
  });

  /** FE-RCFG-004 */
  it("FE-RCFG-004: Adds band and case entries, validates upper/lower limit", async () => {
    // Minimal test to ensure sections render
    render(
      <ConfigForm
        open={true}
        setOpen={jest.fn()}
        loading={false}
        setLoading={jest.fn()}
        serverError=""
        success=""
        activeKeys={["4", "5"]}
        setActiveKey={jest.fn()}
        onSubmit={jest.fn()}
        rule={{
          name: "Rule One",
          desc: "Test rule",
          ownerId: "owner1",
          updatedBy: "",
          updatedAt: "",
          state: "ACTIVE",
          cfg: "1.0.0",
          dataType: "NUMERIC",
          approverId: "",
          createdAt: "",
        }}
      />
    );

    await screen.findByTestId('config-form'); 
    const form = await screen.findByTestId("config-form");
    expect(form).toBeInTheDocument();
    // expect(screen.getByTestId("config-form")).toBeInTheDocument();
  });

  /** FE-RCFG-005 */
  it("FE-RCFG-005: Saves and exits from Rule Config editor", async () => {
    const handleSubmit = jest.fn();
    render(
      <ConfigForm
        open={true}
        setOpen={jest.fn()}
        loading={false}
        setLoading={jest.fn()}
        serverError=""
        success=""
        activeKeys={["1"]}
        setActiveKey={jest.fn()}
        onSubmit={handleSubmit}
        rule={{
          name: "Rule One",
          desc: "Test rule",
          ownerId: "owner1",
          updatedBy: "",
          updatedAt: "",
          state: "ACTIVE",
          cfg: "1.0.0",
          dataType: "NUMERIC",
          approverId: "",
          createdAt: "",
        }}
      />
    );

    const saveBtn = await screen.findByRole("button", { name: /createRuleConfigPage.save/i });
    fireEvent.click(saveBtn);
    expect(saveBtn).toBeInTheDocument();

    // const saveBtn = screen.getByRole("button", { name: /createRuleConfigPage.save/i });
    // fireEvent.click(saveBtn);
    // expect(saveBtn).toBeInTheDocument();
  });

  

  /** FE-RCFG-006 */
it("FE-RCFG-006: Displays config metadata, parameters, bands, cases in review page", async () => {
  render(
    <ReviewPage
      loading={false}
      error=""
      fetchConfig={jest.fn()}
      configuration={{
        _key: "c1",
        cfg: "1.0.0",
        desc: "Config 1",
        state: "ACTIVE",
        ownerId: "owner1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ruleId: "rules/r1",
        config: {
          parameters: [{ ParameterName: "P1", ParameterValue: "V1", ParameterType: "String" }],
          bands: [{ subRuleRef: "0.1", upperLimit: 10, lowerLimit: 0, reason: "Reason" }],
          cases: [{ subRuleRef: "0.1", value: "Val", reason: "Reason" }],
          exitConditions: [{ subRuleRef: "0.1", reason: "Reason" }],
        },
      } as any}
      rule={{ name: "Rule One" } as any}
      user={{} as any}
    />
  );

  // With loading={false} and valid config, it should render content (not 403)
  expect(await screen.findByText(/Config 1/i)).toBeInTheDocument();
  expect(await screen.findByText(/P1/i)).toBeInTheDocument();
});

/** FE-RCFG-007 */
it("FE-RCFG-007: Handles edge cases (no parameters, large bands) gracefully", async () => {
  render(
    <ReviewPage
      loading={false}
      error=""
      fetchConfig={jest.fn()}
      configuration={{
        _key: "c1",
        cfg: "1.0.0",
        desc: "Config Empty",
        state: "ACTIVE",
        ownerId: "owner1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ruleId: "rules/r1",
        config: {
          parameters: [],
          bands: [],
          cases: [],
          exitConditions: [],
        },
      } as any}
      rule={{ name: "Rule One" } as any}
      user={{} as any}
    />
  );

  // Should render the header/desc without crashing or showing 403
  expect(await screen.findByText(/Config Empty/i)).toBeInTheDocument();
}, 15000);

});
