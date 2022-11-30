<template>
	<div class="atm-instruction" style="height: 100%; position: relative">
		<div class="instruction-container">
			<div class="instruction-title cpn-text-h5 font-weight-bold">วิธีชำระเงิน</div>

			<div class="d-flex align-center mt-3">
				<img :src="icon" class="payment-icon" width="32" height="auto" v-if="icon"/>
				<div class="cpn-text-h6 px-4">ATM</div>
			</div>

			<v-divider class="my-6" />

			<div class="instruction-content">
				<v-expansion-panels flat v-model="model">
					<v-expansion-panel v-for="(instruction, idx) in instructions" :key="'instruction-' + idx">
						<v-expansion-panel-header>
							<span class="cpn-text-subtitle-1 font-weight-bold">{{ instruction.title }}</span>
						</v-expansion-panel-header>
						<v-expansion-panel-content>
							<table style="width: 100%;">
								<tr v-for="(s, i) in instruction.steps" :key="i">
									<td style="width: 28px; vertical-align: top;">{{ i+1 }}.</td>
									<td>
										<div class="pb-3">{{ s }}</div>
									</td>
								</tr>
							</table>
						</v-expansion-panel-content>
					</v-expansion-panel>
				</v-expansion-panels>

				<template v-if="note">
					<v-divider class="my-6" />
					<cpn-note-text>หมายเหตุ: {{ note }}</cpn-note-text>
					<v-divider class="my-6" />
				</template>
			</div>
		</div>

		<div class="footer-action-container d-flex flex-column">
			<v-btn
				class="mb-3"
				:loading="loading"
				@click="downloadBill()"
				:disabled="loading"
				rounded
				color="primary"
				:height="48"
				block
			>
				<div class="btn-text text-uppercase">ดาวน์โหลด Bill Payment</div>
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
/* eslint-disable */
import { BankServices } from "@/services"
import { Component } from "vue-property-decorator"
import Base from "./bank-base"
import { PaymentModel } from "@/models"

@Component
export default class InstructionAtm extends Base {
	private model = 0
	private bank: PaymentModel.Bank|null = null

	private async mounted() {
		this.bank = await BankServices.getBankById(String(this.$route.query.bank))
	}

	private get bankName() {
		return this.bank?.displayName || ""
	}

	private get icon() {
		return this.bank?.image || ""
	}

	private get instructions() {
		return this.bank?.instructions || []
	}

	private get note() {
		return this.bank?.instructionNote || ""
	}
}
</script>
<style lang="scss" scoped>
.instruction {
	padding-bottom: 60px;
	overflow-y: auto;
}
</style>