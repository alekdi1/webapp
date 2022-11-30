const REGX_EMAIL = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/
const REGX_PHONE = /^[0](\d{9})$/g
const REGX_HOME_PHONE = /^\d{9}$/g
const REGX_ZIPCODE = /^\d{5}$/g
const REGX_COODS = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g
const REGX_CID = /^[0-9]+$/
const REGX_PASSWORD = /^(?=.*?[A-Z][a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
const REGX_TAXID = /(^\d{10}$|^\d{13}$)/g
const REGX_T1CARD = /^\d{16}$/g
const REGX_LETTER = /^[A-Za-z0-9]+$/
const REGX_PASSWORD_LETTER = /^[A-Za-z0-9#?!@$%^&*-\]]+$/

function validate(key: string, value: any) {
    try {
        if (!value) {
            throw new Error("Value invalid")
        }

        let strValue = value

        if (typeof value !== "string") {
            strValue = String(value)
        }

        switch (key) {
            case "phone": return strValue.match(REGX_PHONE) != null
            case "phoneExtra": return strValue.match(REGX_PHONE) != null || strValue.match(REGX_HOME_PHONE) != null
            case "email": return REGX_EMAIL.test(strValue)
            case "coods": return strValue.match(REGX_COODS) != null // REGX_COODS.test(strValue)
            case "zipcode": return strValue.match(REGX_ZIPCODE) != null
            case "password": return strValue.match(REGX_PASSWORD) == null
            case "taxId": return strValue.match(REGX_TAXID) != null
            case "t1card": return strValue.match(REGX_T1CARD) != null
            case "letter": return strValue.match(REGX_LETTER) != null
            case "passwordLetter": return strValue.match(REGX_PASSWORD_LETTER) != null
        }
    } catch (e) {
        return false
    }
    return false
}

export const validatePhone = (phone: any) => validate("phone", phone)
export const validatePhoneExtra = (phone: any) => validate("phoneExtra", phone)
export const validateEmail = (email: any) => validate("email", email)
export const validCoods = (coods: any) => validate("coods", coods)
export const validPassword = (password: any) => validate("password", password)
export const validTaxId = (id: any) => validate("taxId", id)
export const validateT1Card = (t1card: any) => validate("t1card", t1card)
export const validateCitizenNumber = (cid: string) => {
    const LENGTH = 13
    /**
     * Ref: https://www.memo8.com/วิธีการคำนวณเพื่อตรวจส/
     */
    try {
        if (cid.length !== LENGTH) {
            return false
        }

        if (cid.match(REGX_CID) === null) {
            return false
        }

        let sum = 0
        for (let index = 0; index < 12; index++) {
            sum += (Number(cid.charAt(index)) * (LENGTH - index))
        }

        return Number(cid.charAt(12)) === ((11 - (sum % 11)) % 10)

    } catch (e) {
        return false
    }
}
export const validateZipCode = (zipcode: string) => validate("zipcode", zipcode)
export const validateLetter = (word: string) => validate("letter", word)
export const validatePasswordLetter = (password: string) => validate("passwordLetter", password)
export const validateUsername = (username: string) => (new RegExp(/^[A-Za-z0-9@.\-_\]]+$/)).test(username)
