describe('Smoke tests - core routes and primary actions', () => {
  const routes = [
    '/',
    '/auth',
    '/modules/employees',
    '/modules/employees/requests',
    '/modules/employees/employee-requests',
    '/modules/settings/profile',
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
