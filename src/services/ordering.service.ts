import { StoreModel, ShopSaleModel } from "@/models"
import ApiClient from "@/modules/api"
import moment from "moment"
import { Endpoints, App as AppConfig } from "@/config"
import CryptoJS from "crypto-js"
import { LanguageUtils } from "@/utils"

interface VendorReportSubRequestParams {
    contract: string | (string | null)[]
    report_type: string
    from: string
    to: string
}

interface VendorReportRequestParams {
    file_type: string
    requestList: VendorReportSubRequestParams[]
}
export async function downloadVendorReport(data: VendorReportRequestParams) {

    const headers = {
        "Content-Type": "application/json"
    }

    const rs = await ApiClient.request({
        ...Endpoints.getVendorReport,
        data,
        headers,
    })

    if (rs.return_status === "204") {
        return Promise.reject(new Error(rs.message))
    }

    return rs
}

export async function previewVendorReport(data: VendorReportRequestParams) {

    const headers = {
        "Content-Type": "application/json"
    }

    const rs = await ApiClient.request({
        ...Endpoints.getVendorReport,
        data,
        headers
    })

    if (rs.message === "success") {
        return rs.file.content;
    }

    return Promise.reject(new Error(rs.message))
}

export async function monthlyReport(request: any) {
    const { method, url } = Endpoints.downloadatlastmonth
    const response = await ApiClient.request({
        method: method,
        url,
        headers: {
            "Content-Type": "application/json"
        },
        data: request
    })

    return response;
}