<template>
    <div class="push-noti-form-page">
        <cpn-dsb-page-content-container>
            <template v-slot:column-left>
                <div class="pa-6">
                    <div class="cpn-text-h5 font-weight-bold">{{ title }}</div>
                    <div id="push-noti-form" class="mt-5">
                        <div class="form-group">
                            <div>
                                <label for="push-noti-phone-input">{{ $t("pages.auth.lb_input_phone") }}</label>
                            </div>
                            <div class="push-noti-phone-input">
                                <input autocomplete="off" maxlength="10" id="push-noti-phone-input" type="text" class="form-control"
                                    :placeholder="$t('phone_number')" v-model="phone" :disabled="loading">
                            </div>
                            <div class="mt-5">
                                <p>1. กรุณาระบุหมายเลขโทรศัพท์ที่ทำการลงทะเบียนกับแอปพลิเคชันของทางธนาคาร</p>
                                <p>2. กรุณาเปิดการแจ้งเตือนในโทรศัพท์ของคุณ เพื่อรับการแจ้งเตือนมีการจ่ายชำระ</p>
                                <p>3. เข้าสู่แอพธนาคารเพื่อชำระบิล</p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </cpn-dsb-page-content-container>
    </div>
</template>
<script lang="ts">
import { LanguageUtils, ValidateUtils } from "@/utils"
import { Component, Watch } from "vue-property-decorator"
import { VuexServices } from "@/services"
import Base from "../../../dashboard-base"

@Component
export default class SubmitPushNotiPage extends Base {

    @VuexServices.Payment.VXPushNoti()
    private pushNoti!: { loading: boolean, phone: string }
    
    private phone = ""

    private get title() {
        return LanguageUtils.lang("ชำระผ่านเบอร์มือถือที่ลงทะเบียน Mobile Banking", "Register mobile phone via mobile banking")
    }

    private get loading() {
        return this.pushNoti.loading === true
    }

    @Watch("phone")
    private async onPhoneChange(p: string) {
        await VuexServices.Payment.setPushNotiPhone(p)
    }

    private mounted() {
        this.phone = this.pushNoti.phone || ""
    }

    private get phoneValid() {
        return ValidateUtils.validatePhone(this.phone)
    }
}

</script>

<style lang="scss" scoped>
.push-noti-form-page {
    height: 100%;
    position: relative;
}
</style>