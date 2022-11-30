import { PaymentServices, PaymentMethodServices, VuexServices, LogServices } from "@/services"
import { Component, Vue } from "vue-property-decorator"
import { DialogUtils } from "@/utils"
import { InvoiceModel, PaymentModel, UserModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { Endpoints } from "@/config"
@Component
export default class InstructionBase extends Vue {

    @VuexServices.Payment.VXSelectedInvoices()
    public invoices!: InvoiceModel.Invoice[]

    @VuexServices.Root.VXUser()
    protected user!: UserModel.User

    @VuexServices.Payment.VXPaymentMethod()
    public paymentMethod!: PaymentModel.PaymentMethod | any

    protected loading = false

    protected async downloadBill() {
        this.loading = true
        try {
            const { invoices, paymentMethod, user } = this    
            // const ref = String(this.$route.query.refkey || "")
            const rp = ROUTER_NAMES.payment_select_payment_method
            console.log(invoices)
            console.log(paymentMethod)
            console.log(user)
            await VuexServices.Root.setFullScreenLoading(!!1)
            LogServices.addApiLog(new LogServices.PLog(rp, this.user.companyName, "onApiCallStart", Endpoints.makePayment))
            const rs = await PaymentServices.makePayment(invoices, paymentMethod, user)
            LogServices.addApiLog(new LogServices.PLog(rp, this.user.companyName, "onApiCallFinsih", Endpoints.makePayment))
            await PaymentServices.downloadBillPaymentPDF(rs.refKey, this.user.id, this.user.legal_form_code).then(e=>{this.loading = false})
        } catch (e) {
            console.log(e.message || e)
            DialogUtils.showErrorDialog({ text: e.message || e})
            this.loading = false
        }
        this.loading = false
        await VuexServices.Root.setFullScreenLoading(!1)
    }

    protected async backToHome() {
        VuexServices.Payment.clearStore()
        this.$router.replace({
            name: ROUTER_NAMES.payment_invoice_list
        })
    }
}
