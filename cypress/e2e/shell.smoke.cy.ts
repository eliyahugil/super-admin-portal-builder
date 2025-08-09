/// <reference types="cypress" />

describe('Shell Smoke: Topbar / Sidebar / Drawer', () => {
  beforeEach(() => {
    // Optional: implement real login in support if needed
    // @ts-ignore - defined in support/e2e.ts
    cy.loginAs && cy.loginAs('business_admin');
  });

  it('Topbar renders and has menu button on mobile', () => {
    cy.viewport(360, 720); // מובייל
    cy.visit('/business/test-business/dashboard');
    cy.get('[data-testid="topbar"]').should('exist');
    cy.get('[data-testid="topbar-menu"]').should('exist').click();
    cy.get('[data-testid="drawer"]').should('exist');
    cy.get('[data-testid="drawer-overlay"]').click(); // סגירה
    cy.get('[data-testid="drawer"]').should('have.class', 'translate-x-full');
  });

  it('Sidebar collapsed toggles on tablet/desktop', () => {
    cy.viewport(1024, 800); // טאבלט/לפטופ
    cy.visit('/business/test-business/dashboard');
    cy.get('[data-testid="sidebar"]').should('exist');
    cy.get('[data-testid="sidebar-collapse"]').click();
    cy.get('[data-testid="sidebar"]').should('have.class', 'w-[64px]');
    // tooltip built-in: לא נבדוק ויזואלית, רק קיום פריט
    cy.get('[data-testid="nav-employees"]').should('exist');
  });

  it('Navigate via Sidebar changes route and highlights active item', () => {
    cy.viewport(1280, 900); // דסקטופ
    cy.visit('/business/test-business/dashboard');
    cy.get('[data-testid="nav-employees"]').click();
    cy.location('pathname').should(($p) => {
      expect($p).to.match(/\/business\/test-business\/modules\/employees/);
    });
    cy.get('[data-testid="nav-employees"]').should('have.attr', 'aria-current', 'page');
  });
});
