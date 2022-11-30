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

        <div class="d-flex flex-column btn-container px-6">
            <div class="note mt-3 mb-6">หมายเหตุ: {{ note }}</div>

            <v-btn class="mb-3" @click="downloadBill" :disabled="loading" :loading="loading" rounded color="primary" :height="48" block>
                <div class="btn-text text-uppercase">{{ $t("pages.payment.download_bill") }}</div>
            </v-btn>

            <v-btn
				class="mb-3"
				@click="backToHome"
				:disabled="loading"
				rounded
				color="primary"
				:height="48"
				block
			>
				<div class="btn-text text-uppercase">{{ $t("go_back_to_main") }}</div>
			</v-btn>
        </div>
    </div>
</template>
<script lang="ts">
import Base from "./instruction-base"
import { LanguageUtils } from "@/utils"
import { Component } from "vue-property-decorator"

@Component
export default class InstructionScanQR extends Base {

    private get steps() {
        return [
            "ดาวน์โหลด Bill payment",
            "เข้าสู่แอพธนาคารเพื่อ สแกน QR/ ชำระบิล",
            "ตรวจสอบรายการชำระ"
        ]
    }

    private get title() {
        return LanguageUtils.lang("Scan QR: Bill payment", "Scan QR: Bill payment")
    }

    private get note() {
        return "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 24 ชม."
    }
}
</script>