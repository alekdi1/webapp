<template>
    <cpn-auth-conrainer >
        <template slot="auth-content">

            <!-- =============== select recover username =============== -->
            <div class="pt-4" v-if="view === 'recover_username'">
                <cpn-auth-company-text />

                <div class="px-5 py-5">

                    <div class="d-flex flex-column align-center mb-6">
                        <span class="cpn-text-h6 font-weight-regular">{{ text.lb_setting_username }}</span>
                        <div class="text-center mt-1">{{ text.desc_setting_username }}</div>
                    </div>

                    <div class="method-list">
                        <v-card @click="selectedMethod = m" :color="selectedMethod && selectedMethod.id === m.id ? '#ede7db' : ''" class="rec-method-item py-3 px-4" flat outlined v-for="(m, idx) in methods" :key="'method-' + idx">
                            <table>
                                <tr>
                                    <td class="col-icon">
                                        <img :src="m.icon" :width="m.iconSize.width" :height="m.iconSize.height" />
                                    </td>
                                    <td>
                                        <div class="d-flex flex-column align-start">
                                            <div class="method-name">{{ m.label }}</div>
                                            <div class="method-value">{{ m.displayValue }}</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </v-card>
                    </div>

                    <v-btn @click="submitSendRecover" :loading="loading" :disabled="loading || !selectedMethod" class="mt-4" block rounded color="primary" :height="48">
                        <span class="cpn-text-body-1 text-uppercase">{{ $t("send") }}</span>
                    </v-btn>
                </div>
            </div>

            <!-- =============== select recover password =============== -->
            <div class="pt-4" v-else-if="view === 'recover_password'">
                <cpn-auth-company-text />

                <div class="px-5 py-5">

                    <div class="d-flex flex-column align-center mb-6">
                        <span class="cpn-text-h6 font-weight-regular">{{ text.req_pwd }}</span>
                        <div class="text-center mt-1">{{ text.req_pwd_desc }}</div>
                    </div>

                    <div class="method-list">
                        <v-card @click="selectedMethod = m" :color="selectedMethod && selectedMethod.id === m.id ? '#ede7db' : ''" class="rec-method-item py-3 px-4" flat outlined v-for="(m, idx) in methods" :key="'method-' + idx">
                            <table>
                                <tr>
                                    <td class="col-icon">
                                        <img :src="m.icon" :width="m.iconSize.width" :height="m.iconSize.height" />
                                    </td>
                                    <td>
                                        <div class="d-flex flex-column align-start">
                                            <div class="method-name">{{ m.label }}</div>
                                            <div class="method-value">{{ m.displayValue }}</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </v-card>
                    </div>

                    <v-btn @click="submitSendRecover" :loading="loading" :disabled="loading || !selectedMethod" class="mt-4" block rounded color="primary" :height="48">
                        <span class="cpn-text-body-1 text-uppercase">{{ $t("send") }}</span>
                    </v-btn>
                </div>
            </div>

            <template v-else-if="view === 'form'">
                <!-- =============== forgot password -> input username =============== -->
                <div class="pt-4" v-if="process.forgot_password">
                    <cpn-auth-company-text />

                    <form class="px-5 py-5">

                        <div class="d-flex flex-column align-center">
                            <span class="cpn-text-h6 font-weight-regular">{{ text.forgot_password }}</span>
                            <div>{{ text.lb_input_username }}</div>
                        </div>

                        <div class="form-group">
                            <div class="username-input my-3">
                                <input :id="'input-username-' + form.id" type="text" class="form-control"
                                    :placeholder="text.username" v-model="form.username" :disabled="loading">
                            </div>
                        </div>

                        <v-btn @click="submitUsername" :loading="loading" :disabled="loading || !form.usernameValidated" class="mt-4" block rounded color="primary" :height="48">
                            <span class="cpn-text-body-1 text-uppercase">{{ $t("ok") }}</span>
                        </v-btn>

                        <v-btn @click="backToLogin" outlined  block rounded color="primary" :height="48" class="mt-4">
                            <span class="cpn-text-body-1 text-uppercase">{{ text.back_to_login }}</span>
                        </v-btn>
                    </form>
                </div>

                <!-- =============== forgot username -> input tax id =============== -->
                <div class="pt-4" v-if="process.forgot_username">
                    <cpn-auth-company-text />

                    <form class="px-5 py-5">

                        <div class="d-flex flex-column align-center">
                            <span class="cpn-text-h6 font-weight-regular">{{ text.forgot_username }}</span>
                            <div class="text-center">{{ text.lb_input_tax_id }}</div>
                        </div>

                        <div class="form-group">
                            <div class="tax-id-input my-3">
                                <input :id="'tax-id-input-' + form.id" type="text" class="form-control" maxlength="13"
                                    :placeholder="text.tax_id" v-model="form.taxId" :disabled="loading">
                                <div class="input-error-message mt-1" v-if="form.taxIdError && form.taxId">
                                    {{ form.taxIdError }}
                                </div>
                            </div>
                        </div>

                        <v-btn @click="submitTaxId" :loading="loading" :disabled="loading || !form.taxIdValidated" class="mt-4" block rounded color="primary" :height="48">
                            <span class="cpn-text-body-1">{{ $t("ok") }}</span>
                        </v-btn>

                        <v-btn @click="backToLogin" outlined  block rounded color="primary" :height="48" class="mt-4">
                            <span class="cpn-text-body-1 text-uppercase">{{ text.back_to_login }}</span>
                        </v-btn>
                    </form>
                </div>
            </template>

            <template v-else-if="view === 'result_email'">
                <div class="d-flex h100 flex-column justify-center align-center">
                    <img :src="icons.email" height="auto" width="80" alt="Email icon">

                    <div class="cpn-text-h6 font-weight-regular font-weight-bold mt-4">{{ text.check_email }}</div>
                    <div class="text-center mt-1" v-if="process.forgot_username">{{ text.desc_email_username_sent }}</div>
                    <div class="text-center mt-1" v-else-if="process.forgot_password">{{ text.desc_email_pwd_sent }}</div>

                    <div class="w100 mt-10">
                        <v-btn @click="backToLogin" block rounded color="primary" :height="48" class="mt-4">
                            <span class="cpn-text-body-1 text-uppercase">{{ text.back_to_login }}</span>
                        </v-btn>
                    </div>
                </div>
            </template>
            <template v-else-if="view === 'result_phone'">
                <div class="d-flex h100 flex-column justify-center align-center">
                    <img :src="icons.phone" height="auto" width="64" alt="Phone icon">
                    <div class="cpn-text-h6 font-weight-regular font-weight-bold mt-4">{{ text.check_sms }}</div>
                    <div class="text-center mt-1" v-if="process.forgot_username">{{ text.desc_sms_username_sent }}</div>
                    <div class="text-center mt-1" v-else-if="process.forgot_password">{{ text.desc_sms_pwd_sent }}</div>

                    <div class="w100 mt-10">
                        <v-btn @click="backToLogin" block rounded color="primary" :height="48" class="mt-4">
                            <span class="cpn-text-body-1 text-uppercase">{{ text.back_to_login }}</span>
                        </v-btn>
                    </div>
                </div>
            </template>

        </template>
    </cpn-auth-conrainer>
</template>
<script lang="ts">
import { ROUTER_NAMES } from "@/router"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import { AuthService } from "@/services"
import Base from "./auth-base"

type ViewType = "form" | "result_email" | "result_phone" | "recover_username" | "recover_password"

@Component
export default class ForgotPasswordUsernamePage extends Base {
    private form = new Form()
    private loading = false
    private profile = new UserProfile()
    private selectedMethod: RecoverMethod|null = null
    private view: ViewType = "form"

    private get text() {
        const t = (k: string) => this.$t("pages.auth." + k).toString()
        return {
            username: t("username"),
            forgot_password: t("forgot_password"),
            forgot_username: t("forgot_username"),
            lb_input_username: t("lb_input_username"),
            req_pwd: t("req_pwd"),
            req_pwd_desc: t("req_pwd_desc"),
            email: this.$t("email").toString(),
            sms: this.$t("sms").toString(),
            lb_input_tax_id: t("lb_input_tax_id"),
            tax_id: t("tax_id"),
            check_email: t("check_email"),
            desc_email_pwd_sent: t("desc_email_pwd_sent"),
            desc_email_username_sent: t("desc_email_username_sent"),
            desc_sms_username_sent: t("desc_sms_username_sent"),
            desc_sms_pwd_sent: t("desc_sms_pwd_sent"),
            check_sms: t("check_sms"),
            back_to_login: t("back_to_login"),
            lb_setting_username: t("lb_setting_username"),
            desc_setting_username: t("desc_setting_username")
        }
    }

    private backToLogin() {
        this.$router.replace({
            name: ROUTER_NAMES.login
        })
    }

    private get redirectText() {
        if (this.process.forgot_username) {
            return LanguageUtils.lang("กลับสู่หน้า Login", "Go to reset username")
        }
        return LanguageUtils.lang("กลับสู่หน้า Login", "Go to reset password ")
    }

    private gotoResetPWDForm() {

        if (this.process.forgot_username) {
            return this.$router.replace({
                name: ROUTER_NAMES.login
            })
        }
        
        if (this.process.forgot_password) {
            return this.$router.replace({
                name: ROUTER_NAMES.login
            })
        }
    }

    private get process() {
        return {
            forgot_password: this.$route.name === ROUTER_NAMES.forgot_password,
            forgot_username: this.$route.name === ROUTER_NAMES.forgot_username,
            select_recover_method: this.$route.name === ROUTER_NAMES.forgot_pwd_select_recover_method
        }
    }

    private get icons() {
        return {
            email: require("@/assets/images/icons/email.svg"),
            phone: require("@/assets/images/icons/phone.svg")
        }
    }

    private get methods() {
        const methods: RecoverMethod[] = []

        if (this.profile.email) {
            const email = new RecoverMethod()
            email.id = "email"
            email.value = this.profile.email
            email.label = this.text.email
            email.icon = this.icons.email
            email.iconSize = {
                width: 32,
                height: "auto"
            }

            const e = this.profile.email
            const aIdx = e.indexOf("@")
            const spliteword = this.profile.email.split("@")[0]

            email.displayValue = spliteword.length <= 3 ? this.profile.email : e.substring(0, 3) + Array(e.substring(2, aIdx).length).join("x") + e.substring(aIdx)
            methods.push(email)
        }

        if (ValidateUtils.validatePhone(this.profile.phone)) {
            const phone = new RecoverMethod()
            phone.id = "phone"
            phone.value = this.profile.phone
            phone.label = this.text.sms
            phone.icon = this.icons.phone
            phone.iconSize = {
                width: "auto",
                height: 32
            }

            const p = this.profile.phone

            phone.displayValue = Array(p.length - 3).join("x") + p.substr(p.length - 4)
            methods.push(phone)
        }

        return methods
    }

    private async submitSendRecover() {
        this.loading = true
        if (this.selectedMethod?.id === "email") {
            try {
                if (this.process.forgot_password) {
                    const rs = await AuthService.submitSendResetAccount("password", this.profile.email, this.profile.id)
                    console.log(rs, "forgot_password email")
                } else if (this.process.forgot_username) {
                    const rs = await AuthService.submitSendResetAccount("username", this.profile.email, this.profile.id)
                    console.log(rs, "forgot_username email")
                }
            } catch (e) {
                console.log(e)
                DialogUtils.showErrorDialog({
                    text: e.message || e
                }) 
            }
            this.view = "result_email"

        } else if (this.selectedMethod?.id === "phone") {
            try {
                if (this.process.forgot_password) {
                    const rs = await AuthService.submitSendResetAccount("password", this.profile.phone, this.profile.id)
                    console.log(rs, "forgot_password phone")
                } else if (this.process.forgot_username) {
                    const rs = await AuthService.submitSendResetAccount("username", this.profile.phone, this.profile.id)
                    console.log(rs, "forgot_username phone")
                }
            } catch (e) {
                console.log(e)
                DialogUtils.showErrorDialog({
                    text: e.message || e
                }) 
            }
            this.view = "result_phone"
        }
        this.loading = false
    }

    private async submitTaxId() {
        this.loading = true
        try {
            const rs = await AuthService.getAccountInfo("tax", this.form.taxId)
            this.profile.email = rs.email
            this.profile.phone = rs.phone
            this.profile.id = rs.id
            this.view = "recover_username"
        } catch (e) {
            console.log(e)
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = false
    }

    private async submitUsername() {
        this.loading = true
        try {
            const rs = await AuthService.getAccountInfo("username", this.form.username)
            this.profile.email = rs.email
            this.profile.phone = rs.phone
            this.profile.id = rs.id
            this.view = "recover_password"
        } catch (e) {
            console.log(e)
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = false
    }
}

class Form {
    id = Math.random().toString(36).replace("0.", "")
    username = ""
    taxId = ""

    get usernameValidated() {
        return !!this.username
    }

    get usernameError() {
        const { username } = this
        if (!username) {
            return LanguageUtils.lang("กรุณากรอกชื่อผู้ใช้", "Please input username")
        }

        return null
    }

    get taxIdValidated() {
        return this.taxIdError === null
    }

    get taxIdError() {
        const { taxId } = this
        if (!taxId) {
            return LanguageUtils.lang("กรุณากรอกหมายเลข TAX ID ของคุณ", "Please enter your TAX ID number.")
        }

        if (taxId.match(/^[0-9]{13}$/g) === null) {
            return LanguageUtils.lang("หมายเลข Tax id ไม่ถูกต้อง", "Your Tax id invalid")
        }

        return null
    }
}

class RecoverMethod {
    id = ""
    value = ""
    label = ""
    icon = ""
    iconSize = {
        width: ((): number|string => 0)(),
        height: ((): number|string => 0)()
    }
    displayValue = ""
}

class UserProfile {
    id = ""
    username = ""
    email = ""
    phone = ""
}

</script>
<style lang="scss" scoped>
.method-list {
    .rec-method-item {
        &::before {
            background: transparent !important;
        }
        td.col-icon {
            width: 48px;
            vertical-align: middle;
        }
        border-radius: 999px;

        &:not(:last-child) {
            margin-bottom: 20px;
        }

        .method-value {
            width: 180px;
        }
    }
}
</style>