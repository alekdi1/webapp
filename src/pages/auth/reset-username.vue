<template>
    <cpn-auth-conrainer>
        <template slot="auth-content">
            <div class="d-flex w100 h100 align-center">
                <div class="w100">
                    <cpn-auth-company-text />

                    <form :id="'reset-username-form' + form.id">
                        <div class="d-flex flex-column align-center">
                            <span class="cpn-text-h6 font-weight-regular">{{ text.change_username }}</span>
                        </div>

                        <div class="form-group" :class="{'form-error': form.validated && !!form.errors.username}">
                            <div class="username-input my-3">
                                <input :id="'input-username-' + form.id" type="text" class="form-control"
                                    :placeholder="text.new_username" v-model="form.username" :disabled="loading">
                            </div>
                            <div class="cpn-text-body-2 mt-2 ml-2 text-error" v-if="form.validated && form.errors.username">{{ form.errors.username }}</div>
                        </div>

                        <div class="form-group" :class="{'form-error': form.validated && !!form.errors.confirmUsername}">
                            <div class="username-input my-3">
                                <input :id="'input-confirm-username-' + form.id" type="text" class="form-control"
                                    :placeholder="text.confirm_new_username" v-model="form.confirmUsername" :disabled="loading">
                            </div>
                            <div class="cpn-text-body-2 mt-2 ml-2 text-error" v-if="form.validated && form.errors.confirmUsername">{{ form.errors.confirmUsername }}</div>
                        </div>

                        <cpn-note-text class="my-3">
                            <div class="text-gray">
                                {{ $t('username_hint') }}
                            </div>
                        </cpn-note-text>

                        <v-btn :loading="loading" @click="submitUsername" :disabled="loading" class="mt-4" block rounded color="primary" :height="48">
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
import { AuthService } from "@/services"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "./auth-base"

@Component
export default class AuthResetUsername extends Base {

    private loading = false
    private form = new ResetUsernameForm()
    private isTokenInvalide = false;

    private async mounted() {
       const { email, token } = this
       try{
           const checkIsvalideToken = await AuthService.checkIsvalideToken(email, token, "username")
           if(checkIsvalideToken.data == true){
               this.isTokenInvalide = false;
           }
       } catch(e) {
           DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่สามารถแก้ไขได้เนื่องจากลิงค์ไม่ถูกต้อง", "Can't edit because the link is invalid.") })
           this.isTokenInvalide = true;
       }
    }

    private get text() {
        const t = (k: string) => this.$t("pages.auth." + k).toString()
        return {
            change_username: t("change_username"),
            new_username: t("new_username"),
            confirm_new_username: t("confirm_new_username"),
            confirm: this.$t("confirm"),
            username: this.$t("username")
        }
    }

    private async submitUsername() {
        this.form.validated = true
        if (Object.values(this.form.errors).some(e => e !== null)) {
            return
        }
        this.loading = true
        try {
            const { email, token } = this
            await AuthService.submitResetAccount(email, token, "username", this.form.username)
            await this.showSuccessDialog()
            this.isTokenInvalide = false;
            this.$router.replace({ name: ROUTER_NAMES.login })
        } catch (e) {
            const dfMsg = e.message || e.message == "Token invalid" ?  LanguageUtils.lang("ไม่สามารถแก้ไขได้เนื่องจากลิงค์ไม่ถูกต้อง", "Can't edit because the link is invalid.") : LanguageUtils.lang("บางอย่างผิดพลาด", "Something wrong")
            if(e.message == "Token invalid"){
                this.isTokenInvalide = true;
                this.form.username = "";
                this.form.confirmUsername = "";
            }
            DialogUtils.showErrorDialog({ text: dfMsg || e.message})
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
            text: LanguageUtils.lang("ดำเนินการสร้างชื่อผู้ใช้ใหม่สำเร็จ", "Successfully created a new username."),
            timer: 3000
        })
    }
}

class ResetUsernameForm {
    id = Math.random().toString(24).replace("0.", "")
    username = ""
    confirmUsername = ""

    validated = false

    get errors() {
        return {
            username: (v => {
                if (v.length == 0) return ""
                if (!v) return LanguageUtils.lang("กรุณาระบุชื่อผู้ใช้", "Please input username")
                if (!ValidateUtils.validateUsername(v)) return LanguageUtils.lang("ชื่อผู้ใช้ไม่ถูกต้อง", "Username invalid")
                return null
            })(this.username),
            confirmUsername: (v => {
                if (v.length == 0) return ""
                if (!v) return LanguageUtils.lang("กรุณาระบุยืนยันชื่อผู้ใช้", "Please input confirm username")
                if (!ValidateUtils.validateUsername(v)) return LanguageUtils.lang("ยืนยันชื่อผู้ใช้ไม่ถูกต้อง", "Confirm username invalid")
                if (this.username && v !== this.username) return LanguageUtils.lang(
                    "ชื่อผู้ใช้กับยืนยันชื่อผู้ใช้ไม่ตรงกัน",
                    "Username and confirm username not match"
                )
                return null
            })(this.confirmUsername)
        }
    }
}
</script>