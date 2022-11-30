import { LanguageUtils } from "@/utils"
import { InvoiceShop, InvoiceBranch } from "./invoice"
import { Branch } from "./branch"

export class BankService {
    id = ""
    nameTh = ""
    nameEn = ""
    channelCode = ""
    channelName = ""
    methodNo = ""
    Hidebankname = false
    images: string[] = []

    get image() {
        return this.images[0] || ""
    }

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}

interface BankServices {
    credit_card?: BankService
    thai_qr?: BankService
    wechatpay?: BankService
    bank_app?: BankService
    push_noti?: BankService
    internet_banking?: BankService
    atm?: BankService
    promptpay?: BankService
    cash?: BankService
    cheque?: BankService
    unionpay?: BankService
}

export class EmailReceipt {
    ccEmails: string[] = []
    emails: string[] = []
}

export class BankInstruction {
    title = ""
    steps: string[] = []
}

export class Bank {
    id = ""
    nameEn = ""
    nameTh = ""
    image = ""
    url = ""
    instructions: BankInstruction[] = []
    instructionNote = ""

    services: BankServices = {}

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}

export class DiscountItem {
    id = ""
    documentNo = ""
    documentYear = 0
    itemNo = ""
    name = ""
    description = ""
    value = 0
    vat = 0
    tax = 0
}

export class PaymentItem {
    id = ""
    documentNo = ""
    documentYear = 0
    itemNo = ""
    name = ""
    checked = false
    description = ""
    value = 0
    vat = 0
    tax = 0
    discounts: DiscountItem[] = []
}

export class PaymentDetail {
    total = 0
    discount = 0
    vat = 0
    tax = 0
    paymentItems: PaymentItem[] = []
}

export class PaymentInvoiceItem {
    invoiceId = ""
    invoiceYear = 0
    description = ""
    status = ""
    createDateTime = ""
    createDate = ""
    endDateTime = ""
    endDate = ""
    checked = false
    compCode = ""
    businessArea = ""
    isPartial = false

    branch: InvoiceBranch = new InvoiceBranch()

    shop: InvoiceShop = new InvoiceShop()

    paymentDetail = new PaymentDetail()
}

export class PaymentTransactionItem {
    refKey = ""
    paymentDate = ""
    paymentChannel = ""
    paymentMethod = ""
    paymentStatus = ""
    locationCode = ""
    note = ""

    billPayment = {
        paymentAmount: 0,
        ref1: "",
        ref2: ""
    }

    invoices: PaymentInvoiceItem[] = []
    // generate unique item id
    uniqueId = ""
}

export class PaymentMethod {
    bank?: Bank|null
    service?: BankService|null
    branch?: Branch
    note = ""
    emailreceipt?: EmailReceipt
}

export class PromptpayState {
    loading = false
    phone = ""
    price = 0
}

export class SelectTypeReceipt {
    branch = false
    email = false
    ishasReceiptemail = false
    isChooseOnlinePayment = false;
}
