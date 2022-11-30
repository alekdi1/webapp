import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import Step from "../../components/stepper/stepper.vue"
import { BranchModel, InvoiceModel } from "@/models"
import { InvoiceItem, InvoiceItemGroupByBranch } from "@/pages/dashboard/models"
import { EmployeeServices, VuexServices } from "@/services"
import { LanguageUtils, NumberUtils } from "@/utils"
import PAGE_NAME from "../page-name"

@Component({
    name: PAGE_NAME.confirm_payment,
    components: {
        "cpn-payment-stepper": Step
    }
})
export default class ConfirmPaymentPage extends Base {
    @VuexServices.Payment.VXSelectedInvoices()
    private selectedInvoices!: InvoiceModel.Invoice[]

    @VuexServices.Root.VXBranches()
    private selectedBranchList!: BranchModel.Branch[]

    private branchList!: BranchModel.Branch[]
    private groupedInvoices: InvoiceItemGroupByBranch[] = []
    private branchMaps = new Map<string, BranchModel.Branch>();

    private async mounted() {
        if (!this.selectedBranchList || this.selectedBranchList.length <= 0) {
            await this.getBranchList();
        } else {
            this.selectedBranchList.map(x => {
                this.branchMaps.set(x.code, x);
            })
        }
        this.groupSelectedInvoiceByBranch()
    }

    private get text() {
        return {
            confirm_payment: this.$t("pages.payment.confirm_payment").toString(),
            duedate: this.$t("invoice.duedate").toString(),
            invoice_no: this.$t("invoice.invoice_no").toString(),
            vat: this.$t("vat").toString(),
            withholding_tax: this.$t("withholding_tax").toString(),
            baht: this.$t("baht").toString(),
            vat_discount: this.$t("vat_discount").toString(),
            withholding_tax_discount: this.$t("withholding_tax_discount").toString(),
            total_payment: this.$t("total_payment").toString()
        }
    }

    private get invoices() {
        console.log("selectedInvoices ", this.selectedInvoices)
        const itms = this.selectedInvoices.map(itm => new InvoiceItem(itm)) || []
        return itms.filter(i => !i.isPartial)
    }

    private groupSelectedInvoiceByBranch() {
        const groupedInvoices: InvoiceItemGroupByBranch[] = []
        for (const invoice of this.invoices) {
            const invByBranch = new InvoiceItemGroupByBranch()
            if (groupedInvoices.find(i => i.branch.id === invoice.branchItm.id)) {
                const bidx = groupedInvoices.findIndex(j => j.branch.id === invoice.branchItm.id)
                groupedInvoices[bidx].invoices.push(invoice)
            } else {
                invByBranch.branch = invoice.branchItm
                invByBranch.invoices.push(invoice)
                groupedInvoices.push(invByBranch)
            }
            console.log(invByBranch)
        }
        this.groupedInvoices = groupedInvoices
        console.log("groupedInvoices ", this.groupedInvoices)
    }

    private displayTotalVatDiscount(itm: InvoiceItem) {
        const vd = itm.selectedItemsDiscounts.reduce((total, itm) => total + itm.vat, 0)
        return this.displayPrice(vd)
        // return this.displayPrice(itm.invoiceType != "invoice"?-Math.abs(vd):Math.abs(vd))
    }

    private displayTotalTaxDiscount(itm: InvoiceItem) {
        const td = itm.selectedItemsDiscounts.reduce((total, itm) => total + itm.tax, 0)
        
        return this.displayPrice(td)
        // return this.displayPrice(itm.invoiceType != "invoice"?-Math.abs(td):Math.abs(td))
    }

    private displayPrice(price: number) {
        return NumberUtils.getPriceFormat(price)
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

    private async getBranchList() {
        let branches = [...this.user.branchList];
        if (!this.user.isOwner) {
            const permission = this.user.permissions.find(
                p => p.permission === EmployeeServices.PERMISSIONS.payment
            );
            if (!permission) {
                throw new Error(
                    LanguageUtils.lang(
                        "คุณไม่มีสิทธิ์เข้าใช้งาน",
                        "You have no permission to use this feature"
                    )
                );
            }

            const mapBranch: { [x: string]: BranchModel.Branch } = {};
            for (const shop of permission.shops) {
                const code = shop.branch.code;
                if (code) {
                    let b = mapBranch[code];
                    if (!b) {
                        b = branches.find(ub => ub.code === code) || shop.branch;
                        mapBranch[code] = b;
                    }
                }
            }

            branches = Object.values(mapBranch);
        }
        this.branchList = branches;
        this.branchList.map(x => {
            this.branchMaps.set(x.code, x);
        })
        VuexServices.Root.setBranches(this.branchList);
    }
}
