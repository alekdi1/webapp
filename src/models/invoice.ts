import { LanguageUtils } from "@/utils"


export class InvoicePaymentItem {
    /** id */
    id = ""

    /** name */
    name = ""

    /** description */
    desc = ""

    /** value */
    price = 0

    /** vatValue */
    vat = 0

    /** taxValue */
    tax = 0

    /** documentNo */
    documentNo = ""

    /** documentYear */
    documentYear = 0

    /** itemNo */
    itemNo = ""

    /** discounts */
    discounts: InvoicePaymentItemDiscount[] = []

    /** checked */
    checked = false

    selected = true

    invoiceUniqueId = ""

    isDiscount = false

    readonly rawData: any
}

export class InvoicePaymentItemDiscount {

    /** id */
    id = ""

    /** documentNo */
    documentNo = ""

    /** documentYear */
    documentYear = 0

    /** itemNo */
    itemNo = ""

    /** name */
    name = ""

    /** description */
    desc = ""

    /** value */
    value = 0

    /** vatValue */
    vat = 0

    /** taxValue */
    tax = 0
}

export class InvoiceBranch {

    /** branchId */
    id = ""

    /** nameEN */
    nameEn = ""

    /** nameTH */
    nameTh = ""

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }

    get displayIdAsName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn) ? LanguageUtils.lang(this.nameTh, this.nameEn) : this.id
    }
}

export class InvoiceShop {

    /** shopId */
    id = ""

    /** nameEN */
    nameEn = ""

    /** nameTH */
    nameTh = ""

    industryCode = ""

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }

    get displayIdAsName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn) ? LanguageUtils.lang(this.nameTh, this.nameEn) : this.id
    }
}

export class InvoicePaymentDetail {

    /** total */
    total = 0

    /** discount */
    discount = 0

    /** vatValue */
    vat = 0

    /** taxValue */
    tax = 0

    /** paymentItems */
    paymentItems: InvoicePaymentItem[] = []
}

export class Invoice {

    /** invoiceId */
    id = ""

    /** invoiceYear */
    year = 0

    /** branch */
    branch = new InvoiceBranch()

    /** branch new */
    branch_new = new InvoiceBranch()

    /** shop */
    shop = new InvoiceShop()

    /** description */
    description = ""

    /** status */
    status = ""

    /** paymentDetail */
    paymentDetail = new InvoicePaymentDetail()

    /** 
     * createDateDateTime 
     * 
     * Ex : "2014-03-01T00:00:00+07:00"
     * */
    createdDateTime = ""


    /** 
     * createDate
     * 
     * Ex: "2014-03-01T00:00:00"
     */
    createdDate = ""

    /**
     * endDateDateTime
     * 
     * Ex : "2014-03-01T00:00:00+07:00"
     */
    endDateTime = ""

    /** 
    * endDate
    * 
    * Ex: "2014-03-01T00:00:00"
    */
    endDate = ""

    /** checked */
    checked = false

    /** compCode */
    compCode = ""

    /** businessArea */
    businessArea = ""

    /** isPartial */
    isPartial = false

    /** isDiscount */
    isDiscount = false

    uniqueId = ""

    taxCode = ""

    invoiceReference = ""

    branchDescTH = ""

    branchDescEN = ""
}

export class Branchshop {

    /** invoiceId */
    id = ""

    /** invoiceYear */
    year = 0

    /** branch */
    branch = new InvoiceBranch()

    /** branch new */
    branch_new = new InvoiceBranch()

    /** shop */
    shop = new InvoiceShop()

    /** description */
    description = ""

    /** status */
    status = ""

    /** paymentDetail */
    paymentDetail = new InvoicePaymentDetail()

    /** 
     * createDateDateTime 
     * 
     * Ex : "2014-03-01T00:00:00+07:00"
     * */
    createdDateTime = ""


    /** 
     * createDate
     * 
     * Ex: "2014-03-01T00:00:00"
     */
    createdDate = ""

    /**
     * endDateDateTime
     * 
     * Ex : "2014-03-01T00:00:00+07:00"
     */
    endDateTime = ""

    /** 
    * endDate
    * 
    * Ex: "2014-03-01T00:00:00"
    */
    endDate = ""

    /** checked */
    checked = false

    /** compCode */
    compCode = ""

    /** businessArea */
    businessArea = ""

    /** isPartial */
    isPartial = false

    /** isDiscount */
    isDiscount = false

    uniqueId = ""

    taxCode = ""

    invoiceReference = ""

    branchDescTH = ""

    branchDescEN = ""
}

export class Receipt {
    /** companyCode */
    compCode = ""

    /** businessArea */
    businessArea = ""

    /** companyName */
    compNameEn = ""

    /** companyNameTh */
    compNameTh = ""

    /** receiptNo */
    receiptNo = ""

    /** clearingYear */
    clearingYear = ""

    /** clearingDate */
    clearingDate = ""

    /** data */
    invoiceItems: Invoice[] = []
}

export class RequestPaymentDetail {

    /** total */
    total = 0

    /** discount */
    discount = 0

    /** vatValue */
    vat = 0

    /** taxValue */
    tax = 0
}

export class RequestInvoiceItem {

    /** invoiceId */
    id = ""

    /** compCode */
    compCode = ""

    /** businessArea */
    businessArea = ""

    /** checked */
    checked = false

    /** paymentDetail */
    paymentDetail = new RequestPaymentDetail()

    /** paymentItems */
    paymentItems: InvoicePaymentItem[] = []
}

export class RequestInvoiceMonth {

    /** monthId */
    id = 0

    /** checked */
    checked = false

    /** invoiceList */
    invoices: RequestInvoiceItem[] = []

    selected = false
}

export class RequestInvoice {
    year = 0
    months: RequestInvoiceMonth[] = []
    get orderMonths() {
        for (let i = 0; i < this.months.length; i++) {
            for (let j = i + 1; j < this.months.length; j++) {
                if (this.months[i].id > this.months[j].id) {
                    let temp = new RequestInvoiceMonth();
                    temp = this.months[i];
                    this.months[i] = this.months[j];
                    this.months[j] = temp;
                }
            }
        }
        return this.months
    }
}

export class RequestInvoice2 {
    year = 0
    months: RequestInvoiceMonth[] = []
    get orderMonths() {
        for (let i = 0; i < this.months.length; i++) {
            for (let j = i + 1; j < this.months.length; j++) {
                if (this.months[i].id < this.months[j].id) {
                    let temp = new RequestInvoiceMonth();
                    temp = this.months[i];
                    this.months[i] = this.months[j];
                    this.months[j] = temp;
                }
            }
        }
        return this.months
    }
}

export class RequestReceiptItem {
    compCode = ""
    documentNo = ""
    clearingYear = ""
    invoices: Invoice[] = []
}

export class RequestReceiptMonth {
    id = 0
    selected = false
    receipts: RequestReceiptItem[] = []
}

export class RequestReceipt {
    year = ""
    months: RequestReceiptMonth[] = []
    get orderMonths() {
        for (let i = 0; i < this.months.length; i++) {
            for (let j = i + 1; j < this.months.length; j++) {
                if (this.months[i].id > this.months[j].id) {
                    let temp = new RequestReceiptMonth();
                    temp = this.months[i];
                    this.months[i] = this.months[j];
                    this.months[j] = temp;
                }
            }
        }
        return this.months
    }
}
export class RequestReceipt2 {
    year = ""
    months: RequestReceiptMonth[] = []
    get orderMonths() {
        for (let i = 0; i < this.months.length; i++) {
            for (let j = i + 1; j < this.months.length; j++) {
                if (this.months[i].id < this.months[j].id) {
                    let temp = new RequestReceiptMonth();
                    temp = this.months[i];
                    this.months[i] = this.months[j];
                    this.months[j] = temp;
                }
            }
        }
        return this.months
    }
}

export class RequestForm {
    requestItms: RequestInvoice[] | RequestReceipt[] = []
    branch: InvoiceBranch = new InvoiceBranch()
    branch_new: InvoiceBranch = new InvoiceBranch()
    shop: InvoiceShop = new InvoiceShop()
    email = ""
    type = ""
    fileType = ""
}
