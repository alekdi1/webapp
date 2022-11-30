import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import Step from "../../components/stepper/stepper.vue"
import { InvoiceModel } from "@/models"
import { NumberUtils, LanguageUtils, DialogUtils } from "@/utils"
import { NotificationServices, PaymentServices, VuexServices } from "@/services"
import { ROUTER_NAMES } from "@/router"
import moment from "moment"
import PAGE_NAME from "../page-name"
import { PaymentSlip } from "@/pages/dashboard/models"

import PaymentSplit from "@/pages/dashboard/views/payment-slip.vue"

/**
 * Example return result
 * http://localhost:8400/acknowledge.php?api_type=PAYMENT_CALLBACK&app_id=cpn_serve_web&order_id=4001000000198721&order_status=PAID&payment_id=210307214854002148P&x-req-sig=0a2e831d3728cf72dd2349ce6aba769667dff8bb93598d6d330771d3f20623a5
 */

@Component({
    name: PAGE_NAME.payment_result,
    components: {
        "cpn-payment-stepper": Step,
        "cpn-payment-slip": PaymentSplit
    }
})
export default class PaymentResultPage extends Base {
    @VuexServices.Payment.VXSelectedInvoices()
    private selectedInvoices!: InvoiceModel.Invoice[]

    private order = new OrderDetail()
    private slip = new PaymentSlip()

    private loading = false
    private downloading = false

    private async mounted() {
        await this.getOrderResult()
        await this.updateNotificationAsReaded();
    }

    private async updateNotificationAsReaded() {
        const notiId = Number(this.$route.query.noti_id || 0)
        await NotificationServices.markNotisAsRead([notiId])
    }

    private async getOrderResult() {
        console.log("getOrderResult")
        this.loading = true
        try {
            const order = await PaymentServices.inquiryOrder(this.orderId)
            const o = new OrderDetail()
            o.status = order.status
            o.paymentDate = order.updatedDate
            o.paymentId = order.payment.id
            o.shop = order.shopName
            o.totalAmount = order.totalAmount
            o.orderId = order.orderId || this.orderId
            o.isPaid = order.isPaid
            o.isPending = order.isPending
            o.note = order.note
            this.order = o

            const s = new PaymentSlip()
            s.status = order.status
            s.paymentDate = order.updatedDate
            s.paymentId = order.payment.id
            s.shop = order.shopName
            s.totalAmount = order.totalAmount
            s.orderId = order.orderId || this.orderId
            s.note = order.note
            this.slip = s
        } catch (e) {
            console.log(e.message || e)
            DialogUtils.showErrorDialog({
                text: e.message || "Get order data error"
            })
        }
        this.loading = false
    }

    private get text() {
        return {
            step_finish: this.$t("pages.payment.step_finish").toString(),
            payment_success: this.$t("pages.payment.payment_success").toString(),
            company_name: this.$t("pages.payment.company_name").toString(),
            transaction_no: this.$t("transaction_no").toString(),
            tax_no: this.$t("pages.payment.tax_no").toString(),
            total_payment: this.$t("total_payment").toString(),
            vat: this.$t("vat").toString(),
            baht: this.$t("baht").toString(),
            memo: this.$t("pages.payment.memo").toString(),
            payment_date: this.$t("pages.payment.payment_date").toString(),
            download_slip: this.$t("pages.payment.download_slip").toString(),
            back_to_main: this.$t("pages.payment.back_to_main").toString()
        }
    }

    private async downloadSlip() {
        this.downloading = true
        try {
            // @ts-ignore
            await this.$refs.slipView.download()
        } catch (error) {
            //
        }
        this.downloading = false
    }

    private backToPaymentList() {
        VuexServices.Payment.clearStore()
        this.$router.push({
            name: ROUTER_NAMES.payment_invoice_list
        })
    }

    private backToPaymentConfirm() {
        if (this.selectedInvoices.length > 0) {
            return this.$router.push({
                name: ROUTER_NAMES.payment_confirm_payment
            })
        }
        this.$router.push({
            name: ROUTER_NAMES.payment_invoice_list
        })
    }

    private get isSuccess() {
        return this.order.isPaid
    }

    private get isPending() {
        return this.order.isPending
    }

    private get isError() {
        return this.order.isError
    }

    private get errorMessage() {
        if (this.order.status === "CANCELLED") {
            return "ยกเลิกรายการ"
        }
        if (this.order.status === "EXPIRED") {
            return "คุณไม่ได้ทำรายการในเวลาที่กำหนด กรุณาทำรายการอีกครั้ง"
        }

        return ""
    }

    private get orderId() {
        return String(this.$route.query.order_id || "")
    }

    private get paymentId() {
        return String(this.$route.query.payment_id || "")
    }

    private get reqSig() {
        return String(this.$route.query["x-req-sig"] || "")
    }

    private get companyName() {
        return "บริษัท เซ็นทรัลพัฒนา จำกัด (มหาชน)"
    }
}

class OrderDetail {
    status = ""
    shop = ""
    paymentId = ""
    invoiceId = ""
    totalAmount = 0
    vat = 0
    paymentDate = ""
    note = ""
    orderId = ""
    isPaid = false
    isPending = false

    get displayTotalAmount() {
        return NumberUtils.getPriceFormat(this.totalAmount)
    }

    get displayPaymentDate() {
        if (!this.paymentDate) {
            return ""
        }
        const md = moment(this.paymentDate)
        return md.isValid() ? this.convertToLocalDateTimeFormat(md) : ""
    }

    private convertToLocalDateTimeFormat(date: moment.Moment) {
        const timeOption = LanguageUtils.lang("น.", "")
        return date.locale(LanguageUtils.getCurrentLang()).add(543, "year").format("ll HH.mm") + " " + timeOption
    }

    get displayVat() {
        return NumberUtils.getPriceFormat(this.vat)
    }

    get isError() {
        return !this.isPending && !this.isPaid
    }
}
