<template>
    <cpn-auth-conrainer id="reset-password-page">
        <template slot="auth-content">
            <div class="d-flex w100 h100 align-center">
                <div class="w100">
                    <cpn-auth-company-text />

                    <form :id="'reset-password-form' + form.id">
                        <div class="d-flex flex-column align-center">
                            <span class="cpn-text-h6 font-weight-regular">{{ text.change_username }}</span>
                        </div>

                        <div class="form-group" :class="{'form-error': form.validated && !!form.errors.password}">
                            <div class="password-input my-3">
                                <input :id="'input-password-' + form.id" type="password" class="form-control"
                                    :placeholder="text.new_pwd" v-model="form.password" :disabled="loading || isTokenInvalide">
                            </div>

                            <div class="input-error-message mt-1" v-if="form.validated && form.errors.password">
                                {{ form.errors.password }}
                            </div>
                        </div>

                        <div class="form-group" :class="{'form-error': form.validated && !!form.errors.confirmPassword}">
                            <div class="password-input my-3">
                                <input :id="'input-confirm-password-' + form.id" type="password" class="form-control"
                                    :placeholder="text.confirm_new_pwd" v-model="form.confirmPassword" :disabled="loading || isTokenInvalide">
                            </div>

                            <div class="input-error-message mt-1" v-if="form.validated && form.errors.confirmPassword">
                                {{ form.errors.confirmPassword }}
                            </div>
                        </div>

                        <div class="pwd-hint mt-3">
                            <cpn-note-text>{{ text.pwd_hint }}</cpn-note-text>
                        </div>

                        <v-btn @click="submitReset" :disabled="loading || isTokenInvalide" class="mt-4" block rounded color="primary" :height="48">
                            <span class="cpn-text-body-1 text-uppercase">{{ text.confirm }}</span>
                        </v-btn>
                    </form>
                </div>
            </div>
        </template>
    </cpn-auth-conrainer>
</template>
<script lang="ts">
import { ROUTER_NAMES } from "@/router"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import { AuthService } from "@/services"
import Base from "./auth-base"

@Component
export default class AuthResetPassword extends Base {

    private loading = false
    private form = new ResetPasswordForm()
    private isTokenInvalide = false;

    private async mounted() {
       const { email, token } = this
       try{
           const checkIsvalideToken = await AuthService.checkIsvalideToken(email, token, "password")
           if(checkIsvalideToken.data == true){
               this.isTokenInvalide = false;
           }
       } catch(e) {
           console.log(e)
           DialogUtils.showErrorDialog({ text: LanguageUtils.lang(e.message, e.message) })
           this.isTokenInvalide = true;
       }
    }

    private get text() {
        const t = (k: string) => this.$t("pages.auth." + k).toString()
        return {
            new_pwd: t("new_pwd"),
            confirm_new_pwd: t("confirm_new_pwd"),
            confirm: this.$t("confirm"),
            password: this.$t("password"),
            lb_change_new_pws: t("lb_change_new_pws"),
            pwd_hint: t("pwd_hint")
        }
    }

    private async submitReset() {
        this.form.validated = true
        if (!this.form.allValidated) return
        this.loading = true
        try {
            const { email, token } = this
            await AuthService.submitResetAccount(email, token, "password", this.form.password)
            await this.showSuccessDialog()
            this.isTokenInvalide = false;
            this.$router.replace({ name: ROUTER_NAMES.login })
        } catch (e) {
            const dfMsg = e.message || e.message == "Token invalid" ?  LanguageUtils.lang("ไม่สามารถแก้ไขได้เนื่องจากลิงค์ไม่ถูกต้อง", "Can't edit because the link is invalid.") : LanguageUtils.lang("บางอย่างผิดพลาด", "Something wrong")
            if(e.message == "Token invalid"){
                this.isTokenInvalide = true;
                this.form.password = "";
                this.form.confirmPassword = "";
            }
            DialogUtils.showErrorDialog({ text: dfMsg })
        }
        this.loading = false
    }

    private get email() {
        return String(this.$route.query.email || "")
    }

    private get token() {
        return String(this.$route.query.token || "")
    }

    private showSuccessDialog() {
        return DialogUtils.showSuccessDialog({
            text: LanguageUtils.lang("ดำเนินการสร้างรหัสผ่านใหม่สำเร็จ", "Successfully created a new password."),
            timer: 3000
        })
    }
}

class ResetPasswordForm {
    id = Math.random().toString(24).replace("0.", "")
    password = ""
    confirmPassword = ""

    validated = false

    get errors() {
        const errPwdLength = LanguageUtils.lang(
            "รหัสผ่านต้องมีอย่างน้อย 8 ตัว",
            "Password should be at least 8 characters."
        )

        return {
            password: (v => {
                if (v.length == 0) return ""
                if (!v) return LanguageUtils.lang("กรุณากรอกรหัสผ่าน", "Please input password")
                if (v.length < 8) return errPwdLength
                if (ValidateUtils.validPassword(v) || !ValidateUtils.validatePasswordLetter(v)) return LanguageUtils.lang("รหัสผ่านไม่ถูกต้อง", "Password invalid")
                return null
            })(this.password),
            confirmPassword: (v => {
                if (v.length == 0) return ""
                if (!v) return LanguageUtils.lang("กรุณากรอกยืนยันรหัสผ่าน", "Please input confirm password")
                if (v.length < 8) return errPwdLength
                if (ValidateUtils.validPassword(v) || !ValidateUtils.validatePasswordLetter(v)) return LanguageUtils.lang("ยืนยันรหัสผ่านไม่ถูกต้อง", "Confirm password invalid")
                if (this.password && v !== this.password) return LanguageUtils.lang("รหัสผ่านกับยืนยันรหัสผ่านไม่ตรงกัน", "The password and confirmation password do not match")
                return null
            })(this.confirmPassword)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }
}

</script>
<style lang="scss">
#reset-password-page {
    .pwd-hint {
        svg {
            margin-top: 4px;
        }
    }
}
</style>