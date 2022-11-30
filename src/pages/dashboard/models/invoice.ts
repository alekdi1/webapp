import { InvoiceModel } from "@/models"
import { LanguageUtils } from "@/utils"
import moment from "moment"
import numeral from "numeral"
import { PaymentService } from "@/services"

export class PaymentItem {
    item: InvoiceModel.InvoicePaymentItem
    constructor(i: InvoiceModel.InvoicePaymentItem) {
        this.item = i
    }

    get id() {
        return this.item.id
    }

    get displayPrice() {
        return numeral(this.item.price).format("0,0.00")
    }

    get desc() {
        return this.item.desc
    }

    get name() {
        return this.item.name
    }

    get selected() {
        return this.item.selected
    }

    get vat() {
        return this.item.vat
    }

    get tax() {
        return this.item.tax
    }

    get price() {
        return this.item.price
    }

    get invoiceId() {
        return this.item.documentNo
    }
}

export class InvoiceItem {
    item: InvoiceModel.Invoice

    constructor(iv: InvoiceModel.Invoice) {
        this.item = iv
    }

    get id() {
        return this.item.id
    }

    get displayDueDate() {
        const md = this.momentDueDate.locale(LanguageUtils.getCurrentLang())
        return LanguageUtils.isEn() ? md.format("DD MMM YYYY") : `${md.format("DD MMM")} ${md.year() + 543}`
    }

    get momentDueDate() {
        return moment(this.item.endDateTime)
    }

    get isOverDue() {
        return this.item.status === "overdue"
    }

    get shopName() {
        const { nameEn, nameTh, displayName } = this.item.shop
        return displayName || nameTh || nameEn || ""
    }

    get name() {
        return this.shopName
    }

    get displayBranch() {
        return LanguageUtils.lang("สาขา" + this.item.branchDescTH, this.item.branchDescEN + " branch")
    }

    get totalPrice() {
        return this.displayPrice(this.selectedPrice)
    }

    get totalInvoicePrice() {
        return this.displayPrice(this.invoicePrice)
    }

    get isPartial() {
        return this.item.isPartial
    }

    get selectedPrice() {
        const result = this.selectedItems.reduce((sum, cur) => sum + PaymentService.calculatePaymentItemPrice(cur.item), 0)
        return this.invoiceType != "invoice" ? -Math.abs(result) : Math.abs(result)
    }

    get invoicePrice() {
        const result = this.item.paymentDetail.paymentItems.reduce((sum, cur) => sum + PaymentService.calculatePaymentItemPrice(cur), 0)
        return this.invoiceType != "invoice" ? -Math.abs(result) : Math.abs(result)
    }

    get branch() {
        return this.item.branch.displayName
    }

    get branchItm() {
        return this.item.branch
    }

    get selectedItems() {
        return this.item.paymentDetail.paymentItems.filter(i => i.selected).map(i => new PaymentItem(i))
    }

    get items() {
        return this.item.paymentDetail.paymentItems.map(i => new PaymentItem(i))
    }

    get selectedItemsDiscounts() {
        const items = this.selectedItems
        let discounts: InvoiceModel.InvoicePaymentItemDiscount[] = []
        for (const item of items) {
            discounts = [...discounts, ...item.item.discounts]
        }
        return discounts
    }

    get selectedTotalVat() {
        return this.selectedItems.reduce((sum, item) => sum + item.item.vat, 0)
    }

    get selectedTotalTax() {
        return this.selectedItems.reduce((sum, item) => sum + item.item.tax, 0)
    }

    displayPrice(val: number) {
        return numeral(val).format("0,0.00")
    }

    get uniqueId() {
        return this.item.uniqueId
    }

    get taxCode() {
        return this.item.taxCode
    }

    get invoiceReference() {
        return this.item.invoiceReference
    }

    get compCode() {
        return this.item.compCode
    }

    get businessArea() {
        return this.item.businessArea
    }

    get invoiceType() {
        return checkTypeInvoices(this.item);
    }

    get invoiceDesc() {
        const desc = checkTypeInvoices(this.item);
        if (desc == "invoice") {
            // return "ใบแจ้งหนี้"
            return LanguageUtils.lang("ใบแจ้งหนี้","Invoice")
        }
        if (desc == "invoicesTypeDiscount") {
            // return ""
            return LanguageUtils.lang("ใบลดหนี้/ใบแจ้งหนี้","Credit Note/Invoice")
        }
        if (desc == "invoicesTypeDiscountReceipt") {
            // return ""
            return LanguageUtils.lang("ใบลดหนี้/ใบเสร็จรับเงิน","Credit Note/Receipts")
        }
        if (desc == "invoicesTypeDiscountTax") {
            // return ""
            return LanguageUtils.lang("ใบลดหนี้/ใบกำกับภาษี","Credit Note/Tax Invoice")
        }
    }

    get branchCode() {
        return this.item.branch.id;
    }
}

export class InvoiceItemGroupByBranch {
    branch = new InvoiceModel.InvoiceBranch()
    invoices: InvoiceItem[] = []
}

function checkTypeInvoices(invoice: InvoiceModel.Invoice): string {
    if (invoice.id.startsWith("101") && invoice.invoiceReference.startsWith("101") ||
        invoice.id.startsWith("110") && invoice.invoiceReference.startsWith("110") ||
        invoice.id.startsWith("201") && invoice.invoiceReference.startsWith("201") ||
        invoice.id.startsWith("251") && invoice.invoiceReference.startsWith("251") ||
        invoice.id.startsWith("992") && invoice.invoiceReference.startsWith("992")) {
        return "invoice"
    }

    //ใบลดหนี้/แจ้งหนี้ 
    if (invoice.id.startsWith("15") && invoice.invoiceReference.startsWith("11") ||
        invoice.id.startsWith("15") && invoice.invoiceReference.startsWith("992") ||
        invoice.id.startsWith("213")) {
        return "invoicesTypeDiscount"
    }

    //ใบลดหนี้/ใบเสร็จรับเงิน
    if (invoice.id.startsWith("15") && invoice.invoiceReference.startsWith("231") ||
        invoice.id.startsWith("15") && invoice.invoiceReference.startsWith("233") ||
        invoice.id.startsWith("211")) {
        return "invoicesTypeDiscountReceipt"
    }

    //ใบลดหนี้/ใบกำกับภาษี
    if (invoice.id.startsWith("15") && invoice.invoiceReference.startsWith("230") ||
        invoice.id.startsWith("15") && invoice.invoiceReference.startsWith("232") ||
        invoice.id.startsWith("212")) {
        return "invoicesTypeDiscountTax"
    }
    return "";
}