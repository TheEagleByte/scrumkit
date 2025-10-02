describe("Dropdown Descriptions", () => {
  beforeEach(() => {
    cy.login();
  });

  it("should show description text on hover in user dropdown", () => {
    cy.visit("/dashboard");

    // Open user dropdown
    cy.get('[data-slot="dropdown-menu-trigger"]').first().click();

    // Verify Profile menu item is visible
    cy.contains("Profile").should("be.visible");

    // Hover over Profile menu item
    cy.contains("Profile").parent().trigger("mouseover");

    // Description should be visible
    cy.contains("View and edit profile").should("be.visible");

    // Verify description has proper styling and is not transparent
    cy.contains("View and edit profile")
      .should("have.css", "color")
      .and("not.match", /rgba?\(.*,\s*0\)/); // Not transparent
  });

  it("should show description text for Settings menu item", () => {
    cy.visit("/dashboard");

    // Open user dropdown
    cy.get('[data-slot="dropdown-menu-trigger"]').first().click();

    // Hover over Settings menu item
    cy.contains("Settings").parent().trigger("mouseover");

    // Description should be visible
    cy.contains("Manage preferences").should("be.visible");

    // Verify description has proper color
    cy.contains("Manage preferences")
      .should("have.css", "color")
      .and("not.match", /rgba?\(.*,\s*0\)/);
  });

  it("should show description in estimation sequence dropdown", () => {
    cy.visit("/poker/new");

    // Open estimation sequence dropdown
    cy.get('[data-slot="select-trigger"]').first().click();

    // Wait for dropdown to be visible
    cy.get('[data-slot="select-content"]').should("be.visible");

    // Hover over Fibonacci option
    cy.contains("Fibonacci").parent().trigger("mouseover");

    // Description should be visible (showing the sequence values)
    cy.contains("1, 2, 3, 5, 8").should("be.visible")
      .and("have.css", "color")
      .and("not.match", /rgba?\(.*,\s*0\)/); // Not transparent
  });

  it("should show description for T-shirt sizes option", () => {
    cy.visit("/poker/new");

    // Open estimation sequence dropdown
    cy.get('[data-slot="select-trigger"]').first().click();

    // Wait for dropdown to be visible
    cy.get('[data-slot="select-content"]').should("be.visible");

    // Hover over T-shirt sizes option
    cy.contains("T-shirt Sizes").parent().trigger("mouseover");

    // Description should be visible
    cy.contains("XS, S, M, L, XL").should("be.visible")
      .and("have.css", "color")
      .and("not.match", /rgba?\(.*,\s*0\)/);
  });

  it("should show description for Custom Sequence option", () => {
    cy.visit("/poker/new");

    // Open estimation sequence dropdown
    cy.get('[data-slot="select-trigger"]').first().click();

    // Wait for dropdown to be visible
    cy.get('[data-slot="select-content"]').should("be.visible");

    // Hover over Custom Sequence option
    cy.contains("Custom Sequence").parent().trigger("mouseover");

    // Description should be visible
    cy.contains("Create your own estimation values").should("be.visible")
      .and("have.css", "color")
      .and("not.match", /rgba?\(.*,\s*0\)/);
  });

  it("should maintain visibility when navigating with keyboard", () => {
    cy.visit("/poker/new");

    // Open estimation sequence dropdown with keyboard
    cy.get('[data-slot="select-trigger"]').first().focus();
    cy.get('[data-slot="select-trigger"]').first().type("{enter}");

    // Navigate down with arrow key
    cy.get("body").type("{downarrow}");

    // Description should be visible for the focused item
    cy.get('[data-slot="select-content"]').within(() => {
      cy.get(".text-muted-foreground").should("be.visible");
    });
  });

  it("should have sufficient contrast on hover in light mode", () => {
    cy.visit("/poker/new");

    // Ensure we're in light mode (default)
    cy.get("html").should("not.have.class", "dark");

    // Open estimation sequence dropdown
    cy.get('[data-slot="select-trigger"]').first().click();

    // Hover over an option
    cy.contains("Fibonacci").parent().trigger("mouseover");

    // Check that description is visible and has color
    cy.contains("1, 2, 3, 5, 8")
      .should("be.visible")
      .and("have.css", "color")
      .and("not.equal", "rgba(0, 0, 0, 0)");
  });
});
