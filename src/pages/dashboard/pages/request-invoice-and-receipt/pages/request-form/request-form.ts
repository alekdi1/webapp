import { Component, Watch } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import MonthSelectedBtn from "@/components/month-select-btn.vue"
import { ROUTER_NAMES } from "@/router"
import { InvoiceModel, StoreModel, BranchModel } from "@/models"
import { BranchService, InvoiceServices, LogServices, PaymentService, StoreServices, VuexServices, EmployeeServices } from "@/services"
import { DialogUtils, NumberUtils, ValidateUtils, LanguageUtils } from "@/utils"
import moment from "moment"
import { Endpoints } from "@/config"
import { Invoice, InvoiceBranch, InvoiceShop, RequestInvoiceItem } from "@/models/invoice"

class RequestForm {
    type = ""
    email = ""
    isCombine = true

    get validateEmail() {
        return ValidateUtils.validateEmail(this.email)
    }
}

@Component({
    components: {
        "cpn-req-month-btn": MonthSelectedBtn
    }
})
export default class RequestFormPage extends Base {

    @VuexServices.Root.VXBranches()
    private selectedBranchList!: BranchModel.Branch[]

    @VuexServices.Payment.VXReqInvoiceForm()
    private requestForm!: InvoiceModel.RequestForm | null
    private stores: Store[] = [];
    private isLoading = false
    private isUpdating = false
    private isSelecting = false
    private reqForm = new RequestForm()
    private tabType = 0
    private receiptItems: InvoiceModel.RequestReceipt[] = []
    private invoiceItems: InvoiceModel.RequestInvoice[] = []
    private route = ROUTER_NAMES.request_form
    private userNo = ""
    private isLoadingAll = false;


    private branchList: BranchModel.Branch[] = []
    private branchMaps = new Map<string, BranchModel.Branch>();

    private async mounted() {
        if (!this.selectedBranchList || this.selectedBranchList.length <= 0) {
            await this.getBranchList();
        } else {
            this.selectedBranchList.map(x => {
                this.branchMaps.set(x.code, x);
            })
        }
        this.userNo = this.user.customerNo
        await this.getStores()
        LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onPageLoad"))
        let { requestForm } = this

        if (!requestForm) {
            this.isLoadingAll = true
            const stores = this.stores?.find(x => x.branch.id == this.$route.query.branch_id && x.shop.id == this.$route.params.store_id)
            console.log(stores)
            requestForm = new InvoiceModel.RequestForm();
            requestForm.branch = stores != undefined ? stores.branch : new InvoiceBranch();
            requestForm.shop = stores != undefined ? stores.shop : new InvoiceShop();
            requestForm.email = this.user.email;
            VuexServices.Payment.setReqInvoiceForm(requestForm)
            this.isLoadingAll = false;
        }

        // console.log(requestForm)
        // console.log(this.$route.params.store_id)
        // console.log(this.$route.query.branch_id)
        const branch_new = this.stores?.find(x => x.branch.id == this.$route.query.branch_id)
        // console.log(branch_new)
        requestForm.branch_new = branch_new != undefined ? branch_new.branch_new : new InvoiceBranch();
        requestForm.email = this.user.email
        this.reqForm.email = this.user.email
        this.getRequestItemList()
        LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onReady"))
        console.log("label_invoice --> ", this.text.label_invoice)
    }

    @Watch("tabType")
    private onTypeChange() {
        this.getRequestItemList()
    }

    private getInvoiceDiscounts(inv: RequestInvoiceItem | Invoice) {
        console.log(inv)

        const m: {
            [x: string]: {
                name: string
                value: string
            }
        } = {}

        const paymentItems = (inv instanceof RequestInvoiceItem) ? inv.paymentItems : inv.paymentDetail.paymentItems

        for (const pi of paymentItems) {
            for (const ds of pi.discounts) {
                const k = ds.documentNo + "-"
                    + ds.documentYear + "-"
                    + ds.value
                if (!m[k]) {
                    m[k] = {
                        name: ds.name,
                        value: this.displayPrice(ds.value)
                    }
                }
            }
        }

        return Object.values(m)
    }

    private getTotalInvoiceVatDiscount(inv: RequestInvoiceItem | Invoice) {
        const m: { [x: string]: number } = {}
        const paymentItems = (inv instanceof RequestInvoiceItem) ? inv.paymentItems : inv.paymentDetail.paymentItems
        for (const pi of paymentItems) {
            for (const ds of pi.discounts) {
                const k = ds.documentNo + "-"
                    + ds.documentYear + "-"
                    + ds.vat
                if (typeof m[k] !== "number") {
                    m[k] = ds.vat
                }
            }
        }

        // return inv.paymentItems.reduce((ps, pi) => ps + pi.discounts.reduce((pis, dc) => pis + dc.vat, 0) , 0)
        return Object.values(m).reduce((s, a) => s + a, 0)
    }

    private getTotalInvoiceTaxDiscount(inv: RequestInvoiceItem | Invoice) {
        const paymentItems = (inv instanceof RequestInvoiceItem) ? inv.paymentItems : inv.paymentDetail.paymentItems
        const m: { [x: string]: number } = {}

        for (const pi of paymentItems) {
            for (const ds of pi.discounts) {
                const k = ds.documentNo + "-"
                    + ds.documentYear + "-"
                    + ds.tax
                if (typeof m[k] !== "number") {
                    m[k] = ds.tax
                }
            }
        }

        // return inv.paymentItems.reduce((ps, pi) => ps + pi.discounts.reduce((pis, dc) => pis + dc.tax, 0) , 0)
        return Object.values(m).reduce((s, a) => s + a, 0)
    }

    private getTotalInvoiceVat(inv: RequestInvoiceItem | Invoice) {
        const paymentItems = (inv instanceof RequestInvoiceItem) ? inv.paymentItems : inv.paymentDetail.paymentItems
        return paymentItems.reduce((sum, pi) => sum + pi.vat, 0)
    }

    private getTotalInvoiceTax(inv: RequestInvoiceItem | Invoice) {
        const paymentItems = (inv instanceof RequestInvoiceItem) ? inv.paymentItems : inv.paymentDetail.paymentItems
        return paymentItems.reduce((sum, pi) => sum + pi.tax, 0)
    }
    private monthDiff(d1: Date, d2: Date) {
        let months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    private test(d1: Date, d2: Date) {
        const diff = this.monthDiff(d1, d2);
        return diff;
    }
    private groupReceipt(receipts: InvoiceModel.Receipt[]) {
        const newReceipts: InvoiceModel.RequestReceipt2[] = []
        console.log(receipts)
        // for (let index = 0; index < 6; index++) {
        //     const year = String(moment().subtract(index, 'months').format('YYYY'))
        //     const month = Number(moment().subtract(index, 'months').format("M"))
        //     const receiptItem: InvoiceModel.RequestReceiptItem = new InvoiceModel.RequestReceiptItem()
        //     const yearObj = newReceipts.find(yItm => yItm.year === year)
        //     console.log(receiptItem)
        //     console.log(newReceipts)
        //     console.log(yearObj)
        //     // ----------- No match year yet -----------
        //     if (!yearObj) {
        //         const newReceipt = new InvoiceModel.RequestReceipt2()
        //         newReceipt.year = year
        //         const newMonth = new InvoiceModel.RequestReceiptMonth()
        //         newMonth.id = month
        //         newMonth.selected = false
        //         newMonth.receipts.push(receiptItem)
        //         newReceipt.months.push(newMonth)
        //         newReceipts.push(newReceipt)
        //         continue
        //     }

        //     // -------------- Match year -------------
        //     const monthObj = yearObj.months.find(mItm => mItm.id === month)
        //     console.log(monthObj)
        //     console.log(month)
        //     if (!monthObj) {
        //         console.log('month')
        //         const newMonth = new InvoiceModel.RequestReceiptMonth()
        //         newMonth.id = month
        //         newMonth.selected = false
        //         const dummy = receipts.find(e => moment(e.clearingDate).format('YYYY') == year && Number(moment(e.clearingDate).format('M')) == month)
        //         if (dummy) {
        //             receiptItem.compCode = dummy.compCode
        //             receiptItem.documentNo = dummy.receiptNo
        //             receiptItem.clearingYear = dummy.clearingYear
        //             receiptItem.invoices = dummy.invoiceItems
        //         }
        //         newMonth.receipts.push(receiptItem)
        //         yearObj.months.push(newMonth)
        //         continue
        //     }

        //     monthObj.receipts.push(receiptItem)
        // }
        for (const item of receipts) {
            const year = item.clearingYear
            const month = Number(moment(item.clearingDate).format("M"))
            const receiptItem: InvoiceModel.RequestReceiptItem = new InvoiceModel.RequestReceiptItem()
            receiptItem.compCode = item.compCode
            receiptItem.documentNo = item.receiptNo
            receiptItem.clearingYear = item.clearingYear
            receiptItem.invoices = item.invoiceItems
            const yearObj = newReceipts.find(yItm => yItm.year === year)
            // ----------- No match year yet -----------
            if (this.test(new Date(year + '-' + month), new Date()) < 6) {
                if (!yearObj) {
                    const newReceipt = new InvoiceModel.RequestReceipt()
                    newReceipt.year = year
                    const newMonth = new InvoiceModel.RequestReceiptMonth()
                    newMonth.id = month
                    newMonth.selected = false
                    newMonth.receipts.push(receiptItem)
                    newReceipt.months.push(newMonth)
                    newReceipts.push(newReceipt)
                    continue
                }

                // -------------- Match year -------------
                const monthObj = yearObj.months.find(mItm => mItm.id === month)
                if (!monthObj) {
                    const newMonth = new InvoiceModel.RequestReceiptMonth()
                    newMonth.id = month
                    newMonth.selected = false
                    newMonth.receipts.push(receiptItem)
                    yearObj.months.push(newMonth)
                    continue
                }

                monthObj.receipts.push(receiptItem)
            }
        }

        return newReceipts
    }

    private async getRequestItemList() {
        this.isLoading = true
        try {
            console.log('receipts')
            if (this.requestForm?.branch.id && this.requestForm?.shop.id) {
                const branchId = this.requestForm.branch.id || ""
                const shopId = this.requestForm.shop.id
                const industryCode = this.requestForm.shop.industryCode
                console.log(this.requestForm.shop)
                if (this.isReceipt) {
                    LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallStart", Endpoints.getRequestReceiptList))
                    const receipts = await InvoiceServices.getRequestReceiptList(branchId, shopId, this.user.customerNo, industryCode)
                    LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallFinsih", Endpoints.getRequestReceiptList))
                    console.log(receipts)
                    this.receiptItems = this.groupReceipt(receipts)
                } else {
                    LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallStart", Endpoints.getRequestInvocieList))
                    this.invoiceItems = await InvoiceServices.getRequestInvoiceList(branchId, shopId, this.user.customerNo,industryCode)
                    console.log(this.invoiceItems)
                    LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallFinsih", Endpoints.getRequestInvocieList))
                }
            }
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e })
        }
        this.isLoading = false
    }

    private async selectedRequest() {
        this.isUpdating = true

        let { requestForm } = this
        if (!requestForm) {
            requestForm = new InvoiceModel.RequestForm()
        } else {
            requestForm = Object.assign(new InvoiceModel.RequestForm(), requestForm)
        }
        requestForm.email = this.reqForm.email
        requestForm.type = this.formType
        requestForm.fileType = this.reqForm.isCombine ? "combined" : "separated"

        if (this.invoiceItems.length > 0) {
            requestForm.requestItms = this.invoiceItems.map(yItm => {
                const reqInv = new InvoiceModel.RequestInvoice()
                reqInv.year = yItm.year
                reqInv.months = yItm.months.filter(mItm => mItm.selected)
                return reqInv
            })
        }

        if (this.receiptItems.length > 0) {
            requestForm.requestItms = this.receiptItems.map(yItm => {
                const reqRecp = new InvoiceModel.RequestReceipt()
                reqRecp.year = yItm.year
                reqRecp.months = yItm.months.filter(mItm => mItm.selected)
                return reqRecp
            })
        }
        this.isSelecting = requestForm.requestItms.some((i: InvoiceModel.RequestInvoice | InvoiceModel.RequestReceipt) => i.months.length > 0)
        await VuexServices.Payment.setReqInvoiceForm(requestForm)
        this.isUpdating = false
    }

    private clearStoredData() {
        this.invoiceItems = []
        this.receiptItems = []
    }

    private get storeId() {
        return this.$route.params.store_id
    }

    private get formType() {
        return this.isReceipt ? "receipt" : "invoice"
    }

    private get isReceipt() {
        return this.tabType === 1
    }

    private getDateFromYearAndMonth(yearId: number, monthId: number) {
        return moment(`${yearId} ${monthId}`, "YYYY M")
    }

    private toggleRequestForm() {
        this.reqForm.type = this.formType
    }

    private async toggleIsCombine(isCombine: boolean) {
        this.reqForm.isCombine = isCombine
        await this.selectedRequest()
    }

    private async toggleSelectedMonth(mItem: InvoiceModel.RequestInvoiceMonth) {
        mItem.selected = !mItem.selected
        await this.selectedRequest()
    }

    private totalPrice(itms: InvoiceModel.InvoicePaymentItem[]) {
        return itms.reduce((total, itm) => total + PaymentService.calculatePaymentItemPrice(itm), 0)
    }

    private displayTotalPrice(itms: InvoiceModel.InvoicePaymentItem[]) {
        const total = this.totalPrice(itms)
        return this.displayPrice(total)
    }

    private displayPrice(price: number) {
        return NumberUtils.getPriceFormat(price)
    }

    private displayYear(year: string) {
        return moment(year, "YYYY").add(543, "year").format("YYYY")
    }

    private get isEmpty() {
        return this.isReceipt ? this.receiptItems.length <= 0 : this.invoiceItems.length <= 0
    }

    private get disabledContinueBtn() {
        return this.isUpdating || this.isLoading || !this.isSelecting || this.isEmpty || !this.reqForm.validateEmail
    }

    private displayMasterBranch2(branchCode: string) {
        let code = "";
        if (branchCode === "PK1") {
            code = "PKT";
        } else if (branchCode === "PKT") {
            code = "PK2";
        } else {
            code = branchCode;
        }
        const branch = this.branchMaps.has(code) ? this.branchMaps.get(code) : null;
        return {
            id:branchCode,
            nameEn:branch?.nameEn||"",
            nameTh:branch?.nameTh||"",
        };
    }


    private async getStores() {
        this.isLoading = true
        try {
            //newapi invoice
            const invoiceList = await InvoiceServices.getBranchShopList( this.user.customerNo,[{
                branchId:  this.$route.query.branch_id}])
            // const invoiceList = await InvoiceServices.getInvoiceList([], this.user.customerNo)
            const storeWithBranchRaw = invoiceList.map((i: InvoiceModel.Invoice) => {
                const dummy = this.displayMasterBranch2(i.branch.id)
                return mapStoreFromInvoice(i,dummy)
            })
            const storeWithBranchFilter: Store[] = []
            for (const item of storeWithBranchRaw) {
                const k = item.shop.id + item.branch.id + item.branch_new.id
                const idx = storeWithBranchFilter.findIndex(d => d.shop.id + d.branch.id + d.branch_new.id === k)
                if (idx < 0) {
                    storeWithBranchFilter.push(item)
                }
            }
            // const userContacts = await UserServices.getContact(this.user.customerNo)
            this.stores = storeWithBranchFilter
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e })
        }
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
    private get text() {
        return {
            title: this.$t("pages.req_inv_n_recp.title").toString(),
            label_invoice: this.$t("pages.req_inv_n_recp.label_invoice").toString(),
            label_receipt: this.$t("pages.req_inv_n_recp.label_receipt").toString(),
            validate_email: this.$t("pages.req_inv_n_recp.validate_email").toString(),
            label_inv_no: this.$t("pages.req_inv_n_recp.label_inv_no").toString(),
            label_recp_no: this.$t("pages.req_inv_n_recp.label_recp_no").toString(),
            label_recp_info: this.$t("pages.req_inv_n_recp.label_recp_info").toString(),
            label_inv_info: this.$t("pages.req_inv_n_recp.label_inv_info").toString(),
            req_full_cont: this.$t("pages.req_inv_n_recp.req_full_cont").toString(),
            req_sep_cont: this.$t("pages.req_inv_n_recp.req_sep_cont").toString(),
            label_req_recp_cont_info: this.$t("pages.req_inv_n_recp.label_req_recp_cont_info").toString(),
            label_req_inv_cont_info: this.$t("pages.req_inv_n_recp.label_req_inv_cont_info").toString(),
            continue: this.$t("pages.req_inv_n_recp.continue").toString(),
            transaction_no: this.$t("transaction_no").toString(),
            total_payment: this.$t("total_payment").toString(),
            baht: this.$t("baht").toString(),
            email: this.$t("email").toString(),
            vat: this.$t("vat").toString(),
            vat_discount: this.$t("vat_discount").toString(),
            withholding_tax: this.$t("withholding_tax").toString(),
            withholding_tax_discount: this.$t("withholding_tax_discount").toString(),
        }
    }

    private goToSummary() {
        this.selectedRequest()
        this.$router.push({
            name: ROUTER_NAMES.request_summary,
            params: {
                store_id: this.storeId,
                type: this.formType
            }
        })
    }
}

function mapStoreFromInvoice (d: InvoiceModel.Invoice, d2: any) {
    const s = new Store()
    s.shop = d.shop
    s.branch = d.branch
    s.branch_new.id = d2.id
    s.branch_new.nameEn = d2.nameEn
    s.branch_new.nameTh = d2.nameTh
    return s
}


class Store {
    shop = new InvoiceModel.InvoiceShop()
    branch = new InvoiceModel.InvoiceBranch()
    branch_new = new InvoiceModel.InvoiceBranch()
}
