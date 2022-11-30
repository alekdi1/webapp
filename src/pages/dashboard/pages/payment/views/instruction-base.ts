import { PaymentModel } from "@/models"
import { BankServices } from "@/services"
import { Component } from "vue-property-decorator"
import Base from "./base"

@Component
export default class InstructionBase extends Base {
    protected bank: PaymentModel.Bank|null = null

    protected async mounted() {
        // @ts-ignore
        this.bank = await BankServices.getBankById(this.$route.query.bank)
    }

    protected get icon() {
        return this.bank?.image
    }
}
