<template>
	<div class="promptpay-instruction result-instruction" style="height: 100%; position: relative">
		<div class="d-flex flex-column" style="flex: 1 1 0%;">
			<div class="cpn-text-h5 font-weight-bold">{{ title }}</div>
			<div class="instruction-content">

				<v-card flat width="64" height="64">
					<v-img width="64" height="64" :src="icon" alt="promptpay-icon"/>
				</v-card>

				<div style="font-weight: 700;" class="text-center mt-4 cpn-content-subtitle">กรุณาเปิด Mobile Banking Application<br>เพื่อทำการชำระเงิน</div>
				<div style="color: #666666;" class="text-center mt-3">(รอข้อความแจ้งเตือนภายใน 15 นาที)</div>
				<div class="text-center mt-3 cpn-content-subtitle">
					หลังจากทำรายการสมบูรณ์แล้ว กรุณากด <br>ปุ่มทำรายการต่อ เพื่อรับหลักฐานการชำระเงิน
				</div>

				<div style="font-weight: 700;" class="text-center mt-3 cpn-content-subtitle">ยอดชำระทั้งหมด <span class="price">{{ displayPrice }}</span></div>
			
				<div class="button-container px-4">
					<v-btn @click="continueClick" depressed :disabled="processing" :loading="processing" height="48" block color="primary" rounded>
						<div class="text-uppercase text-white">ทำรายการต่อ</div>
					</v-btn>

					<v-btn @click="back" :disabled="processing" height="48" block color="primary" rounded outlined class="mt-4">
						<div class="text-uppercase white-text">{{ $t("go_back_to_main") }}</div>
					</v-btn>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
/* eslint-disable */
import { VuexServices } from "@/services"
import { Component } from "vue-property-decorator"
import Base from "./bank-base"
import { InvoiceModel, PaymentModel } from "@/models"
import { LanguageUtils, NumberUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"

@Component
export default class InstructionPromptpay extends Base {


	@VuexServices.Payment.VXSelectedInvoices()
    public invoices!: InvoiceModel.Invoice[]

	@VuexServices.Payment.VXPromptpayState()
    private promptpayState!: PaymentModel.PromptpayState|null
	
	private get displayPrice() {
        return NumberUtils.getPriceFormat(this.promptpayState?.price || 0)
    }

	private get title() {
        return LanguageUtils.lang("ชำระผ่านเบอร์มือถือ", "ชำระผ่านเบอร์มือถือ")
    }

	private get icon(): string {
        return require("@/assets/images/payment/promptpay-square.png")
    }

	private get orderId() {
		return String(this.$route.query.order_id || "")
	}

	private get refkey() {
		return String(this.$route.query.refkey)
	}

	private continueClick() {
		return this.$router.replace({
			name: ROUTER_NAMES.payment_result,
			query: {
				order_id: this.orderId,
				refkey: this.refkey
			}
		})
	}

	private back() {
		return this.$router.replace({
			name: ROUTER_NAMES.payment_invoice_list
		})
	}
	
}
</script>
<style lang="scss" scoped>
.promptpay-instruction {
	min-height: 100%;
	display: flex;
	flex-direction: column;

	.instruction-content {
		padding-top: 24px;
		flex-grow: 1;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.button-container {
		margin-top: 28px;
		width: 100%;
	}
}
</style>