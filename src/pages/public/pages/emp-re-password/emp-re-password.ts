import { ContactDetail } from "@/models/contract"
import { ROUTER_NAMES } from "@/router"
import { UserServices, AuthService } from "@/services"
import { ValidateUtils, DialogUtils, LanguageUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "../../public-base"

@Component
export default class EmployeeRePasswordPage extends Base {
    private form = new PasswordForm()
    private loading = false
    private tokenIsBroken = false;

    private async mounted() {
        const {  token } = this
        try{
            const checkIsvalideToken = await AuthService.checkIsvalideToken('', token, "new_user")
            if(checkIsvalideToken.data == true){
                this.tokenIsBroken = false;
            }
        } catch(e) {
            console.log(e)
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang(e.message, e.message) })
            this.tokenIsBroken = true;
        }
        await this.retriveUserDetail()
    }

    private get token() {
        return String(this.$route.query.token || "")
    }

    private async retriveUserDetail() {
        this.loading = true
        try {
            const detail = await UserServices.retriveUserDetail(this.token)
            if (detail.isActive == 0) {
                this.tokenIsBroken = true;
                this.form.submitted = true;
                DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่พบข้อมูลพนักงาน กรุณาดำเนินการใหม่อีกครั้ง", "Not found employee data. Please re-produce the process again.") })
                return
            }
            this.form.firstname = detail.firstname ? detail.firstname : ""
            this.form.lastname = detail.lastname ? detail.lastname : ""
            this.form.email = detail.email ? detail.email : ""
            this.form.phone = detail.phone ? detail.phone : ""
        } catch (e) {
            this.tokenIsBroken = true;
            this.form.submitted = true;
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่พบข้อมูลพนักงาน กรุณาดำเนินการใหม่อีกครั้ง", "Not found employee data. Please re-produce the process again.") })
        }
        this.loading = false
    }

    private async submit() {
        this.form.validated = true
        if (this.form.allValidated) {
            this.loading = true

            try {
                await UserServices.employeeRegister(this.token, {
                    firstname: this.form.firstname,
                    lastname: this.form.lastname,
                    email: this.form.email,
                    phone: this.form.phone,
                    username: this.form.username,
                    password: this.form.password
                })
                this.$router.replace({
                    name: ROUTER_NAMES.login
                })
            } catch (e) {
                const { lang } = LanguageUtils
                DialogUtils.showErrorDialog({ title: lang("ขออภัย", "Sorry"), text: lang("ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว กรุณาเปลี่ยนเป็นชื่อผู้ใช้อื่น", String(e)) })
            }
            this.loading = false
        }
    }

    isLetter(event: KeyboardEvent) {
        const char = String.fromCharCode(event.keyCode); // Get the character
        if (/^[A-Za-z0-9]|[@._-]+$/.test(char)) return true;
        // Match with regex
        else event.preventDefault(); // If not match, don't add to input text
    }
}

class PasswordForm {
    firstname = ""
    lastname = ""
    email = ""
    phone = ""
    username = ""
    password = ""
    confirmPassword = ""
    validated = false
    submitted = false

    get emptyContact() {
        return this.email.length === 0 && this.phone.length === 0
    }

    get errors() {
        return {
            emptyName: ((n) => {
                if (n.length === 0) return "กรุณาระบุชื่อ"
                return null
            })(this.firstname),

            emptyLastname: ((n) => {
                if (n.length === 0) return "กรุณาระบุนามสกุล"
                return null
            })(this.lastname),

            invalidEmail: ((m) => {
                if (this.emptyContact) return "กรุณาระบุอีเมลหรือเบอร์โทรศัพท์"
                if (m.length !== 0 && !ValidateUtils.validateEmail(m)) return "กรุณาระบุอีเมลให้ถูกต้อง"
                return null
            })(this.email),

            invalidPhone: ((m) => {
                if (this.emptyContact) return "กรุณาระบุอีเมลหรือเบอร์โทรศัพท์"
                if (m.length !== 0 && !ValidateUtils.validatePhone(m)) return "กรุณาระบุเบอร์โทรศัพท์ให้ถูกต้อง"
                return null
            })(this.phone),

            username: ((u) => {
                if (!u) return "กรุณาระบุชื่อผู้ใช้"
                if (!ValidateUtils.validateUsername(u)) return LanguageUtils.lang("ชื่อผู้ใช้ไม่ถูกต้อง", "Username invalid")
                return null
            })(this.username),

            pLength: ((p) => {
                if (p.length < 8) return "รหัสผ่านไม่ถูกต้อง รหัสผ่านควรมีตัวอักษรอย่างน้อย 8 ตัวอักษร"
                return null
            })(this.password),

            character: ((p) => {
                if (ValidateUtils.validPassword(p) || !ValidateUtils.validatePasswordLetter(p)) return LanguageUtils.lang("รหัสผ่านไม่ถูกต้อง", "Password invalid")
                return null
            })(this.password),


            mismatch: ((p, c) => {
                if (p !== c) return "รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบ"
                return null
            })(this.password, this.confirmPassword)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    get submitDisabled() {
        return !this.validated ? false : !this.allValidated
    }
}
