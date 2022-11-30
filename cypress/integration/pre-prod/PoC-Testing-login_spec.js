describe('PoC flow testing', () => {
    it('example testing flow', () => {
        cy.visit('/')

        cy.get('div.splash-screen').click()

        // Type in the username and password
        cy.get('input#username').type('1000002')
        cy.get('input#password').type('1234')

        // Click the login button
        cy.get('div.login-btn-container button').click()

        cy.get('div[name=continueOnBoard]').click()
        cy.get('div[name=continueOnBoard]').click()
        cy.get('div[name=continueOnBoard]').click()
        cy.get('button.finish-button').click()

        cy.get("body").then($body => {
            if ($body.find("div.close-annoucement-btn-container button").length > 0) {   
                //evaluates as true
                cy.get('div.close-annoucement-btn-container button').click()
            }
        });

        cy.wait(3000)


        cy.contains('ข้อมูลการเช่า').click()
        cy.wait(3000)
        cy.contains('รีวอร์ดลูกค้า').click()
        cy.wait(3000)
        cy.contains('ส่งยอดขาย').click()
        cy.wait(3000)
        cy.contains('แจ้งซ่อม').click()
        cy.wait(3000)
        cy.contains('จัดการผู้ใช้งาน').click()
    })
})
