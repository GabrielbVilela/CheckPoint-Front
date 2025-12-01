describe('login testes', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081/login')
    cy.get('#root input[placeholder="Digite sua matricula"]').type('asd!@#$');
    cy.get('#root input[placeholder="Digite sua matricula"]').should('have.value', '');
  });
  it('Login Incorreto', () => {
    cy.get('#root input[placeholder="Digite sua matricula"]').type('123');
    cy.get('#root input[placeholder="Digite sua senha"]').type('senhaerrada');
    cy.get('#root div.r-userSelect-lrvibr').click();

    cy.get('#root div.r-color-nlhonk').should('contain', 'Matricula ou senha incorreta.');
    cy.url().should('eq', "http://localhost:8081/login");
  });
  it('Login Aluno Correto', () => {
    cy.get('#root input[placeholder="Digite sua matricula"]').type('1001');
    cy.get('#root input[placeholder="Digite sua senha"]').type('senha123');
    cy.get('#root div.r-color-jwli3a').click();

    cy.get('#root div.r-fontSize-yy2aun').should('contain', 'Ponto do aluno');
    cy.url().should('eq', "http://localhost:8081/");
  }); 
  it('Login Professor Correto', () => {
    cy.get('#root input[placeholder="Digite sua matricula"]').type('222');
    cy.get('#root input[placeholder="Digite sua senha"]').type('senha123');
    cy.get('#root div.r-userSelect-lrvibr').click();

    cy.get('#root div.r-fontSize-yy2aun').should('contain', 'Painel do Professor');
    cy.url().should('eq', "http://localhost:8081/professor");
  });
  it('Login Coordenador Correto', () => {
    cy.get('#root input[placeholder="Digite sua matricula"]').type('111!@#asd');
    cy.get('#root input[placeholder="Digite sua senha"]').type('senha123');
    cy.get('#root div.r-userSelect-lrvibr').click();

    cy.get('#root div.r-fontSize-yy2aun').should('contain', 'Painel da Coordenação');
    cy.url().should('eq', "http://localhost:8081/coordenador");
  });
  it('Logout', () => {
    cy.get('#root input[placeholder="Digite sua matricula"]').type('1001');
    cy.get('#root input[placeholder="Digite sua senha"]').type('senha123');
    cy.get('#root div.r-color-jwli3a').click();
    
    cy.url().should('eq', "http://localhost:8081/").wait(200);

    cy.get('div').contains('Sair').click().wait(200);
    cy.get('.r-color-jwli3a').contains('Sair').click();
    cy.url().should('eq', "http://localhost:8081/login");
  })
})