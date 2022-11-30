import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { InvoiceModel, PostModel } from "@/models"
import { VuexServices } from "@/services"
import { ROUTER_NAMES } from "@/router"

@Component
export default class RequestResultPage extends Base {
    @VuexServices.Payment.VXReqInvoiceForm()
    private requestForm!: InvoiceModel.RequestForm

    private promotion: PostModel.Post = new PostModel.Post()

    private hasPromotion = false
    private async mounted() {
        let { requestForm } = this
        if (!requestForm) {
            requestForm = new InvoiceModel.RequestForm()
            VuexServices.Payment.setReqInvoiceForm(requestForm)
        }
    }

    private get branch () {
        return this.$route.query.branch
    }

    private get formType () {
        return this.requestForm ? this.requestForm.type : ""
    }
    
    private get isReceipt () {
        return this.formType === "receipt"
    }

    private get text () {
        return {
            label_inv_success_info: this.$t("pages.req_inv_n_recp.label_inv_success_info").toString(),
            label_recp_success_info: this.$t("pages.req_inv_n_recp.label_recp_success_info").toString(),
            back_to_main: this.$t("pages.req_inv_n_recp.back_to_main").toString(),
            label_send_email: this.$t("pages.req_inv_n_recp.label_send_email").toString()
        }
    }

    private goToRequestBranchList () {
        this.$router.push({
            name: ROUTER_NAMES.request_invoice_and_receipt_store_list
        })
    }
}
