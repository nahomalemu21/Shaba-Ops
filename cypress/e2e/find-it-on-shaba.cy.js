const PREVIEW = '/?preview_theme_id=166887358684';

function openPreview() {
  cy.visit(PREVIEW);
  cy.get('[data-shaba-finder]', { timeout: 30000 }).should('exist');
  cy.window().its('ShabaFinder').should('exist');
}

function parsed(query) {
  return cy.window().then((win) => win.ShabaFinder.parseRequest(query));
}

function search(query) {
  cy.get('[data-shaba-finder] input[name="q"]').clear().type(query);
  cy.get('[data-shaba-finder]').submit();
  cy.location('pathname', { timeout: 30000 }).should('eq', '/search');
  cy.get('.shaba-exact-results', { timeout: 30000 }).should('exist');
  cy.get('.shaba-search-loader', { timeout: 30000 }).should('not.exist');
}

describe('Find It on Shaba — preview regression', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    openPreview();
  });

  it('parses core product intent and audience correctly', () => {
    parsed('pink kids shoes').then((result) => {
      expect(result.intent?.label).to.eq('shoes');
      expect(result.audience?.value).to.eq('kids');
      expect(result.color).to.eq('Pink');
    });

    parsed('black dress size M under 6000 birr').then((result) => {
      expect(result.intent?.label).to.eq('dresses');
      expect(result.color).to.eq('Black');
      expect(result.size).to.eq('M');
      expect(result.budget).to.eq('6000');
    });

    parsed('oversized black hoodie').then((result) => {
      expect(result.intent?.label).to.eq('hoodies');
      expect(result.color).to.eq('Black');
      expect(result.styles.map((style) => style.term)).to.include('oversized');
    });
  });

  it('handles common misspellings', () => {
    parsed('jeens').its('intent.label').should('eq', 'jeans');
    parsed('jaket').its('intent.label').should('eq', 'jackets');
  });

  it('understands Amharic / transliterated searches', () => {
    parsed('ጥቁር ጃኬት').then((result) => {
      expect(result.intent?.label).to.eq('jackets');
      expect(result.color).to.eq('Black');
    });

    parsed('tikur jaket').then((result) => {
      expect(result.intent?.label).to.eq('jackets');
      expect(result.color).to.eq('Black');
    });
  });

  it('keeps product type + audience + color together in live results', () => {
    search('pink kids shoes');
    cy.get('.shaba-exact-grid .shaba-exact-card').should('have.length.greaterThan', 0);
    cy.get('.shaba-exact-grid .shaba-exact-card').each(($card) => {
      const chips = $card.find('.shaba-exact-card__matches').text().toLowerCase();
      expect(chips).to.contain('shoes');
      expect(chips).to.contain('kids');
      expect(chips).to.contain('pink');
    });
  });

  it('keeps jeans intent dominant', () => {
    search('jeans');
    cy.get('.shaba-exact-grid .shaba-exact-card').should('have.length.greaterThan', 0);
    cy.get('.shaba-exact-grid .shaba-exact-card').each(($card) => {
      expect($card.find('.shaba-exact-card__matches').text().toLowerCase()).to.contain('jeans');
    });
  });

  it('shows the custom loading state during catalog search', () => {
    cy.get('[data-shaba-finder] input[name="q"]').clear().type('black dress size M under 6000 birr');
    cy.get('[data-shaba-finder]').submit();
    cy.location('pathname', { timeout: 30000 }).should('eq', '/search');
    cy.get('.shaba-exact-results', { timeout: 30000 }).should('exist');
    cy.get('.shaba-exact-results__header').should('contain.text', 'black dress size M under 6000 birr');
    cy.get('.shaba-search-loader', { timeout: 30000 }).should('not.exist');
  });
});
