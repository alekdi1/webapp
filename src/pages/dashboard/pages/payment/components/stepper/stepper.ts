import { Component, Vue } from "vue-property-decorator"
import { ROUTER_NAMES } from "@/router"

@Component
export default class PaymentStepper extends Vue {

    private get steps() {
        const { currentStep } = this
        return [
            {
                label: this.$t("pages.payment.step_confirm").toString()
            },
            {
                label: this.$t("pages.payment.step_select_method").toString()
            },
            {
                label: this.$t("pages.payment.step_finish").toString()
            }
        ].map((s, idx) => ({
            ...s,
            active: (idx + 1) <= currentStep
        }))
    }

    private get currentStep() {
        const rn = ROUTER_NAMES
        switch (this.$route.name) {
            case rn.payment_select_payment_method: return 2
            case rn.payment_result: return 3
            default: return 1
        }
    }
}
