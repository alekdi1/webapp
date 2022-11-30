import { LanguageUtils } from "@/utils"

export class The1Member {
    firstname = ""
    /** firstname_th */
    firstnameTh = ""
    lastname = ""
    /** lastname_th */
    lastnameTh = ""
    /** integration_status_code */
    integrationStatusCode = ""
    /** card_no */
    cardNo = ""
    /** point_balance */
    pointBalance = 0

    get displayFirstname() {
        return LanguageUtils.lang(this.firstnameTh, this.firstname)
    }

    get displayLastname() {
        return LanguageUtils.lang(this.lastnameTh, this.lastname)
    }

    get displayName() {
        return `${this.displayFirstname} ${this.displayLastname}`
    }
}

export class EarnRedeemData {
    /** the1_biz_reference_code */
    the1BizReferenceCode = ""
    /** transaction_id */
    transactionId = 0
    /** transaction_status */
    transactionStatus = ""
    /** qr_code */
    qrCode = ""
    /** marketing_message */
    marketingMessage = ""
    /** earn_data */
    earnData: EarnDataResponse = new EarnDataResponse()
    /** redeem_data */
    redeemData: RedeemDataResponse = new RedeemDataResponse()
    /** otp */
    otp: OTPDataResponse|null = null
    /** note */
    note: string|null = null
}

export class EarnDataResponse {
    /** earn_point */
    earnPoint = 0
    /** earn_rate */
    earnRate = 0
    /** earn_value */
    earnValue = 0
    /** receipt_no */
    receiptNo = ""
    /** created_at */
    // DDMMYYYY_HH:mm:ss:SSS
    createdAt = ""
}

export class RedeemDataResponse {
    /** redeemed_point */
    redeemedPoint = 0
    /** redeemed_rate */
    redeemedRate = 0
    /** redeemed_value */
    redeemedValue = 0
    /** integration_status_code */
    integrationStatusCode = ""
    /** source_trans_id */
    sourceTransId = ""
    /** receipt_no */
    receiptNo = ""
    /** siebel_redeem_receipt_no */
    siebelRedeemReceiptNo = ""
    /** transaction_no */
    transactionNo = ""
    /** transaction_product_name */
    transactionProductName = ""
    /** transaction_status */
    transactionStatus = ""
    /** transaction_redeem_point */
    transactionRedeemPoint = 0
    /** transaction_voucher_no */
    transactionVoucherNo = ""
    /** transaction_voucher_type */
    transactionVoucherType = ""
    /** transaction_voucher_desc */
    transactionVoucherDesc = ""
    /** created_at */
    // DDMMYYYY_HH:mm:ss:SSS
    createdAt = ""
}

export class OTPDataResponse {
    /** otp_ref_code */
    otpRefCode = ""
    /** card_no */
    cardNo = ""
    /** mobile_no */
    mobileNo = ""
    /** target_transaction_id */
    targetTransactionId = ""
    /** Integration_status_code */
    integrationStatusCode = ""
}

export class RewardConfig {
    bpNumber = ""
    branchCode = ""
    branchCode1Biz = ""
    branchName = ""
    createdDate = ""
    createdBy = {
        firstname: "",
        lastname: ""
    }
    earnRate = 0
    floorRoom = ""
    id = 0
    industryCode = ""
    industryName = ""
    isCpnCode = false
    isLimitUsePoint = false
    minPointEarn = 0
    minPointRedeem = 0
    partnerCode = ""
    partnerName = ""
    pointEarned = 0
    pointSpended = 0
    priority = 0
    redeemRate = 0
    remainingPoint = 0
    shopName = ""
    shopNumber = ""
    totalPoint = 0

    updatedDate = ""
    updatedBy = {
        firstname: "",
        lastname: ""
    }
    /** is_active */
    active = false

    effectiveDate = {
        /** effective_start_date
         * "YYYY-MM-DD"
        */
        start: "",

        /** effective_end_date
         * "YYYY-MM-DD"
        */
        end: ""
    }

}

export class RewardTransaction {

    /** id */
    id = 0

    /* transaction_id */
    transactionId = ""

    /** firstname */
    firstnameEn = ""

    /** firstname_th */
    firstnameTh = ""

    /** lastname */
    lastnameEn = ""

    /** lastname_th */
    lastnameTh = ""

    /** total_amount */
    totalAmount = 0

    /** status */
    status = ""

    /** created_at: 2021-07-15T15:06:29.000000Z */
    createdDate = ""

    /** redeemed_value */
    redeemedValue = 0

    /** redeemed_point คะแนนถูกหัก */
    redeemedPoint = 0 

    /** earn_value */
    earnValue = 0

    /** earn_point คะแนนรับเพิ่ม */
    earnPoint = 0

    /** created_by */
    createdBy = ""

    /** note */
    note = ""

    /** note_void */
    noteVoid = ""

    /** associate_transaction_id */
    associateId = ""

    /** card_no */
    the1CardNo = ""

    /** request_void_by */
    requestVoidBy = ""

    /** approved_rejected_void_by */
    approvedVoidBy = ""

    /** request_void_at: 2021-07-15 23:20:02 */
    requestVoidDate = ""

    /** approved_rejected_void_at */
    approvedVoidDate = ""

    get fullNameTh() {
        return `${ this.firstnameTh } ${ this.lastnameTh }`.trim()
    }

    get fullNameEn() {
        return `${ this.firstnameEn } ${ this.lastnameEn }`.trim()
    }
}
