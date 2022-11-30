import { Component, Prop } from "vue-property-decorator"
import { LanguageUtils, TimeUtils, NumberUtils, DialogUtils } from "@/utils"
import { PaymentModel, InvoiceModel, BranchModel } from "@/models"
import { PaymentService, PaymentServices, VuexServices } from "@/services"
import moment from "moment"
import Base from "@/pages/dashboard/dashboard-base"
import { PaymentSlip } from "@/pages/dashboard/models"

import PaymentSplit from "@/pages/dashboard/views/payment-slip.vue"

@Component({
    components: {
        "cpn-payment-slip": PaymentSplit,
    }
})
export default class InvoiceHistoryDetailCMP extends Base {
    @Prop({ default: () => new PaymentModel.PaymentTransactionItem() })
    private selectedInvoiceDetail!: PaymentModel.PaymentTransactionItem

    @VuexServices.Root.VXBranches()
    private branchList!: BranchModel.Branch[]
    private branchMaps = new Map<string, BranchModel.Branch>();

    private downloading = false

    private get displayBPName() {
        return this.user?.firstName
    }

    private async mounted() {
        this.user.branchList.map(x => {
            this.branchMaps.set(x.code, x);
        })
    }

    private async downloadSlip() {
        this.downloading = true
        try {
            const item = this.selectedInvoiceDetail
            if (!item.refKey) {
                throw new Error(LanguageUtils.lang("ไม่มีหมายเลข transaction", "No transaction id"))
            }
            const order = await PaymentServices.inquiryOrder(item.refKey,item,this.user)
            const s = new PaymentSlip()
            s.status = order.status
            s.paymentDate = order.updatedDate
            s.paymentId = order.payment.id
            s.shop = order.shopName
            s.totalAmount = order.totalAmount
            s.orderId = order.orderId || item.refKey
            s.note = order.note
            this.$emit("downloadCompleted", s)
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || "Download error"
            })
        }
        this.downloading = false
    }


    private displayMasterBranch(branchCode: string) {
        let code = "";
        if (branchCode === "PK1") {
            code = "PKT";
        } else if (branchCode === "PKT") {
            code = "PK2";
        } else {
            code = branchCode;
        }
        const branch = this.branchMaps.has(code) ? this.branchMaps.get(code) : null;
        if (branch) {
            return LanguageUtils.lang("สาขา" + branch.nameTh, branch.nameEn + " branch");
        }
        return "";
    }

    private get invoices() {
        this.user.branchList.map(x => {
            this.branchMaps.set(x.code, x);
        })
        return this.selectedInvoiceDetail.invoices
    }

    private displayShop(shop: InvoiceModel.InvoiceShop) {
        const shopName = LanguageUtils.getCurrentLang() === "en" ? (shop.nameEn ? shop.nameEn : "No shop name") : (shop.nameTh ? shop.nameTh : "ไม่ระบุร้านค้า")
        return shopName
    }

    private displayBranch(branch: InvoiceModel.InvoiceBranch) {
        return LanguageUtils.getCurrentLang() === "en" ? (branch.nameEn ? branch.nameEn : "No branch name") : (branch.nameTh ? branch.nameTh : "ไม่ระบุสาขา")
    }

    private displayAmount(price: number) {
        return NumberUtils.getPriceFormat(price)
    }

    private displayDate(date: string) {
        return TimeUtils.convertToLocalDateFormat(moment(date))
    }

    private displayTime(date: string) {
        return TimeUtils.convertToLocalTimeFormat(moment(date))
    }

    private hasDiscount(discounts: PaymentModel.DiscountItem[]) {
        return discounts.length > 0
    }

    private getVatDiscount(pItms: PaymentModel.PaymentItem[]) {
        return pItms.reduce((total, itm) => total + itm.discounts.reduce((subtotal, disItm) => subtotal + disItm.vat, 0), 0)
    }

    private getTaxDiscount(pItms: PaymentModel.PaymentItem[]) {
        return pItms.reduce((total, itm) => total + itm.discounts.reduce((subtotal, disItm) => subtotal + disItm.tax, 0), 0)
    }

    private displayVatDiscount(pItms: PaymentModel.PaymentItem[]) {
        const total = this.getVatDiscount(pItms)
        return this.displayAmount(total)
    }

    private displayTaxDiscount(pItms: PaymentModel.PaymentItem[]) {
        const total = this.getTaxDiscount(pItms)
        return this.displayAmount(total)
    }

    private getTotalPrice(pDetail: PaymentModel.PaymentDetail) {
        return pDetail.paymentItems.reduce((total, itm) => total + PaymentService.calculatePaymentHistoryItemPrice(itm), 0)
    }

    private displayTotalPrice(pDetail: PaymentModel.PaymentDetail) {
        const total = this.getTotalPrice(pDetail)
        return this.displayAmount(total)
    }

    private get getPaymentMethodIcon() {
        return PaymentService.getPaymentMethodByChannelKeyword(this.selectedInvoiceDetail.paymentChannel).icon
    }

    private get getPaymentMethodText() {
        return PaymentService.getPaymentMethodByChannelKeyword(this.selectedInvoiceDetail.paymentChannel).text
    }

    private get text() {
        return {
            baht: this.$t("baht").toString(),
            duedate: this.$t("invoice.duedate").toString(),
            invoice_no: this.$t("invoice.invoice_no").toString(),
            vat: this.$t("vat").toString(),
            vat_discount: this.$t("vat_discount").toString(),
            withholding_tax: this.$t("withholding_tax").toString(),
            withholding_tax_discount: this.$t("withholding_tax_discount").toString(),
            total_payment: this.$t("total_payment").toString(),
            payment_channel: this.$t("payment_channel").toString(),
            download: this.$t("pages.payment_history.download").toString()
        }
    }
}
