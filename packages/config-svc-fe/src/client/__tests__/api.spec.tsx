import axios from "axios";

jest.mock("axios", () => {
  return {
    create: jest.fn(), // mock create method
  };
});

describe("Axios instance interceptors", () => {
  const MODULE_PATH = "../api"; // ← your file is src/client/api.ts, so this is correct from src/client/__tests__/

  let requestUse: jest.Mock;
  let responseUse: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // 🔧 Stable in-memory localStorage mock
    const store: Record<string, string> = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => {
          store[k] = String(v);
        },
        removeItem: (k: string) => {
          delete store[k];
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k]);
        },
      },
      configurable: true,
    });
    window.localStorage.clear();

    requestUse = jest.fn();
    responseUse = jest.fn();

    // Tell our mock create to return an object with interceptors
    (axios.create as jest.Mock).mockReturnValue({
      interceptors: {
        request: { use: requestUse },
        response: { use: responseUse },
      },
    });
  });

  function importModuleAfterMocks() {
    // Ensure module loads after mocks
    jest.isolateModules(() => {
      require(MODULE_PATH);
    });
  }

  it("EDGE-007: should add Authorization header if token exists", () => {
    window.localStorage.setItem("token", "mock-token");
    window.localStorage.setItem("config_svc_username", "mock-user");

    importModuleAfterMocks();

    expect(requestUse).toHaveBeenCalledTimes(1);
    const onRequest = requestUse.mock.calls[0][0];

    const cfg = onRequest({ headers: {} });
    expect(cfg.headers.Authorization).toBe("Bearer mock-token");
  });

  it("EDGE-007: should not add Authorization header if token does not exist", () => {
    importModuleAfterMocks();

    expect(requestUse).toHaveBeenCalledTimes(1);
    const onRequest = requestUse.mock.calls[0][0];

    const cfg = onRequest({ headers: {} });
    expect(cfg.headers.Authorization).toBeUndefined();
  });

  it("EDGE-007: should pass response through unchanged", () => {
    importModuleAfterMocks();

    expect(responseUse).toHaveBeenCalledTimes(1);
    const onFulfilled = responseUse.mock.calls[0][0];

    const resp = { data: "ok" };
    expect(onFulfilled(resp)).toBe(resp);
  });

  it("EDGE-007: should reject on response error", async () => {
    importModuleAfterMocks();

    expect(responseUse).toHaveBeenCalledTimes(1);
    const onRejected = responseUse.mock.calls[0][1];

    const err = new Error("boom");
    await expect(onRejected(err)).rejects.toThrow("boom");
  });
});
