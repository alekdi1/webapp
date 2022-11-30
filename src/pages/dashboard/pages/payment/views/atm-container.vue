<template>
    <div class="atm-instruction" style="height: 100%; position: relative">
        <div class="instruction-container">
            <div class="instruction-title cpn-text-h5 font-weight-bold">
            วิธีชำระเงิน
            </div>

            <div class="d-flex align-center mt-3">
                <img :src="icon" class="payment-icon" width="32" height="auto" v-if="icon"/>
                <div class="cpn-text-h6 px-4">ATM</div>
            </div>
            <v-divider class="my-6" />

            <div class="instruction-content">
                <slot />
            </div>
            <!-- download -->
            <div class="d-flex justify-center my-4">

                <v-btn :loading="loading" @click="downloadBill()" :disabled="loading" height="100" text>
                    <div class="d-flex justify-center align-center flex-column">
                        <v-img :src="require('@/assets/images/icons/file-download.svg')" :width="36" class="mb-2"/>
                        <span>{{ "ดาวน์โหลด Bill Payment" }}</span>
                    </div>
                </v-btn>

            </div>
        </div>

        <div class="footer-action-container">
        <v-btn
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
import { Component, Vue } from "vue-property-decorator"
import { BankServices, PaymentServices, VuexServices } from "@/services"
import { PaymentModel, UserModel } from "@/models"
import { DialogUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"

@Component
export default class AtmContainerCMP extends Vue {

    @VuexServices.Root.VXUser()
    protected user!: UserModel.User

    private bank: PaymentModel.Bank|null = null
    private loading = false

    private backToHome() {
        this.$router.replace({
            name: ROUTER_NAMES.payment_invoice_list
        })
    }

    private async mounted() {
        this.bank = await BankServices.getBankById(String(this.$route.query.bank))
    }

    private get bankName() {
        return this.bank?.displayName || ""
    }

    private get icon() {
        return this.bank?.image || ""
    }

    private async downloadBill() {
        this.loading = true
        try {
            const ref = String(this.$route.query.refkey || "")
            await PaymentServices.downloadBillPaymentPDF(ref, this.user.id, this.user.legal_form_code)
        } catch (e) {
            console.log(e.message || e)
            DialogUtils.showErrorDialog({ text: e.message || "Cannot download bill" })
        }
        this.loading = false
    }
}
</script>