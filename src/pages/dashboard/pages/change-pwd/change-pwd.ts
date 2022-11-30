import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { CPMForm } from "@/pages/dashboard/models"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"
const t = (k: string) => LanguageUtils.i18n.t("pages.user_account." + k).toString()
import Name from "../page-names"
import { AuthService } from "@/services"

const SUCCESS_STATUS = "success"

@Component({
    name: Name.change_username
})
export default class ChangePwdPage extends Base {

    private form = new PasswordForm()
    private loading = false

    private acknowledge = {
        subtitle: "",
        title: "",

    }

    private get text() {
        return {
            title_change_pwd: t("title_change_pwd"),
            label_input_new_pwd: t("label_input_new_pwd"),
            new_pwd: t("new_pwd"),
            confirm_new_pwd: t("confirm_new_pwd"),
            pwd_hint: this.$t("pwd_hint").toString(),
            input_old_pwd: t("input_old_pwd"),
            old_pwd: t("old_pwd")
        }
    }

    private async login() {
        await AuthService.logout()
        this.$router.replace({
            name: ROUTER_NAMES.login
        })
    }

    private async confirmChangePwd() {
        this.form.validated = true
        if (this.form.allValidated) {
            this.loading = true
            try {
                const rs = await AuthService.changeCredential("password", this.form.oldPassword.value, this.form.password.value)
                console.log("Change credential result ", rs)
                this.form = new PasswordForm()
                this.acknowledge.subtitle = rs.data
                this.acknowledge.title = "SUCCESSFUL"
                this.$router.replace({
                    path: this.$route.path,
                    query: {
                        status: SUCCESS_STATUS,
                        ts: new Date().getTime().toString()
                    }
                })
            } catch (e) {
                console.log(e.message || e)
                DialogUtils.showErrorDialog({ text: e.message || e})
            }
            this.loading = false
        }
    }

    private get showChangeSuccess() {
        return this.$route.query.status === SUCCESS_STATUS
    }
}

class PasswordForm {
    validated = false
    oldPassword = new CPMForm.FormPassword()
    password = new CPMForm.FormPassword()
    confirmPassword = new CPMForm.FormPassword()

    get errors() {
        const errPwdLength = LanguageUtils.lang(
            "รหัสผ่านต้องมีอย่างน้อย 8 ตัว",
            "Password should be at least 8 characters."
        )

        const pwdNotMatch = LanguageUtils.lang("รหัสผ่านกับยืนยันรหัสผ่านไม่ตรงกัน", "The password and confirmation password do not match")

        return {
            oldPassword: (v => {
                if (!v) return t("input_old_pwd")
                return null
            })(this.oldPassword.value),

            password: (v => {
                if (!v) return LanguageUtils.lang("กรุณากรอกรหัสผ่านใหม่", "Please input new password")
                if (v.length < 8) return errPwdLength
                if (ValidateUtils.validPassword(v) || !ValidateUtils.validatePasswordLetter(v)) return LanguageUtils.lang("รหัสผ่านไม่ถูกต้อง", "Password invalid")
                return null
            })(this.password.value),

            confirmPassword: (v => {
                if (!v) return LanguageUtils.lang("กรุณากรอกยืนยันรหัสผ่านใหม่", "Please input confirm new password")
                if (v.length < 8) return errPwdLength
                if (ValidateUtils.validPassword(v) || !ValidateUtils.validatePasswordLetter(v)) return LanguageUtils.lang("ยืนยันรหัสผ่านไม่ถูกต้อง", "Confirm password invalid")
                if (v !== this.password.value) return pwdNotMatch
                return null
            })(this.confirmPassword.value)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    get errorMessage() {
        const { errors, validated } = this
        if (!validated) return null
        return errors.oldPassword || errors.password || errors.confirmPassword
    }
}
