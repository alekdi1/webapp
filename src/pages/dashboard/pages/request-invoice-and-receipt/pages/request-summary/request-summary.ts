import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { ROUTER_NAMES } from "@/router"
import { VuexServices, InvoiceServices, BranchService, LogServices } from "@/services"
import { InvoiceModel } from "@/models"
import moment from "moment"
import { Endpoints } from "@/config"

@Component
export default class RequestSummaryPage extends Base {
    @VuexServices.Payment.VXReqInvoiceForm()
    private requestForm!: InvoiceModel.RequestForm

    private isLoading = false

    private branch = ""

    private route = ROUTER_NAMES.request_summary
    private userNo = ""

    private async mounted () {
        this.userNo = this.user.customerNo
        LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onPageLoad"))
        let { requestForm } = this
        if (!requestForm) {
            requestForm = new InvoiceModel.RequestForm()
            VuexServices.Payment.setReqInvoiceForm(requestForm)
        }
        await this.getBranch()
        LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onReady"))
    }

    private get storeId () {
        return this.$route.params.store_id
    }

    private get formType () {
        return this.requestForm.type
    }

    private get isReceipt () {
        return this.formType === "receipt"
    }

    private displayYear (year: string) {
        return moment(year, "YYYY").add(543, "year").format("YYYY")
    }

    private displayMonth (yearId: number, monthId: number) {
        return moment(`${yearId} ${monthId}`, "YYYY M").locale(this.$i18n.locale).format("MMM")
    }

    private get text () {
        return {
            title: this.$t("pages.req_inv_n_recp.title").toString(),
            label_request_inv_list: this.$t("pages.req_inv_n_recp.label_request_inv_list").toString(),
            label_request_recp_list: this.$t("pages.req_inv_n_recp.label_request_recp_list").toString(),
            label_inv_email_exp_info: this.$t("pages.req_inv_n_recp.label_inv_email_exp_info").toString(),
            label_recp_email_exp_info: this.$t("pages.req_inv_n_recp.label_recp_email_exp_info").toString(),
            label_invoice: this.$t("pages.req_inv_n_recp.label_invoice").toString(),
            label_receipt: this.$t("pages.req_inv_n_recp.label_receipt").toString(),
            inv_no: this.$t("pages.req_inv_n_recp.inv_no").toString(),
            recp_no: this.$t("pages.req_inv_n_recp.recp_no").toString(),
            continue: this.$t("pages.req_inv_n_recp.continue").toString()
        }
    }

    private async requestInvoiceOrReceipt () {
        this.isLoading = true
        try {
            if (this.isReceipt) {
                LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallStart", Endpoints.requestReceiptToMail))
                InvoiceServices.requestReceiptToMail(this.user.customerNo, this.requestForm).then(() => {
                    LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallFinsih", Endpoints.requestReceiptToMail))
                })
            } else {
                LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallStart", Endpoints.requestReceiptToMail))
                InvoiceServices.requestInvoiceToMail(this.user.customerNo, this.requestForm).then(() => {
                    LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallFinsih", Endpoints.requestReceiptToMail))
                })
            }
        } catch (e) {
            // DialogUtils.showErrorDialog({ text: e.message || e })
        }
        this.goToResult()
        this.isLoading = false
    }

    private async getBranch () {
        try {
            LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallStart", Endpoints.getBranchIds))
            const branchIds = await BranchService.getBranchIds(this.requestForm.branch.id)
            LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallFinsih", Endpoints.getBranchIds))
            this.branch = branchIds[0].id + ""
        } catch (e) {
            // DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private goToResult () {
        this.$router.push({
            name: ROUTER_NAMES.request_result,
            params: {
                store_id: this.storeId,
                type: this.formType
            },
            query: {
                branch: this.branch
            }
        })
    }
}
