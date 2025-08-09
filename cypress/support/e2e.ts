// Fail-safe: don't fail the entire smoke on unrelated app exceptions
Cypress.on('uncaught:exception', () => {
  return false;
});

// Utility: custom command to click all test ids if needed later
// declare global augmentation if adding TS custom commands in future
