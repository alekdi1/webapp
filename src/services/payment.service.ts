import { InvoiceModel, PaymentModel, UserModel } from "@/models"
import { Endpoints, App as AppConfig } from "@/config"
import { FileUtils, LanguageUtils } from "@/utils"
import ApiClient from "@/modules/api"
import numeral from "numeral"
import crypto from "crypto-js"
import * as PMS from "./payment.method.service"
import * as VXS from "./vuex.service"
import { VuexServices } from "@/services"

// export async function getPaymentHistory(customerNo: string, branches: any[] = [], shops: any[] = []) {
export async function getPaymentHistory(customerNo: string, filters: any[] = []) {

    const { method, url } = Endpoints.getPaymentHistory
    try {
        const data_request: any = {
            CustomerNo: customerNo,
            filters

        }
    
        // if (branches.length > 0) {
        //     data_request.branches = branches
        // }
        // if (shops.length > 0) {
        //     data_request.shops = shops
        // }
        const result = await ApiClient.request({
            method,
            data:data_request,
            url
        })

        const data = result.data
        return Array.isArray(data) ? data.map(d => mapPaymentHistory(d)) : []
    } catch (e) {
        return Promise.reject(e)
    }
}

export function getPaymentMethodByChannelKeyword(id: string) {
    switch (id) {
        // VISA/MASTER/JCB
        case "V": return {
            text: LanguageUtils.lang("ชำระผ่านบัตรเครดิต", "ชำระผ่านบัตรเครดิต"),
            icon: require("@/assets/images/payment/credit-card.png")
        }
        // THAI QR
        case "T": return {
            text: LanguageUtils.lang("Thai QR", "Thai QR"),
            icon: require("@/assets/images/payment/mobile-banking.svg")
        }
        // WeChat Pay
        case "W": return {
            text: LanguageUtils.lang("ชำระผ่านWeChat pay", "ชำระผ่านWeChat pay"),
            icon: require("@/assets/images/payment/wechat.png")
        }
        // KPlus (Kasikorn App)
        case "K": return {
            text: LanguageUtils.lang("K PLUS Mobile Banking", "K PLUS Mobile Banking"),
            icon: require("@/assets/images/payment/internet-banking.svg")
        }
        // KMA (Krungsri App)
        case "A": return {
            text: LanguageUtils.lang("KMA Mobile Banking", "KMA Mobile Banking"),
            icon: require("@/assets/images/payment/internet-banking.svg")
        }
        // KPlus Noti && KMA Noti && Prompt Pay
        case "R": return {
            text: LanguageUtils.lang("เบอร์มือถือที่ลงทะเบียนพร้อมเพย์", "PromptPay"),
            icon: require("@/assets/images/payment/mobile-banking.svg")
        }
        // Counter - Cash && Internet Banking? && ATM?
        case "C": return {
            text: LanguageUtils.lang("ชำระผ่านเคาน์เตอร์ธนาคาร", "ชำระผ่านเคาน์เตอร์ธนาคาร"),
            icon: require("@/assets/images/payment/counter-service.svg")
        }
        // Counter - Cheque
        case "Q": return {
            text: LanguageUtils.lang("เช็คเงินสด", "Cash check"),
            icon: require("@/assets/images/payment/counter-service.svg")
        }
        // UNION Pay
        case "U": return {
            text: LanguageUtils.lang("ชำระผ่านบัตรเครดิต", "ชำระผ่านบัตรเครดิต"),
            icon: require("@/assets/images/payment/credit-card.png")
        }
        // Ali Pay
        case "L": return {
            text: LanguageUtils.lang("ชำระผ่านAlipay", "ชำระผ่านAlipay"),
            icon: require("@/assets/images/payment/alipay.png")
        }
        case "atm": return {
            text: LanguageUtils.lang("ชำระผ่านเอ ที เอ็ม", "ชำระผ่านเอ ที เอ็ม"),
            icon: require("@/assets/images/payment/atm.png")
        }
        case "ibanking": return {
            text: LanguageUtils.lang("ชำระผ่านอินเทอร์เน็ตแบงค์กิ้ง", "ชำระผ่านอินเทอร์เน็ตแบงค์กิ้ง"),
            icon: require("@/assets/images/payment/internet-banking.svg")
        }
        default: return {
            text: LanguageUtils.lang("ชำระผ่านบิล", "ชำระผ่านบิล"),
            icon: require("@/assets/images/payment/counter-service.svg")
        }
    }
}

export function mapDiscountItem(d: any = {}) {
    const di = new PaymentModel.DiscountItem()
    di.id = d.id
    di.documentNo = d.documentNo
    di.documentYear = d.documentYear
    di.itemNo = d.itemNo
    di.name = d.name
    di.description = d.description
    di.value = d.value
    di.vat = d.vatValue
    di.tax = d.taxValue

    return di
}

export function mapPaymentItem(d: any = {}) {
    const pi = new PaymentModel.PaymentItem()
    pi.id = d.id
    pi.documentNo = d.documentNo
    pi.documentYear = d.documentYear
    pi.itemNo = d.itemNo
    pi.name = d.name
    pi.checked = d.checked
    pi.description = d.description
    pi.value = d.value
    pi.vat = d.vatValue
    pi.tax = d.taxValue

    const ditm = d.discounts
    if (Array.isArray(ditm)) {
        pi.discounts = ditm.map(itm => mapDiscountItem(itm))
    }

    return pi
}

export function mapPaymentDetail(d: any = {}) {
    const pd = new PaymentModel.PaymentDetail()
    pd.total = d.total
    pd.discount = d.discount
    pd.vat = d.vatValue
    pd.tax = d.taxValue

    const pitm = d.paymentItems
    if (Array.isArray(pitm)) {
        pd.paymentItems = pitm.map((itm: any) => mapPaymentItem(itm))
    }

    return pd
}

export function mapPaymentInvoiceItem(d: any = {}) {
    const inv = new PaymentModel.PaymentInvoiceItem()
    inv.invoiceId = d.invoiceId
    inv.invoiceYear = d.invoiceYear
    inv.description = d.description
    inv.status = d.status
    inv.createDateTime = d.createDateDateTime
    inv.createDate = d.createDate
    inv.endDateTime = d.endDateDateTime
    inv.endDate = d.endDate
    inv.checked = d.checked
    inv.compCode = d.compCode
    inv.businessArea = d.businessArea
    inv.isPartial = d.isPartial

    const invb = inv.branch
    const b = d.branch
    try {
        invb.id = b.branchId
        invb.nameEn = b.nameEN
        invb.nameTh = b.nameTH
    } catch {
        //
    }

    const ivbs = inv.shop
    const s = d.shop
    try {
        ivbs.id = s.shopId || ""
        ivbs.nameEn = s.nameEN || ""
        ivbs.nameTh = s.nameTH || ""
        ivbs.industryCode = s.industryCode || ""
    } catch {
        //
    }

    inv.paymentDetail = mapPaymentDetail(d.paymentDetail)

    return inv
}

export function mapPaymentHistory(d: any = {}) {
    const hd = new PaymentModel.PaymentTransactionItem()
    hd.refKey = d.refKey
    hd.paymentDate = d.paymentDate
    hd.paymentChannel = d.paymentChannel
    hd.paymentMethod = d.paymentMethod
    hd.paymentStatus = d.paymentStatus
    hd.locationCode = d.locationCode
    hd.note = d.note

    const hdbp = hd.billPayment
    const dbp = d.billPayment
    try {
        hdbp.paymentAmount = dbp.paymentAmount
        hdbp.ref1 = dbp.ref1
        hdbp.ref2 = dbp.ref2
    } catch {
        //
    }

    const invoices = d.data
    try {
        if (Array.isArray(invoices)) {
            hd.invoices = invoices.map((itm: any) => mapPaymentInvoiceItem(itm))
        }
    } catch {
        //
    }

    hd.uniqueId = crypto.SHA1(JSON.stringify(hd)).toString()
    return hd
}

export async function makePayment(invoices: InvoiceModel.Invoice[], method: PaymentModel.PaymentMethod, user: UserModel.User,) {
    const invoiceClone = checkInvoiceIsDiscount(JSON.parse(JSON.stringify(invoices.filter(v => !v.isPartial))));
    const invs = invoices.filter(v => !v.isPartial)

    const data = invs.map(v => ({
        invoiceId: v.id,
        invoiceYear: v.year,
        branch: {
            branchId: v.branch.id,
            nameEN: v.branch.nameEn,
            nameTH: v.branch.nameTh
        },
        shop: {
            shopId: v.shop.id,
            nameEN: v.shop.nameEn,
            nameTH: v.shop.nameTh,
            industryCode: v.shop.industryCode,
        },
        description: v.description || null,
        status: v.status,
        paymentDetail: {
            total: v.paymentDetail.total,
            discount: v.paymentDetail.discount,
            vatValue: v.paymentDetail.vat,
            taxValue: v.paymentDetail.tax,
            paymentItems: v.paymentDetail.paymentItems
                .filter(i => i.selected)
                .map(i => ({
                    id: i.id,
                    documentNo: i.documentNo,
                    documentYear: i.documentYear,
                    itemNo: i.itemNo,
                    name: i.name,
                    checked: i.checked === true,
                    description: i.desc || null,
                    value: i.price,
                    vatValue: i.vat,
                    taxValue: i.tax,
                    discounts: i.discounts.map(d => ({
                        id: d.id,
                        documentNo: d.documentNo,
                        documentYear: d.documentYear,
                        itemNo: d.itemNo,
                        name: d.name,
                        description: d.desc || null,
                        value: d.value,
                        vatValue: d.vat,
                        taxValue: d.tax
                    }))
                }))
        },
        createDateDateTime: v.createdDateTime,
        createDate: v.createdDate,
        endDateDateTime: v.endDateTime,
        endDate: v.endDate,
        checked: v.checked === true,
        compCode: v.compCode,
        businessArea: v.businessArea,
        isPartial: v.isPartial === true,
        isDiscount: v.isDiscount === true,
        invoiceReference: v.invoiceReference,
        taxCode: v.taxCode,
    }))

    const price = calculateInvoicesPrice(invoiceClone)
    const fee = calculatePriceFee(price, method.service)

    const body = {
        PaymentChannel: method.service?.channelCode || "",
        PaymentMethod: method.service?.methodNo,
        CustomerNo: user.customerNo,
        Note: method.note,
        LocationCode: method.branch?.code || null,
        EmailReceipt: method.emailreceipt ? method.emailreceipt : null,
        UserId: user.id,
        Language: "TH",
        data,
        FeeAmount: fee.amount.toFixed(2),
        FeePercent: fee.percent
    }

    console.log(body)

    const { method: reqMethod, url } = Endpoints.makePayment
    const response = await ApiClient.request({
        method: reqMethod,
        url,
        headers: {
            "Content-Type": "application/json",
            "x-payment-authorization": AppConfig.payment_authorization
        },
        data: body
    })

    const billPayment: {
        paymentAmount: number
        ref1: string
        ref2: string
    } = {
        paymentAmount: response?.billPayment?.paymentAmount || 0,
        ref1: response?.billPayment?.ref1 || "",
        ref2: response?.billPayment?.ref2 || "",
    }

    let items: InvoiceModel.InvoicePaymentItem[] = []
    for (const inv of invoices) {
        const paymentItems = inv.paymentDetail.paymentItems.filter(x => x.selected);
        paymentItems.map(x => {
            x.isDiscount = inv.isDiscount
        })
        items = [...items, ...paymentItems]
    }

    const rs = {
        refKey: response?.refKey || "",
        billPayment,
        paymentItems: items,
        paymentDate: response?.paymentDate || "",
        paymentChannel: method.service?.channelCode || "",
        paymentMethod: method.service?.methodNo || "",
        paymentChannelName: method?.service?.channelName || ""
    }

    console.log("makePayment --> rs --> ", rs)

    return rs
}

/**
 * 
 * @param orderId {string} - refKey from make payment
 * 
 * @param items - selected payment items
 * 
 */
export async function createPaymentGatewayOrder(orderId: string, items: InvoiceModel.InvoicePaymentItem[], paymentMethod: PaymentModel.PaymentMethod, paymentDate: string, user: UserModel.User, phone = "") {

    const invoices: InvoiceModel.Invoice[] = await VuexServices.Payment.getSelectedInvoices();
    const userLogin = user
    console.log("createPaymentGatewayOrder --> items --> ", items)
    console.log(invoices)

    const { method, url } = Endpoints.createPaymentGatewayOrder

    const orderDetailItems: {
        item_no: string
        item_name: string
        amount: number
        description: string | null
    }[] = []

    let pureAmount = 0

    for (const item of items) {
        // console.log("item --> createPaymentGatewayOrder --> ",item)
        const amount = calculatePaymentItemPrice(item)
        pureAmount += (item.isDiscount ? -Math.abs(amount) : amount)
        orderDetailItems.push({
            amount,
            item_name: item.name,
            description: item.desc || null,
            item_no: item.id
        })
    }

    const totalAmount = calculatePaymentItemPriceWidthMethod(pureAmount, paymentMethod.service)

    console.log("pureAmount", pureAmount)
    console.log("totalAmount", totalAmount)

    const body = {
        app_id: AppConfig.app_id,
        order_id: orderId,
        total_amount: numeral(totalAmount).format("0.00"),
        total_amount_exclude_fee: pureAmount,
        payment_channel: paymentMethod?.service?.channelName || "",
        mobile_no: phone || user.mobileNo || "",
        shop_name: "Central Pattana Serve",
        order_detail: orderDetailItems,
        order_date: paymentDate,
        customerNo: user.customerNo,
        invoices: invoices.map((x: any) => { return { invoiceId: x.id, invoiceReference: x.invoiceReference, invoiceYear: x.year, compCode: x.compCode } }),
        // invoices: invoices.map((x: any) => { return { invoiceId: x.id, invoiceYear: x.year, compCode: x.compCode } }),
    }

    const headers = {
        "Content-Type": "application/json"
    }
    console.log("body ", JSON.stringify(body))
    console.log("data ", {
        method,
        url,
        headers,
        data: body
    })
    // return;

    const response = await ApiClient.request({
        method,
        url,
        headers,
        data: body
    })

    /**
     * @Fail
     * {
            "result_code": "1001",
            "result_msg_en": "Duplicate order_id (36bb2edb-a348-455f-86bd-3d72820d0202)",
            "result_msg_th": "มีหมายเลข order_id นี้แล้ว (36bb2edb-a348-455f-86bd-3d72820d0202)",
            "api_type": "ORDER_CREATE",
            "app_id": "cpn_serve_web",
            "order_id": "36bb2edb-a348-455f-86bd-3d72820d0202"
        }
    */

    /**
     * @Success
     * {
            "result_code": "0000",
            "result_msg_en": "Success",
            "result_msg_th": "สำเร็จ",
            "api_type": "ORDER_CREATE",
            "app_id": "cpn_serve_web",
            "order_id": "36bb2edb-a348-455f-86bd-3d72820d0203",
            "order_status": "CREATED",
            "payment_id": "210225215245002041P",
            "payment_url": "https://cphqas.centralpattana.co.th/paygw/web/v1/payment?id=210225215245002041P&sign=7df4af0b02a8157c5b147a142de95fb138b71d89",
            "total_amount": 50.75,
            "payment_channel": "CREDIT_CARD",
            "created_date": "2021-02-25T21:52:45"
        }
    */

    return {
        success: response.result_code === "0000",
        messageEn: response.result_msg_en || "",
        messageTh: response.result_msg_th || "",
        paymentId: response.payment_id || "",
        paymentUrl: response.payment_url || "",
        orderId: response.order_id || "",
        totalAmount: response.total_amount || ""
    }
}

export function calculatePaymentItemPrice(item: InvoiceModel.InvoicePaymentItem) {
    /**
     * กรณี มีไอเทมส่วนลด  
        (value + vatValue - taxValue) - (disValue + disVatValue - disTaxValue)
    */

    if (item.discounts.length > 0) {

        const ttd = {
            vat: 0,
            tax: 0,
            value: 0
        }

        const map: { [x: string]: boolean } = {}

        // check duplicate
        for (const ds of item.discounts) {
            const k = ds.documentNo + "-" + ds.documentYear + "-" + ds.value + "-" + ds.vat + "-" + ds.tax
            if (!map[k]) {
                ttd.value += Math.abs(ds.value)
                ttd.vat += Math.abs(ds.vat)
                ttd.tax += Math.abs(ds.tax)
                map[k] = true
            }
        }

        // const ttd = item.discounts.reduce((sum, d) => ({
        //     value: sum.value + Math.abs(d.value),
        //     vat: sum.vat + Math.abs(d.vat),
        //     tax: sum.tax + Math.abs(d.tax)
        // }), {
        //     vat: 0,
        //     tax: 0,
        //     value: 0
        // })

        return (item.price + item.vat - item.tax) - (ttd.value + ttd.vat - ttd.tax)
    }

    /**
     *  กรณีไม่มีไอเทม 
         discount  Value + vatValue – taxValue
     */
    return item.price + item.vat - item.tax
}

export function calculatePaymentItemPriceAny(item: any) {
    /**
     * กรณี มีไอเทมส่วนลด  
        (value + vatValue - taxValue) - (disValue + disVatValue - disTaxValue)
    */

    if (item.discounts.length > 0) {

        const ttd = {
            vat: 0,
            tax: 0,
            value: 0
        }

        const map: { [x: string]: boolean } = {}

        // check duplicate
        for (const ds of item.discounts) {
            const k = ds.documentNo + "-" + ds.documentYear + "-" + ds.value + "-" + ds.vat + "-" + ds.tax
            if (!map[k]) {
                ttd.value += Math.abs(ds.value)
                ttd.vat += Math.abs(ds.vat)
                ttd.tax += Math.abs(ds.tax)
                map[k] = true
            }
        }

        // const ttd = item.discounts.reduce((sum, d) => ({
        //     value: sum.value + Math.abs(d.value),
        //     vat: sum.vat + Math.abs(d.vat),
        //     tax: sum.tax + Math.abs(d.tax)
        // }), {
        //     vat: 0,
        //     tax: 0,
        //     value: 0
        // })

        return (item.value + item.vat - item.tax) - (ttd.value + ttd.vat - ttd.tax)
    }

    /**
     *  กรณีไม่มีไอเทม 
         discount  Value + vatValue – taxValue
     */
    return item.value + item.vat - item.tax
}

export async function getBillPaymentPDF(refCode: string, username: string, legal_form_code: string) {
    const { method, url } = Endpoints.getBillPaymentPDF
    const body = {
        token: AppConfig.payment_authorization,
        refCode,
        language: "TH",
        username,
        customerType: legal_form_code!=='Z1'?"Corporate":"Individual"
    }

    if (!refCode) {
        throw new Error("No ref code")
    }

    const response = await ApiClient.request({
        method,
        url,
        data: body
    })
    if (response.status == "success") {
        return response
    }

    return Promise.reject(new Error(response))
}

export async function downloadBillPaymentPDF(refCode: string, username: string, legal_form_code: string) {
    const billpayment = await getBillPaymentPDF(refCode, username,legal_form_code)
    console.log("billpayment --> ", billpayment)
    await FileUtils.downloadFile(billpayment.file.content, "bill-" + refCode + ".pdf", billpayment.file.extension)
}


export function calculatePaymentHistoryItemPrice(item: PaymentModel.PaymentItem) {
    /**
     * กรณี มีไอเทมส่วนลด  
        (value + vatValue - taxValue) - (disValue + disVatValue - disTaxValue)
    */
    if (item.discounts.length > 0) {
        const ttd = item.discounts.reduce((sum, d) => ({
            value: sum.value + Math.abs(d.value),
            vat: sum.vat + Math.abs(d.vat),
            tax: sum.tax + Math.abs(d.tax)
        }), {
            vat: 0,
            tax: 0,
            value: 0
        })

        return (item.value + item.vat - item.tax) - (ttd.value + ttd.vat - ttd.tax)
    }

    /**
     *  กรณีไม่มีไอเทม 
         discount  Value + vatValue – taxValue
     */
    return item.value + item.vat - item.tax
}

export function calculatePriceFee(price: number, pms?: PaymentModel.BankService | null) {
    let percent = 0
    let amount = 0

    const config = VXS.Root.getAppConfig()
    if (PMS.creditCard().id === pms?.id) {
        amount = (config.payment.otherPayFeePercent / 100) * price
        percent = config.payment.otherPayFeePercent
    } else if (PMS.unionpay().id === pms?.id) {
        amount = (config.payment.unionPayFeePercent / 100) * price
        percent = config.payment.unionPayFeePercent
    }

    return Object.freeze({
        percent,
        amount
    })
}

export function calculatePaymentItemPriceWidthMethod(price: number, pms?: PaymentModel.BankService | null) {
    return Number(numeral(price + calculatePriceFee(price, pms).amount).format("0.00"))
}

export async function inquiryOrder(orderId: string, order: any = {}, user: any = {}) {
    console.log("inquiryOrder --> ")
    const { url, method } = Endpoints.inquiryOrder
    let postdata 
    console.log(order)
    
    let pureAmount = 0
    
    if(order){
        for (const invoice of order.invoices) {
            for (const paymentItem of invoice?.paymentDetail?.paymentItems) {
            // console.log("item --> createPaymentGatewayOrder --> ",item)
            const amount = calculatePaymentItemPriceAny(paymentItem)
            console.log(amount)
            console.log(pureAmount)
            pureAmount += (paymentItem.discounts.length>0 ? -Math.abs(amount) : amount)
            console.log(pureAmount)
            }
        }
        
        let totalAmount = 0

        const config = VXS.Root.getAppConfig()
        if (PMS.creditCard().channelCode === order?.paymentChannel) {
            totalAmount = (config.payment.otherPayFeePercent / 100) * pureAmount
        } else if (PMS.unionpay().channelCode ===order?.paymentChannel) {
            totalAmount = (config.payment.unionPayFeePercent / 100) * pureAmount
        }
        postdata = {
        app_id: AppConfig.app_id,
        order_id: orderId,
        order_status : 'PAID',
        payment_channel : order?.paymentChannel,
        payment_method : order?.paymentMethod,
        // payment_id : order?.uniqueId,
        total_amount: numeral(pureAmount+totalAmount).format("0.00"),
        total_amount_exclude_fee : pureAmount,
        user_id : user.id,
        payment_date : order?.paymentDate,
        note : order?.note
        }
    }else{
        postdata = {
            app_id: AppConfig.app_id,
            order_id: orderId
        }
    }
    const data = await ApiClient.request({
        method,
        url,
        data:postdata
    })

    /*
    -- Success
    {
        "result_code": "0000",
        "result_msg_en": "Success",
        "result_msg_th": "สำเร็จ",
        "api_type": "ORDER_INQUIRY",
        "app_id": "cpn_serve_web",
        "order_id": "4001000000198721",
        "order_status": "PAID",
        "payment_id": "210307214854002148P",
        "payment_url": "https://cphqas.centralpattana.co.th/paygw/web/v1/payment?id=210307214854002148P&sign=0f03ec16ee3be9ab71042e44e0b627338c33d381",
        "total_amount": 5100,
        "payment_channel": "CREDIT_CARD",
        "mobile_no": "0855016630",
        "shop_name": "Central Pattana Serve Web",
        "order_detail": [
            {
                "item_no": "1010000002 - 0",
                "item_name": "เงินมัดจำเช่า (ส่วนเพิ่ม)",
                "amount": 5000
            }
        ],
        "order_date": "2021-03-07T21:48:53",
        "created_date": "2021-03-07T21:48:54",
        "updated_date": "2021-03-07T21:51:43",
        "card_brand": "MASTERCARD",
        "card_issuer": "KASIKORNBANK PUBLIC COMPANY LIMITED"
    }
    */

    /*
    -- Error
    {
        "result_code": "4003",
        "result_msg_en": "Invalid parameter (app_id may not be null)",
        "result_msg_th": "ข้อมูลไม่ถูกต้อง (app_id may not be null)"
    }
    */

    if (data.result_code !== "0000") {
        return Promise.reject(new Error(LanguageUtils.lang(data.result_msg_th, data.result_msg_en)))
    }

    const orderDetail = data.order_detail

    return Object.freeze({
        status: data.order_status || "",
        isPaid: data.order_status === "PAID",
        isPending: data.order_status === "CREATED" || data.order_status === "PROCESSING",
        orderId: data.order_id || "",
        payment: {
            id: data.payment_id || "",
            url: data.payment_url || "",
            channel: data.payment_channel || "",
        },
        totalAmount: data.total_amount || 0,
        mobileNo: data.mobile_no || "",
        shopName: data.shop_name || "",
        orderDate: data.order_date || "",
        createdDate: data.created_date || "",
        updatedDate: data.updated_date || "",
        card: {
            brand: data.card_brand || "",
            issuer: data.card_issuer || ""
        },
        orderDetail: Array.isArray(orderDetail) ? orderDetail.map(d => ({
            itemNo: d.item_no || "",
            itemName: d.item_name || "",
            amount: d.amount || 0
        })) : [],
        note: data.note || ""
    })

}

export function calculateInvoicesPrice(invoices: InvoiceModel.Invoice[]) {
    return invoices.reduce((invSum, inv) => (
        invSum + inv.paymentDetail.paymentItems.reduce((paymentSum, paymentItem) => paymentSum + calculatePaymentItemPrice(paymentItem), 0)
    ), 0)
}

export function checkInvoiceIsDiscount(list: InvoiceModel.Invoice[]) {
    list.map(x => {
        if (x.id.startsWith("15") && x.invoiceReference.startsWith("11") ||
            x.id.startsWith("15") && x.invoiceReference.startsWith("992") ||
            x.id.startsWith("213") ||
            x.id.startsWith("15") && x.invoiceReference.startsWith("231") ||
            x.id.startsWith("15") && x.invoiceReference.startsWith("233") ||
            x.id.startsWith("211") ||
            x.id.startsWith("15") && x.invoiceReference.startsWith("230") ||
            x.id.startsWith("15") && x.invoiceReference.startsWith("232") ||
            x.id.startsWith("212")) {
            x.paymentDetail.paymentItems.map(x => {
                x.price = -Math.abs(x.price)
                x.tax = -Math.abs(x.tax)
                x.vat = -Math.abs(x.vat)
            })
        }
    }
    )
    return list;
}
