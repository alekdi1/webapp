<template>
    <div class="instruction" style="height: 100%;position: relative;">
        
        <div class="instruction-content-container">
            <div class="instruction-title cpn-text-h5 font-weight-bold">{{ $t("pages.payment.title_select_payment_method") }}</div>

            <div class="cpn-text-h6 mt-4">{{ title }}</div>
            <v-divider class="my-6"/>
            <table style="width: 100%;">
                <tr v-for="(s, i) in steps" :key="i">
                    <td style="width: 28px;">{{ i+1 }}.</td>
                    <td>
                        <div class="py-2" v-html="s"/>
                    </td>
                </tr>
            </table>

        </div>

        <div class="d-flex flex-column btn-container mt-6">
            <div class="note my-3">หมายเหตุ: {{ note }}</div>
            
            <v-btn :disabled="loading" :loading="loading" @click="continueClick" rounded color="primary" :height="48" block>
                <div class="btn-text text-uppercase">{{ $t("continue") }}</div>
            </v-btn>
        </div>
    </div>
</template>
<script lang="ts">
import Base from "./instruction-base"
import { LanguageUtils, StorageUtils } from "@/utils"
import { Component } from "vue-property-decorator"

@Component
export default class InstructionThaiQR extends Base {

    private get steps() {
        return [
            "ดำเนินการ Scan Thai QR หรือ บันทึก Thai QR ลงโทรศัพท์มือถือ",
            "เข้าสู่แอพธนาคารเพื่อ สแกน QR/ ชำระบิล",
            "ตรวจสอบรายการชำระเงินและยืนยัน"
        ]
    }

    private get title() {
        return LanguageUtils.lang("Thai QR", "Thai QR")
    }

    private get note() {
        return "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 24 ชม."
    }

    private async continueClick() {
        this.loading = true
        try {
            const refkey = String(this.$route.query.refkey || "")
            const paymentUrl = StorageUtils.getItem(refkey)
            if (paymentUrl) {
                window.location.href = paymentUrl
            }
        } catch (e) {
            console.log(e.message || e)
        }
        this.loading = false
    }
}
</script>