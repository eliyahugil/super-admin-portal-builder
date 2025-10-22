describe('AllForYou Smoke Tests - מקיף', () => {
  const routes = [
    '/',
    '/dashboard',
    '/auth',
    '/auth/login',
    '/admin',
    '/admin/businesses',
    '/admin/modules',
    '/admin/system-preview',
    '/admin/system-settings',
    '/admin/integrations',
    '/production',
    '/production/products',
    '/production/batches',
    '/production/raw-receipts',
    '/production/materials',
    '/production/quality',
    '/production/cleaning',
    '/production/equipment',
    '/fridges',
    '/modules/employees',
    '/modules/employees/requests',
    '/modules/employees/employee-requests',
    '/modules/settings/profile',
    '/modules/shifts/schedule',
  ];

  routes.forEach((path) => {
    it(`loads ${path} page`, () => {
      cy.visit(path, { failOnStatusCode: false });
      cy.get('body').should('exist');

      // Click all visible, enabled elements with data-testid (primary actions convention)
      cy.get('body').then(($body) => {
        const hasTestIds = $body.find('[data-testid]').length > 0;
        if (hasTestIds) {
          const clicked = new Set<string>();
          cy.get('[data-testid]').each(($el) => {
            const id = $el.attr('data-testid');
            if (!id || clicked.has(id)) return;
            clicked.add(id);
            if ($el.is(':visible') && !$el.is(':disabled')) {
              cy.wrap($el).click({ force: true });
            }
          });
        } else {
          // Log for visibility when pages are not yet instrumented
          cy.log('No [data-testid] elements found on this route');
        }
      });
    });
  });
});
