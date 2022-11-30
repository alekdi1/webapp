import { RewardModel } from "@/models"
import ApiClient from "@/modules/api"
import { Endpoints, App as AppConfig } from "@/config"
import { DialogUtils, LanguageUtils, StorageUtils } from "@/utils"
import moment from "moment"
import qs from "querystring"
import { StoreModel } from "@/models"
import cryptoJs from "crypto-js"

const REWARDS_EARN_REDEEM_DATA_KEY = "EARN_REDEEM_DATA"
const IS_DISABLED_REWARDS = false;

export const ERROR_CODE = {
    success: "00",
    pointNotEnough: "13",
    pointServiceNotAvailable: "78",
    memberNotFound: "406",
    multipleMemberFound: "26",
    otpInvalid: "406"
}

export const TRANSACTION_STATUS = {
    pending: "pending",

    /** ยกเลิกรายการสำเร็จ (สีเขียว) >> ไม่มีปุ่ม */
    voided: "voided",

    /** คำขอยกเลิกถูกปฏิเสธ (สีแเดง)  >> ขอยกเลิกรายการใหม่อีกครั้ง สามารถกดกี่ครั้งก้ได้ ไม่มี ลิมิต) */
    void_rejected: "void_rejected",

    /** คำขอยกเลิกรออนุมัติ (สีเหลือง) >> ไม่มีปุ่ม */
    request_void: "request_void",

    created: "created",

    canceled: "canceled"
}

export const SUMMARY_TYPES = {
    earn_and_redeem_summary: "earn_and_redeem_summary",
    list_summary: "list_summary",
    sales_summary: "sales_summary",
    cancellations_summary: "cancellations_summary"
}

export async function getRewardConfigs(bpNumber: string, branchCode: string, industryCode: string, shopNumber: string, floorRoom: string) {
    const { method, url } = Endpoints.getRewardConfigs

    const query = qs.stringify({
        bp_number: bpNumber,
        branch_code: branchCode,
        industry_code: industryCode,
        shop_number: shopNumber,
        floor_room: floorRoom
    })

    const rs = await ApiClient.request({
        method,
        url: `${url}?${query}`
    })

    const { status, data } = rs
    const now = moment().format("YYYY-MM-DD")

    if (status === "Success") {
        const configs: RewardModel.RewardConfig[] = []
        if (Array.isArray(data)) {
            for (const d of data) {
                const config = mapRewardConfigs(d)
                if (config.active) {
                    if (now >= config.effectiveDate.start && now <= config.effectiveDate.end) {
                        configs.push(config)
                    }
                }
            }
        }
        return configs
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.message, rs.message)))
}

export async function searchMember(cardNo: string, nationalId: string, mobileNo: string) {
    const data = {
        card_no: cardNo ? cardNo : null,
        national_id: nationalId ? nationalId : null,
        mobile_no: mobileNo ? mobileNo : null
    }

    const headers = {
        "Content-Type": "application/json",
        "associate-token": AppConfig.reward_associate_token,
        "associate-secret": AppConfig.reward_associate_secret,
        "partner-code": AppConfig.reward_partner_code,
        "branch-code": AppConfig.reward_branch_code
    }

    const rs = await ApiClient.request({
        ...Endpoints.searchThe1Member,
        data,
        headers
    })

    const errorCodes = [
        ERROR_CODE.memberNotFound,
        ERROR_CODE.multipleMemberFound
    ]

    if (rs.successful === true || (rs.successful === false && errorCodes.includes(rs.error_code))) {
        return rs
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.message, rs.message)))
}

export async function getTransactionHistory(startDate: Date | moment.Moment, endDate: Date | moment.Moment, status: string, page: number, limit: number) {
    const data = {
        date_from: moment(startDate).format("YYYY-MM-DD"),
        date_to: moment(endDate).format("YYYY-MM-DD"),
        status: status,
        page: page,
        limit: limit
    }

    const headers = {
        "Content-Type": "application/json",
        "associate-token": AppConfig.reward_associate_token,
        "associate-secret": AppConfig.reward_associate_secret,
        "partner-code": AppConfig.reward_partner_code,
        "branch-code": AppConfig.reward_branch_code
    }

    const rs = await ApiClient.request({
        ...Endpoints.getTransactionHistory,
        data,
        headers
    })

    if (rs.error_code == "00") {
        return rs
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.message, rs.message)))
}

export async function createTransactionEarnRedeem(
    cardNo: string,
    totalAmount: number,
    deviceRef: string,
    associateTransactionId: string,
    earnedValue: number,
    isEarnWithRedeem: boolean,
    redeemedType: string,
    redeemedValue: number,
    businessDate: string,
    member: RewardModel.The1Member | null,
    partnerCode: string,
    branchCode1Biz: string,
    note: string,
    floorRoom: string) {

    const redeemData = {
        transaction_voucher_no: null,
        redeemed_type: redeemedType,
        redeemed_value: redeemedValue,
        business_date: businessDate,
        store_no: null
    }

    const data = {
        national_id: null,
        card_no: cardNo,
        mobile_no: null,
        total_amount: totalAmount,
        device_ref: deviceRef,
        associate_transaction_id: associateTransactionId,
        pos_no: null,
        staff_id: null,
        earn_data: {
            earned_value: earnedValue
        },
        redeem_data: isEarnWithRedeem ? redeemData : null,
        customer_info: {
            card_no: member?.cardNo ?? "",
            firstname: member?.firstname ?? "",
            firstname_th: member?.firstnameTh ?? "",
            lastname: member?.lastname ?? "",
            lastname_th: member?.lastnameTh ?? ""
        },
        partner_code: partnerCode,
        branch_code_1biz: branchCode1Biz,
        note: note,
        floor_room: floorRoom
    }

    const rs = await ApiClient.request({
        ...Endpoints.createTransactionEarnRedeem,
        data
    })

    if (rs.status === "Success") {
        return rs
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.message, rs.message)))
}

export async function verifyTransactionEarnRedeem(
    associateTransactionId: string | null,
    otpRefCode: string,
    otpCode: string,
    targetTransactionId: string,
    partnerCode: string,
    branchCode1Biz: string) {

    const data = {
        associate_transaction_id: associateTransactionId,
        otp_ref_code: otpRefCode,
        otp_code: otpCode,
        target_transaction_id: targetTransactionId,
        partner_code: partnerCode,
        branch_code_1biz: branchCode1Biz
    }

    const rs = await ApiClient.request({
        ...Endpoints.verifyTransactionEarnRedeem,
        data
    })

    if (rs.status === "Success") {
        return rs
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.message, rs.message)))
}

export async function transactionHistoryReport(
    industryCode: string,
    shopNumber: string,
    branchCode: string,
    floorRoom: string,
    email: string,
    selectedMonthYears: string[]) {

    const data = {
        industry_code: industryCode,
        shop_number: shopNumber,
        branch_code: branchCode,
        floor_room: floorRoom,
        email: email,
        month_year: selectedMonthYears
    }

    const rs = await ApiClient.request({
        ...Endpoints.transactionHistoryReport,
        data
    })

    if (rs.status === "Success") {
        return rs
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.message, rs.message)))
}

export function mapThe1MemberData(data: { [x: string]: any }) {
    const m = new RewardModel.The1Member()

    m.firstname = data.firstname || ""
    m.lastname = data.lastname || ""
    m.firstnameTh = data.firstname_th || ""
    m.lastnameTh = data.lastname_th || ""
    m.integrationStatusCode = data.integration_status_code || ""
    m.cardNo = data.card_no || ""
    m.pointBalance = data.point_balance || 0

    return m
}

export function mapEarnRedeemData(data: { [x: string]: any }) {
    const erd = new RewardModel.EarnRedeemData()

    erd.the1BizReferenceCode = data.the1_biz_reference_code || ""
    erd.transactionId = data.transaction_id || 0
    erd.transactionStatus = data.transaction_status || ""
    erd.qrCode = data.qr_code || ""
    erd.marketingMessage = data.marketing_message || ""

    const ed = new RewardModel.EarnDataResponse()
    const earnData = data.earn_data

    ed.earnPoint = earnData.earn_point || 0
    ed.earnRate = earnData.earn_rate || 0
    ed.earnValue = earnData.earn_value || 0
    ed.receiptNo = earnData.receipt_no || ""
    ed.createdAt = earnData.created_at || ""

    erd.earnData = ed

    const rd = new RewardModel.RedeemDataResponse()
    const redeemData = data.redeem_data

    rd.redeemedPoint = redeemData.redeemed_point || 0
    rd.redeemedRate = redeemData.redeemed_rate || 0
    rd.redeemedValue = redeemData.redeemed_value || 0
    rd.integrationStatusCode = redeemData.integration_status_code || ""
    rd.sourceTransId = redeemData.source_trans_id || ""
    rd.receiptNo = redeemData.receipt_no || ""
    rd.siebelRedeemReceiptNo = redeemData.siebel_redeem_receipt_no || ""
    rd.transactionNo = redeemData.transaction_no || ""
    rd.transactionProductName = redeemData.transaction_product_name || ""
    rd.transactionStatus = redeemData.transaction_status || ""
    rd.transactionRedeemPoint = redeemData.transaction_redeem_point || 0
    rd.transactionVoucherNo = redeemData.transaction_voucher_no || ""
    rd.transactionVoucherType = redeemData.transaction_voucher_type || ""
    rd.transactionVoucherDesc = redeemData.transaction_voucher_desc || ""
    rd.createdAt = redeemData.created_at || ""

    erd.redeemData = rd

    const otpData = data.otp
    if (otpData) {
        const od = new RewardModel.OTPDataResponse()

        od.otpRefCode = otpData.otp_ref_code || ""
        od.cardNo = otpData.card_no || ""
        od.mobileNo = otpData.mobile_no || ""
        od.targetTransactionId = otpData.target_transaction_id || ""
        od.integrationStatusCode = otpData.Integration_status_code || ""

        erd.otp = od
    } else {
        erd.otp = null
    }

    erd.note = data.note

    return erd
}

export function mapRewardConfigs(d: { [x: string]: any }) {
    const rc = new RewardModel.RewardConfig()
    rc.bpNumber = d.bp_number || ""
    rc.branchCode = d.branch_code || ""
    rc.branchCode1Biz = d.branch_code_1biz || ""
    rc.branchName = d.branch_name || ""
    rc.createdDate = d.created_at || ""

    try {
        rc.createdBy = {
            firstname: d.created_by.first_name || "",
            lastname: d.created_by.last_name || "",
        }
    } catch (e) {
        //
    }

    try {
        rc.updatedBy = {
            firstname: d.updated_by.first_name || "",
            lastname: d.updated_by.last_name || "",
        }
    } catch (e) {
        //
    }

    rc.earnRate = d.earn_rate || 0
    rc.floorRoom = d.floor_room || ""
    rc.id = d.id || 0
    rc.industryName = d.industry_name || ""
    rc.industryCode = d.industry_code || ""
    rc.isCpnCode = d.is_cpn_code === 1
    rc.isLimitUsePoint = d.is_limit_use_point === 1
    rc.minPointEarn = d.min_point_earn || 0
    rc.minPointRedeem = d.min_point_redeem || 0
    rc.partnerCode = d.partner_code || ""
    rc.partnerName = d.partner_name || ""
    rc.pointEarned = d.point_earned || 0
    rc.pointSpended = d.point_spended || 0
    rc.redeemRate = d.redeem_rate || 0
    rc.remainingPoint = d.remaining_point || 0
    rc.shopNumber = d.shop_number || ""
    rc.shopName = d.shop_name || ""
    rc.totalPoint = d.total_point || 0
    rc.updatedDate = d.updated_at || ""
    rc.active = d.is_active === 1
    rc.effectiveDate.start = d.effective_start_date || ""
    rc.effectiveDate.end = d.effective_end_date || ""
    rc.priority = d.priority ?? 0

    return rc
}

export function storeEarnRedeemDataToLocal(earnRedeemData: RewardModel.EarnRedeemData) {
    StorageUtils.setItem(REWARDS_EARN_REDEEM_DATA_KEY, earnRedeemData, "LOCAL")
}

export function clearLocalEarnRedeemData() {
    StorageUtils.removeItem(REWARDS_EARN_REDEEM_DATA_KEY, "LOCAL")
}

export function getLocalEarnRedeemData(): RewardModel.EarnRedeemData | null {
    const erd = StorageUtils.getItem(REWARDS_EARN_REDEEM_DATA_KEY, "LOCAL")
    return erd ? Object.assign(new RewardModel.EarnRedeemData(), erd) : null
}

export function isFeatureAvailable() {
    return (
        !AppConfig.is_production ||
        [
            "https://central-cpn.abbon.co.th",
            "https://cpnapp.ibeyond.cloud"
        ].includes(window.origin)
    )
}

export function isFeatureDisabled() {
    return IS_DISABLED_REWARDS;
}

interface ApproveVoidParams {
    the1BizBranchCode: string
    partnerCode: string
    paginate: {
        itemPerPage: number,
        page: number
    }
    store: StoreModel.Store
}

export async function getPendingApproveVoidHistory(params: ApproveVoidParams) {
    const { method, url } = Endpoints.getPendingApproveVoidHistory

    const query = qs.stringify({
        page_size: params.paginate.itemPerPage,
        page: params.paginate.page,
        branch_code_1biz: params.the1BizBranchCode,
        partner_code: params.partnerCode,
        sort_by: "request_void_at",
        floor_room: params.store.floorRoom
    })

    try {
        const resp = await ApiClient.request({
            url: url + "?" + query,
            method
        })

        if (resp.status === "Success") {
            const { items, total, last_page: lastPage, current_page: currentPage } = resp.data
            const transactions = Array.isArray(items) ? items.map(d => mapRewardTransactionData(d)) : []

            return {
                transactions,
                total,
                lastPage,
                currentPage
            }
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

export async function getApproveVoidedHistory(params: ApproveVoidParams) {
    const { method, url } = Endpoints.getApproveVoidedHistory

    const query = qs.stringify({
        page_size: params.paginate.itemPerPage,
        page: params.paginate.page,
        branch_code_1biz: params.the1BizBranchCode,
        partner_code: params.partnerCode,
        sort_by: "request_void_at",
        floor_room: params.store.floorRoom
    })

    try {
        const resp = await ApiClient.request({
            url: url + "?" + query,
            method
        })

        if (resp.status === "Success") {
            const { items, total, last_page: lastPage, current_page: currentPage } = resp.data
            const transactions = Array.isArray(items) ? items.map(d => mapRewardTransactionData(d)) : []
            return {
                transactions,
                total,
                lastPage,
                currentPage
            }
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

interface ApproveVoidRequest {
    transactionId: string
    associateId: string
    staffId: string
    username: string
    name: string
    lastname: string
    the1BizBranchCode: string
    partnerCode: string
    posNo: string | null
}

export async function approveTransectionVoid(params: ApproveVoidRequest) {
    const { method, url } = Endpoints.approveTransectionVoid

    const headers = {
        "Content-Type": "application/json"
    }

    /**
        "transaction_id": "338433",
        "associate_transaction_id": "Website_9ai56u9du1e4",
        "staff_id": "2",
        "username": "test",
        "name": "John",
        "lastname": "Wick",
        "pos_no": "553322",
        "branch_code_1biz": "000001",
        "partner_code": "ATA"
     */

    const data = {
        transaction_id: params.transactionId,
        associate_transaction_id: params.associateId,
        staff_id: params.staffId.toString(),
        username: params.username,
        name: params.name,
        lastname: params.lastname,
        pos_no: params.posNo || "999",
        branch_code_1biz: params.the1BizBranchCode,
        partner_code: params.partnerCode
    }

    try {
        await ApiClient.request({
            url,
            method,
            headers,
            data
        })
    } catch (e) {
        return Promise.reject(new Error(e.message))
    }
}

export async function rejectTransectionVoid(params: ApproveVoidRequest) {
    const { method, url } = Endpoints.rejectTransectionVoid

    const headers = {
        "Content-Type": "application/json"
    }

    const data = {
        transaction_id: params.transactionId,
        associate_transaction_id: params.associateId,
        staff_id: params.staffId.toString(),
        username: params.username,
        name: params.name,
        lastname: params.lastname,
        pos_no: params.posNo || "999",
        branch_code_1biz: params.the1BizBranchCode,
        partner_code: params.partnerCode
    }

    try {
        await ApiClient.request({
            url,
            method,
            headers,
            data
        })
    } catch (e) {
        return Promise.reject(new Error(e.message))
    }
}

interface TransactionParams {
    startDate: string
    endDate: string
    partnerCode: string
    the1BizBranchCode: string
    paginate: {
        itemPerPage: number,
        page: number
    }
    onlyMe?: boolean
    store: StoreModel.Store
}

export async function getTransactionById(id: string) {
    const { method, url } = Endpoints.getRewardTransactionById(id)
    const rs = await ApiClient.request({
        method,
        url
    })

    interface ShopDetail {
        id: number
        branch_code: string
        branch_name: string
        floor_room: string
        industry_code: string
        is_bkk_branch: number
        shop_name: string
        shop_number: string
    }

    interface TransactionData {
        id: number
        transaction_id: string
        transaction_status: string
        the1_biz_reference_code: string
        partner_code: string
        branch_code: string
        qr_code: string
        marketing_message?: string | null
        note: string
        total_amount: string
        associate_transaction_id: string
        status: string
        request_void_by: string
        request_void_at: string
        note_void?: string | null
        approved_rejected_void_by: string
        approved_rejected_void_at: string
        card_no: string
        firstname: string
        firstname_th: string
        lastname: string
        lastname_th: string
        created_by: string
        updated_by: string
        created_at: Date
        updated_at: Date
        floor_room?: string | null
        shop_detail: ShopDetail
    }

    const { status, data } = rs
    if (status === "Success") {
        return (data || {}) as TransactionData
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.message, rs.message)))
}

export async function getTransactions(params: TransactionParams) {

    const queryData: { [x: string]: any } = {
        branch_code_1biz: params.the1BizBranchCode,
        end_date: params.endDate,
        partner_code: params.partnerCode,
        start_date: params.startDate,
        page_size: params.paginate.itemPerPage,
        page: params.paginate.page,
        floor_room: params.store.floorRoom
    }

    if (params.onlyMe === true) {
        queryData.only_me = true
    }

    const query = qs.stringify(queryData)
    const { method, url } = Endpoints.getRewardTransactions

    /**
    {
        message: "Get Reward Transaction successfully."
        status: "Success"
        data: {
            current_page: 1
            from: null
            items: []
            last_page: 1
            per_page: 5
            to: null
            total: 0
        }
    }
    */

    const rs = await ApiClient.request({
        method,
        url: url + "?" + query
    })

    const { items, total, last_page: lastPage, current_page: currentPage } = rs.data
    const transactions = Array.isArray(items) ? items.map(d => mapRewardTransactionData(d)) : []

    return {
        transactions,
        total,
        lastPage,
        currentPage
    }
}

export function mapRewardTransactionData(data: { [x: string]: any }) {
    const t = new RewardModel.RewardTransaction()

    /** id */
    t.id = data.id || 0

    /** transaction_id */
    t.transactionId = data.transaction_id || ""

    /** firstname */
    t.firstnameEn = data.firstname || ""

    /** firstname_th */
    t.firstnameTh = data.firstname_th || ""

    /** lastname */
    t.lastnameEn = data.lastname || ""

    /** lastname_th */
    t.lastnameTh = data.lastname_th || ""

    /** total_amount */
    t.totalAmount = Number(data.total_amount)

    /** status */
    t.status = data.status || ""

    /** created_at */
    t.createdDate = data.created_at || ""

    /** redeemed_value */
    t.redeemedValue = Number(data.redeemed_value)

    /** redeemed_point */
    t.redeemedPoint = Number(data.redeemed_point)

    /** earn_value */
    t.earnValue = Number(data.earn_value)

    /** earn_point */
    t.earnPoint = Number(data.earn_point)

    /** created_by */
    t.createdBy = data.created_by || ""

    /** note */
    t.note = data.note || ""

    /** note_void */
    t.noteVoid = data.note_void || ""

    /** associate_transaction_id */
    t.associateId = data.associate_transaction_id || ""

    t.the1CardNo = data.card_no || ""

    t.requestVoidBy = data.request_void_by || ""

    t.approvedVoidBy = data.approved_rejected_void_by || ""

    t.requestVoidDate = data.request_void_at || ""

    t.approvedVoidDate = data.approved_rejected_void_at || ""

    return t
}

export async function requestVoidTransaction(transaction: RewardModel.RewardTransaction, note: string) {
    const rs = ApiClient.request({
        ...Endpoints.requestVoidTransaction,
        data: {
            transaction_id: transaction.transactionId,
            associate_transaction_id: transaction.associateId,
            note
        }
    })

    return rs
}
