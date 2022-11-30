import { Endpoints } from "@/config"
import ApiClient from "@/modules/api"
// import { StoreModel, UserModel } from "@/models"
// import * as VXS from "./vuex.service"
// import { getBranchList } from "./branch.service"
// import { PERMISSIONS } from "./employee.service"
// import ctjs from "crypto-js"
import moment from "moment"
import { LanguageUtils } from "@/utils"

export class CouponHistory {
    transactionId = ""
    couponId = ""
    shopNumber = ""
    branchCode = ""
    shopName = ""
    industryCode = ""
    status = ""
    datetimeUsed = ""
    availableDateStart = ""
    availableDateEnd = ""
    billNumber = ""
    minimumExpense = 0
    userId = ""
    couponOwner = ""
}

export async function checkCouponIsValide(data: any) {
    const { method, url } = Endpoints.checkCouponIsValide
    try {
        const rs = await ApiClient.request({
            method,
            url,
            data
        });
        const isvalide = rs.isvalid || rs.isValid || false
        if (isvalide) {
            return mapIsvalide(rs)
        }
        return rs
    } catch (e) {
        return Promise.reject(e)
    }
}

export async function getStoreListByTenantId( tenantId?: string) {
    const { method, url } = Endpoints.getStoreListByBP

    let query = "?"
    if (tenantId) {
        query = query + `&tenantId=${tenantId}`
    }

    const rs = await ApiClient.request({
        method: method,
        url: `${ url }` + query,
    })

    const resp = rs.data
    if (Array.isArray(resp)) {
        return rs.shopDetail
    }
    return {}
}

export async function checkCouponIsValidebyQR(data: any) {
    const { method, url } = Endpoints.checkCouponIsValidebyQR
    try {
        const rs = await ApiClient.request({
            method,
            url,
            data
        });
        const isvalide = rs.isvalid || rs.isValid || false
        if (isvalide) {
            return mapIsvalide(rs)
        }
        return rs
    } catch (e) {
        return Promise.reject(e)
    }
}
export async function markCouponIsUsed(data: any, isqruser: boolean) {
    const { method, url } = isqruser?Endpoints.markCouponIsUsedbyQR:Endpoints.markCouponIsUsed
    try {
        const rs = await ApiClient.request({
            method,
            url,
            data
        });
        if (rs) {
            return mapMarkCouponIsUsed(rs)
        }
        return Promise.reject(rs)
    } catch (e) {
        return Promise.reject(e)
    }
}
export async function updateCouponIsUsed(data: any, isqruser: boolean) {
    const { method, url } = isqruser?Endpoints.updateCouponIsUsedbyQR:Endpoints.updateCouponIsUsed
    try {
        const rs = await ApiClient.request({
            method,
            url,
            data
        });
        if (rs) {
            return rs
        }
        return Promise.reject(rs)
    } catch (e) {
        return Promise.reject(e)
    }
}

function mapIsvalide(request: any) {
    const response = {
        couponId: request.couponId,
        info: {
            couponOwner: request.info.couponOwner,
            endDate: displayDate(request.info.endDate),
            imgUrl: request.info.imgUrl || "",
            startDate: displayDate(request.info.startDate),
            title: request.info.title,
            usageInfo: request.info.usageInfo,
            displayTextDate: request.info.displayTextDate,
            toc: request.info.toc,
            shopInfo: {
                name: request.info.shopInfo.name,
                branchName: request.info.shopInfo.branchName,
                branchCode: request.info.shopInfo.branchCode
            }
        },
        minimumExpense:request.minimumExpense || 0,
        isShopVerification: request.isShopVerification,
        isvalid: request.isValid || request.isvalid || false,
        message: request.message || null,
        isMinimumExpense: request.isMinimumExpense || false,
    }
    return response;
}

function mapMarkCouponIsUsed(request: any) {
    const response = {
        transactionInfo: {
            id: request.transactionInfo.id,
            redeemedDate: request.transactionInfo.redeemedDate,
            usedAtShop: request.transactionInfo.usedAtShop
        }
    }
    return response
}

function displayDate(dateStr: string) {
    const md = moment(dateStr, "YYYY-MM-DD HH:mm:ss").locale(LanguageUtils.getCurrentLang())
    return LanguageUtils.lang(
        `${md.format("DD MMM")} ${String(md.year() + 543).substr(2)}`,
        md.format("DD MMM YY")
    )
}

export async function getCouponHistory(request: any, isqruser: boolean) {
    const { method, url } = isqruser?Endpoints.getcouponHistorybyQR:Endpoints.getcouponHistory
    const urlGetCouponHistory = url + `?shopNumber=${request.shopNumber}&branchCode=${request.branchCode}&industryCode=${request.industryCode}&floorRoom=${request.floorRoom}`

    try {
        const rs = await ApiClient.request({
            method,
            url: urlGetCouponHistory
        });
        if (rs) {
            const couponHistoryList: CouponHistory[] = [];
            for (const cp of rs) {
                couponHistoryList.push(mapHistories(cp))
            }
            return couponHistoryList
        }
        return Promise.reject(rs)
    } catch (e) {
        return Promise.reject(e)
    }
}

function mapHistories(request: any) {
    // moment(dateStr, "YYYY-MM-DD HH:mm:ss").locale(LanguageUtils.getCurrentLang())
    const ch = new CouponHistory();
    ch.transactionId = request.transactionId
    ch.couponId = request.couponId
    ch.shopNumber = request.shopNumber
    ch.branchCode = request.branchCode
    ch.shopName = request.shopName
    ch.industryCode = request.industryCode
    ch.status = request.status
    ch.datetimeUsed = request.datetimeUsed
    ch.availableDateStart = request.availableDateStart
    ch.availableDateEnd = request.availableDateEnd
    ch.billNumber = request.billNumber
    ch.minimumExpense = request.minimumExpense
    ch.userId = request.userId
    ch.couponOwner = request.couponOwner
    return ch;
}

export async function exportCouponHistory(request: any, isqruser: boolean) {
    const { method, url } = isqruser?Endpoints.exportCouponHistorybyQR:Endpoints.exportCouponHistory
    const urlExport = url + `?shopNumber=${request.shopNumber}&branchCode=${request.branchCode}&industryCode=${request.industryCode}&floorRoom=${request.floorRoom}&fromDate=${request.fromDate}&toDate=${request.toDate}`
    const response = await ApiClient.request({
        method: method,
        url: urlExport,
        headers: {
            "Content-Type": "application/json"
        },
        data: request
    })
    return response;
}


