// Fail-safe: don't fail the entire smoke on unrelated app exceptions
Cypress.on('uncaught:exception', () => {
  return false;
});

// Utility: custom command to click all test ids if needed later
// declare global augmentation if adding TS custom commands in future

// Fail spec on any console.error during tests
let __consoleErrors: string[] = [];
Cypress.on('window:before:load', (win) => {
  const originalError = win.console.error;
  win.console.error = (...args: any[]) => {
    __consoleErrors.push(args.map((a) => String(a)).join(' '));
    originalError.apply(win.console, args as any);
  };
});

beforeEach(() => {
  __consoleErrors = [];
});

afterEach(() => {
  if (__consoleErrors.length > 0) {
    throw new Error(`console.error detected:\n${__consoleErrors.join('\n')}`);
  }
});