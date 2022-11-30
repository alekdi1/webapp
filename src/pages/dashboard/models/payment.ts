import { LanguageUtils, NumberUtils } from "@/utils"
import moment from "moment"

export class PaymentSlip {
    status = ""
    shop = ""
    paymentId = ""
    invoiceId = ""
    totalAmount = 0
    vat = 0
    paymentDate = ""
    note = ""
    orderId = ""
    companyName = "บริษัท เซ็นทรัลพัฒนา จำกัด (มหาชน)"

    get displayTotalAmount () {
        return NumberUtils.getPriceFormat(this.totalAmount)
    }

    get displayPaymentDate () {
        if (!this.paymentDate) {
            return ""
        }
        const md = moment(this.paymentDate)
        return md.isValid() ? this.convertToLocalDateTimeFormat(md) : ""
    }

    private convertToLocalDateTimeFormat (date: moment.Moment) {
        const timeOption = LanguageUtils.lang("น.", "")
        return date.locale(LanguageUtils.getCurrentLang()).add(543, "year").format("ll HH.mm") + " " + timeOption
    }

    get displayVat () {
        return NumberUtils.getPriceFormat(this.vat)
    }
}