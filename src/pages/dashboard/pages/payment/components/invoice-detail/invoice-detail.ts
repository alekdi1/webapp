import { Component, Prop, Vue } from "vue-property-decorator"
import { BranchModel, InvoiceModel } from "@/models"
import { InvoiceItem, PaymentItem } from "@/pages/dashboard/models"
import { VuexServices } from "@/services"
import { LanguageUtils, NumberUtils } from "@/utils"

@Component
export default class PaymentDetailCMP extends Vue {
    @Prop({ default: [] })
    private invoices!: InvoiceItem[]

    @VuexServices.Payment.VXSelectedInvoices()
    private selectedInvoices!: InvoiceModel.Invoice[]

    @VuexServices.Root.VXBranches()
    private branchList!: BranchModel.Branch[]

    private branchMaps = new Map<string, BranchModel.Branch>();

    private get text() {
        return {
            payment_detail: this.$t("pages.payment.payment_detail").toString(),
            duedate: this.$t("invoice.duedate").toString(),
            baht: this.$t("baht").toString(),
            total_payment: this.$t("total_payment").toString(),
            vat: this.$t("vat").toString(),
            vat_discount: this.$t("vat_discount").toString(),
            withholding_tax: this.$t("withholding_tax").toString(),
            withholding_tax_discount: this.$t("withholding_tax_discount").toString(),
            invoice_no: this.$t("invoice.invoice_no").toString(),
            label_cpn_payment_info: this.$t("pages.payment.label_cpn_payment_info").toString(),
            payment_amount: this.$t("payment_amount").toString()
        }
    }

    // @Watch("invoices", { immediate: true, deep: true })
    // private onInvoicesChange() {
    //     this.invoices
    // }

    private async mounted() {
        this.branchList.map(x => {
            this.branchMaps.set(x.code, x);
        })
    }

    private get isEmpty() {
        return this.invoices.length > 0
    }

    private get totalSelectedItems() {
        const itms = this.selectedInvoices.map(v => new InvoiceItem(v)) || []
        return itms.filter(i => !i.isPartial)
        // return itms
    }

    private get totalVat() {
        return this.totalSelectedItems.reduce((total, inv) => total + inv.selectedTotalVat, 0)
    }

    private get totalTax() {
        return this.totalSelectedItems.reduce((total, inv) => total + ( inv.selectedTotalTax +  inv.selectedItemsDiscounts.reduce((subtotal, itm) => subtotal + itm.tax, 0)), 0)
        // return this.totalSelectedItems.reduce((total, inv) => total + inv.selectedTotalTax, 0)
    }

    private get totalVatDiscount() {
        return this.totalSelectedItems.reduce((total, inv) => total + inv.selectedItemsDiscounts.reduce((subtotal, itm) => subtotal + itm.vat, 0), 0)
    }

    private get totalTaxDiscount() {
        return this.totalSelectedItems.reduce((total, inv) => total + inv.selectedItemsDiscounts.reduce((subtotal, itm) => subtotal + itm.tax, 0), 0)
    }

    private get totalPrice() {
        return this.totalSelectedItems.reduce((total, inv) => total + inv.selectedPrice, 0)
    }

    private get paymentAmount() {
        console.log(this.totalSelectedItems)
        let price = 0.0
        let discount = 0.0
        this.totalSelectedItems.forEach(element => {
            price += element.selectedItems.reduce((total, inv) => total + inv.price, 0)
            discount += element.selectedItemsDiscounts.reduce((total, inv) => total + inv.value, 0)
        });
        return price + discount
        // return this.totalSelectedItems.reduce((total, inv) => total + (inv.selectedPrice - inv.selectedTotalVat - inv.selectedTotalTax), 0)
    }

    private displayPrice(price: number) {
        console.log(price)
        return NumberUtils.getPriceFormat(price)
    }

    private async toggleSelectItem(paymentItm: PaymentItem) {
        console.log("paymentItm ", paymentItm)
        const selectedInvoices = [...this.selectedInvoices]

        const idx = selectedInvoices.findIndex(i => i.uniqueId === paymentItm.item.invoiceUniqueId)
        if (idx > -1) {
            const currentInvoice = selectedInvoices[idx]
            const item = Object.assign(new InvoiceModel.Invoice(), currentInvoice)
            item.paymentDetail.paymentItems = [...item.paymentDetail.paymentItems]

            const itemIdx = item.paymentDetail.paymentItems.findIndex(d => d.id === paymentItm.id)
            if (itemIdx > -1) {
                const paymentItem = Object.assign(new InvoiceModel.InvoicePaymentItem(), item.paymentDetail.paymentItems[itemIdx])
                paymentItem.selected = !item.paymentDetail.paymentItems[itemIdx].selected
                item.paymentDetail.paymentItems[itemIdx] = paymentItem

                selectedInvoices[idx] = item
                await VuexServices.Payment.setSelectedInvoices(selectedInvoices)
            }
        }
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
}
