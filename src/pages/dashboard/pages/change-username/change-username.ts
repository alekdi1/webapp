import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { CPMForm } from "@/pages/dashboard/models"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"
import Name from "../page-names"
import { AuthService } from "@/services"

const t = (k: string) => LanguageUtils.i18n.t("pages.user_account." + k).toString()
const SUCCESS_STATUS = "success"

@Component({
    name: Name.change_username
})
export default class ChangeUsernamePage extends Base {

    private form = new UsernameForm()
    private loading = false
    private acknowledge = {
        subtitle: "",
        title: "",
    }
    private isChangePasswordSuccess = false;

    private get text() {

        return {
            change_username: t("change_username"),
            label_input_new_username: t("label_input_new_username"),
            new_username: t("new_username"),
            confirm_new_username: t("confirm_new_username"),
            old_username: t("old_username"),
            input_old_username: t("input_old_username")
        }
    }

    private async login() {
        await AuthService.logout()
        this.$router.replace({
            name: ROUTER_NAMES.login
        })
    }

    private async confirmChangeUsername() {
        this.form.validated = true
        if (this.form.allValidated) {
            this.loading = true
            try {
                const rs = await AuthService.changeCredential("username", this.form.oldUsername.value, this.form.newUsername.value)
                console.log("Change credential result ", rs)
                this.form = new UsernameForm()
                this.acknowledge.subtitle = rs.data
                this.acknowledge.title = "SUCCESSFUL"
                this.isChangePasswordSuccess = true

                // this.$router.replace({
                //     path: this.$route.path,
                //     query: {
                //         status: SUCCESS_STATUS,
                //         ts: new Date().getTime().toString()
                //     }
                // })
            } catch (e) {
                // DialogUtils.showErrorDialog({ text: e.message || e})
                DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ชื่อผู้ใช้งานไม่ถูกต้อง กรุณาระบุใหม่อีกครั้ง", "Username is invalid. Please enter again.") })
            }
            this.loading = false
        }
    }

    private get showChangeSuccess() {
        return this.$route.query.status === SUCCESS_STATUS
    }

    isLetter(event: any) {
        const char = String.fromCharCode(event.keyCode); // Get the character
        if (/^[A-Za-z0-9]|[@._-]+$/.test(char)) return true;
        // Match with regex
        else event.preventDefault(); // If not match, don't add to input text
    }
}

class UsernameForm {
    validated = false
    oldUsername = new CPMForm.FormValue()
    newUsername = new CPMForm.FormValue()
    configmNewUsername = new CPMForm.FormValue()

    get errors() {
        const usernameNotMatch = LanguageUtils.lang("ชื่อผู้ใช้กับยืนยันชื่อผู้ใช้ไม่ตรงกัน", "The username and confirmation username do not match")
        return {
            oldUsername: (v => {
                if (!v) return t("input_old_username")
                return null
            })(this.oldUsername.value),

            newUsername: (v => {
                if (!v) return t("label_input_new_username")
                if (!ValidateUtils.validateUsername(v)) return LanguageUtils.lang("ชื่อผู้ใช้ไม่ถูกต้อง", "Username invalid")
                if (v !== this.configmNewUsername.value) return usernameNotMatch
                return null
            })(this.newUsername.value),

            configmNewUsername: (v => {
                if (!v) return t("input_confirm_new_username")
                if (!ValidateUtils.validateUsername(v)) return LanguageUtils.lang("ยืนยันชื่อผู้ใช้ไม่ถูกต้อง", "Confirm username invalid")
                if (v !== this.newUsername.value) return usernameNotMatch
                return null
            })(this.configmNewUsername.value)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    get errorMessage() {
        const { errors, validated } = this
        if (!validated) return null
        return errors.oldUsername || errors.newUsername || errors.configmNewUsername
    }
}
