<template>
    <div class="payment-promptpay-form-page">
        <cpn-dsb-page-content-container>
            <template v-slot:column-left>
                <v-container class="cpm-dbs-content-container">

                    <div class="cpn-text-h5 font-weight-bold">{{ title }}</div>
                    <div id="promptpay-form" class="mt-5">
                        <div class="form-group">
                            <div>
                                <label for="promptpay-phone-input">{{ inputLabel }}</label>
                            </div>
                            <div class="promptpay-phone-input">
                                <input autocomplete="off" maxlength="10" id="promptpay-phone-input" type="text" class="form-control"
                                    :placeholder="$t('phone_number')" v-model="phone" :disabled="loading">
                            </div>
                        </div>
                        <v-divider class="my-6"/>
                        <table class="instructions">
                            <tr v-for="(ins, idx) in instructions" :key="'instruction-' + idx">
                                <td style="width: 24px">{{ idx + 1 }}.</td>
                                <td v-html="ins"/>
                            </tr>
                        </table>
                    </div>
                </v-container>
            </template>
        </cpn-dsb-page-content-container>
    </div>
</template>
<script lang="ts">
import { LanguageUtils, ValidateUtils } from "@/utils"
import { Component, Watch } from "vue-property-decorator"
import { VuexServices } from "@/services"
import Base from "../../../dashboard-base"
import { InvoiceModel, PaymentModel } from "@/models"

@Component
export default class SubmitPromptPayPage extends Base {

    @VuexServices.Payment.VXPromptpayState()
    private promptpayState!: PaymentModel.PromptpayState|null

    @VuexServices.Payment.VXSelectedInvoices()
    private invoices!: InvoiceModel.Invoice[]
    
    private phone = ""

    private processing = false
    private orderPrice = 0

    private get title() {
        return LanguageUtils.lang("ชำระผ่านเบอร์มือถือ", "ชำระผ่านเบอร์มือถือ")
    }

    private get icon(): string {
        return require("@/assets/images/payment/promptpay-square.png")
    }

    private get inputLabel() {
        return LanguageUtils.lang("ชำระผ่านเบอร์มือถือ ที่ลงทะเบียนพร้อมเพย์", "ชำระผ่านเบอร์มือถือ ที่ลงทะเบียนพร้อมเพย์")
    }

    private get loading() {
        return this.promptpayState?.loading === true
    }

    @Watch("phone")
    private async onPhoneChange(p: string) {
        await VuexServices.Payment.setPromptpayStatePhone(p)
    }

    private get phoneValid() {
        return ValidateUtils.validatePhone(this.phone)
    }

    private get instructions() {
        return [
            "กรุณาระบุเบอร์มือถือที่ทำการลงทะเบียนกับแอปพลิเคชั่นของธนาคาร",
            "กรุณาเปิดการแจ้งเตือนในโทรศัพท์ของคุณเพื่อรับการแจ้งเตือนเมื่อมีการจ่ายชำระ",
            "เข้าสู่แอปพลิเคชั่นธนาคารเพื่อชำระบิล"
        ]
    }
}

</script>

<style lang="scss" scoped>
.payment-promptpay-form-page {
    height: 100%;
    position: relative;

    table.instructions {
        width: 100%;

        td {
            padding-top: 8px;
            padding-bottom: 8px;
            vertical-align: top;
        }
    }
}
</style>