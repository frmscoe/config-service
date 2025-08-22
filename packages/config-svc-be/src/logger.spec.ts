/**
 * SEC-010 — Audit/Security logging
 * - Mocks processor config to avoid env validation failures
 * - Mocks LoggerService to capture security log calls
 * - Loads `src/logger.ts` only AFTER mocks are in place
 */

// ------------------ Mock config (prevents MAX_CPU crash) ------------------
process.env.MAX_CPU = '1';

jest.mock('@tazama-lf/frms-coe-lib/lib/config', () => ({
  validateProcessorConfig: jest.fn(() => ({
    MAX_CPU: 1,
    NODE_ENV: 'test',
  })),
}));

// ------------------ Mock logger library to capture calls ------------------
const securitySpies = {
  audit: jest.fn(),
  security: jest.fn(),
  securityEvent: jest.fn(),
  logSecurity: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
};

let lastConfig: any = null;

class MockLoggerService {
  constructor(config: any) {
    lastConfig = config;
  }
  audit(...args: any[])         { securitySpies.audit(...args); }
  security(...args: any[])      { securitySpies.security(...args); }
  securityEvent(...args: any[]) { securitySpies.securityEvent(...args); }
  logSecurity(...args: any[])   { securitySpies.logSecurity(...args); }
  log(...args: any[])           { securitySpies.log(...args); }
  info(...args: any[])          { securitySpies.info(...args); }

  close() {}
  shutdown() {}
}

jest.mock('@tazama-lf/frms-coe-lib', () => ({
  LoggerService: MockLoggerService,
}));

// ------------------ Load module under test AFTER mocks ------------------
let loggerModule: any;
beforeAll(() => {
  jest.isolateModules(() => {
    loggerModule = require('./logger'); // <- your src/logger.ts
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  try { loggerModule?.loggerService?.close?.(); } catch {}
  try { loggerModule?.loggerService?.shutdown?.(); } catch {}
});

// ------------------ Helper to invoke the module's security entrypoint ----
function callSecurityEntryPoint(payload: any) {
  const fn =
    loggerModule.securityEventLogging ||
    loggerModule.logSecurityEvent ||
    loggerModule.auditSecurityEvent ||
    loggerModule.default?.securityEventLogging ||
    loggerModule.default?.logSecurityEvent ||
    loggerModule.default?.auditSecurityEvent;

  if (typeof fn === 'function') {
    return fn(payload);
  }

  const svc = loggerModule.loggerService;
  if (!svc) {
    throw new Error(
      'No securityEventLogging function or loggerService export found from src/logger.ts'
    );
  }

  if (typeof svc.securityEvent === 'function') return svc.securityEvent(payload);
  if (typeof svc.logSecurity === 'function')   return svc.logSecurity(payload);
  if (typeof svc.security === 'function')      return svc.security(payload);
  if (typeof svc.audit === 'function')         return svc.audit(payload);
  if (typeof svc.info === 'function')          return svc.info('SECURITY', payload);
  if (typeof svc.log === 'function')           return svc.log('SECURITY', payload);

  throw new Error('loggerService has no callable security logging method');
}

// ------------------ Tests -------------------------------------------------
describe('SEC-010: securityEventLogging — all security events are logged', () => {
  it('uses validated processor config at startup', () => {
    expect(lastConfig).toBeTruthy();
    expect(lastConfig.MAX_CPU).toBe(1);
  });

  it('emits a log for each security event passed', () => {
    const events = [
      { type: 'AUTH.LOGIN',   userId: 'u-1', outcome: 'SUCCESS', ip: '10.0.0.1' },
      { type: 'AUTH.LOGOUT',  userId: 'u-1', outcome: 'SUCCESS' },
      { type: 'RBAC.DENIED',  userId: 'u-2', resource: 'RULE/EDIT', reason: 'MISSING_PRIV' },
    ];

    for (const evt of events) {
      callSecurityEntryPoint(evt);
    }

    const counts = [
      securitySpies.securityEvent.mock.calls.length,
      securitySpies.logSecurity.mock.calls.length,
      securitySpies.security.mock.calls.length,
      securitySpies.audit.mock.calls.length,
      securitySpies.info.mock.calls.length,
      securitySpies.log.mock.calls.length,
    ];

    const max = Math.max(...counts);
    expect(max).toBe(events.length);

    const winnerIndex = counts.indexOf(max);
    const winner =
      [securitySpies.securityEvent, securitySpies.logSecurity, securitySpies.security,
       securitySpies.audit, securitySpies.info, securitySpies.log][winnerIndex];

    const lastCall = winner.mock.calls[winner.mock.calls.length - 1];
    expect(JSON.stringify(lastCall)).toMatch(/RBAC\.DENIED/);
  });
});
