import { StoreModel, ShopSaleModel } from "@/models"
import ApiClient from "@/modules/api"
import moment from "moment"
import { Endpoints, App as AppConfig } from "@/config"
import CryptoJS from "crypto-js"
import { LanguageUtils } from "@/utils"

const calculateSign = (body: string) => CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(body, AppConfig.shop_sale_secret))

export async function getSalesChannel() {

    const headers = {
        "x-api-key": AppConfig.shop_sale_api_key
    }

    const rs = await ApiClient.request({
        ...Endpoints.getShopSaleSalesChannel,
        headers
    })

    if (rs.result_code === "0000") {
        const list = rs.channel_list
        return Array.isArray(list) ? list.map(x => {
            const item = mapSaleChannelData(x)
            return item
        }) : []
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.result_msg_th, rs.result_msg_en)))
}

export async function getSalesCredit() {

    const headers = {
        "x-api-key": AppConfig.shop_sale_api_key
    }

    const rs = await ApiClient.request({
        ...Endpoints.getShopSaleCreditChannel,
        headers
    })
    // return rs?.data?.data || []
    // if (rs.result_code === "0000") {
    const list = rs.data
    // console.log(list)
    return Array.isArray(list) ? list : []
    // }

    // return Promise.reject(new Error(LanguageUtils.lang(rs.result_msg_th, rs.result_msg_en)))
}

interface OnProgressEvent extends Event {
    total: number
    loaded: number
}

export async function uploadSalesFile(actionBy: string, branchCode: string, file: File, onProgress?: (file: File, event: OnProgressEvent) => void) {

    const formData = new FormData()
    formData.append("action_by", actionBy)
    formData.append("branch_code", branchCode)
    formData.append("image_name", file.name)
    formData.append("image_size", String(file.size))
    formData.append("file", file)

    const reqBody = `${formData.get("action_by")}${formData.get("branch_code")}${formData.get("image_name")}${formData.get("image_size")}`

    const headers = {
        // "x-api-key": AppConfig.shop_sale_api_key,
        // "x-req-sig": calculateSign(reqBody),
        "Content-Type": "multipart/form-data"
    }

    const rs = await ApiClient.request({
        ...Endpoints.uploadShopSaleImage,
        data: formData,
        headers,
        config: {
            onUploadProgress: e => {
                if (typeof onProgress === "function") {
                    onProgress(file, e)
                }
            }
        }
    })

    if (rs.result_code === "0000") {
        return rs.image_id || ""
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.result_msg_th, rs.result_msg_en)))
}

export async function createSales(branchCode: string, shopName: string, shopUnit: string, salesDate: string, salesList: ShopSaleModel.ShopSaleItem[], actionBy: string) {

    const data = {
        branch_code: branchCode,
        shop_name: shopName,
        shop_unit: shopUnit,
        sales_date: salesDate,
        action_by: actionBy,
        sales_list: salesList.map(sales => ({
            channel_id: sales.channel.channelId,
            image_list: sales.images,
            no_sales_flag: sales.noSaleFlag,
            credit_card_amount: sales.creditCard.amount,
            sales_data: sales.data.map(saleData => ({
                seq_no: saleData.seq,
                sales_amount: saleData.amount,
                sales_invoice: saleData.invoice
            }))
        }))
    }

    const headers = {
        "x-api-key": AppConfig.shop_sale_api_key,
        "x-req-sig": calculateSign(JSON.stringify(data))
    }

    const rs = await ApiClient.request({
        ...Endpoints.createSale,
        data,
        headers
    })

    if (rs.result_code === "0000") {
        return rs
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.result_msg_th, rs.result_msg_en)))
}

export async function getHistory(startDate: Date | moment.Moment, endDate: Date | moment.Moment, store: StoreModel.Store) {

    const data = {
        branch_code: store.branch.code,
        shop_name: store.displayName,
        shop_unit: store.floorRoom,
        sales_date_from: moment(startDate).format("YYYYMMDD"),
        sales_date_to: moment(endDate).format("YYYYMMDD"),
        order_type: "DESC"
    }

    const headers = {
        "x-api-key": AppConfig.shop_sale_api_key,
        "x-req-sig": calculateSign(JSON.stringify(data))
    }

    const rs = await ApiClient.request({
        ...Endpoints.getShopSaleHistoryRange,
        data,
        // headers
    })

    if (rs.result_code === "0000") {
        const masterChannel = await getSalesChannel()
        const list = rs.result_list
        return Array.isArray(list) ? list.map(x => {
            const item = mapSaleDateData(x, masterChannel)
            item.store = store
            return item
        }) : []
    }

    /*
    {
        "result_code": "4003",
        "result_msg_en": "Invalid parameter (branch_code may not be null)",
        "result_msg_th": "ข้อมูลไม่ถูกต้อง (branch_code may not be null)",
        "api_type": "SALES_SEARCH"
    }
    */
    return Promise.reject(new Error(LanguageUtils.lang(rs.result_msg_th, rs.result_msg_en)))
}

export function mapSaleChannelData(data: { [x: string]: any }) {
    const s = new ShopSaleModel.SaleChannel()

    s.channelId = data.channel_id || 0
    s.nameEn = data.channel_name_en || ""
    s.nameTh = data.channel_name_th || ""
    s.valid = {
        from: data.valid_from || "",
        to: data.valid_to || ""
    }

    return s
}

export function mapSaleDateData(data: { [x: string]: any }, channelList: ShopSaleModel.SaleChannel[] = []) {
    const s = new ShopSaleModel.ShopSaleDateItem()

    s.branchCode = data.branch_code || ""
    s.store.nameTh = data.shop_name || ""
    s.store.nameEn = data.shop_name || ""
    s.date = data.sales_date || ""
    s.storeUnit = data.shop_unit || ""
    s.verifiedFlag = data.verified_flag || ""
    s.verifiedComment = data.verified_comment || ""
    s.createdBy = data.created_by || ""
    s.createdDate = data.created_date || ""
    s.updatedBy = data.updated_by || ""
    s.updatedDate = data.updated_date || ""
    s.id = CryptoJS.MD5(JSON.stringify(data)).toString()
    s.ref1 = data.ref1 || ""
    s.ref2 = data.ref2 || ""
    s.ref3 = data.ref3 || ""

    try {
        const list = data.sales_list
        s.salesList = Array.isArray(list) ? list.map(d => {
            const sd = new ShopSaleModel.ShopSaleItem()
            sd.channel.channelId = d.channel_id || ""

            const channel = channelList.find(c => String(c.channelId) === String(d.channel_id))
            if (channel) {
                sd.channel = channel
            }

            sd.channel.ref1 = d.channel_ref1 || ""
            sd.channel.ref2 = d.channel_ref2 || ""
            sd.channel.ref3 = d.channel_ref3 || ""

            sd.noSaleFlag = d.no_sales_flag || ""
            sd.images = Array.isArray(d.image_list) ? d.image_list : []
            sd.id = CryptoJS.MD5(JSON.stringify(d) + JSON.stringify(data)).toString()
            sd.creditCard = {
                amount: Number(d.credit_card_amount || 0),
                invoice: Number(d.credit_card_invoice || 0)
            }

            const salesData = d.sales_data
            sd.data = Array.isArray(salesData) ? salesData.map(z => {
                const item = new ShopSaleModel.SaleData()
                item.id = CryptoJS.MD5(JSON.stringify(z) + JSON.stringify(data)).toString()
                item.amount = Number(z.sales_amount)
                item.invoice = Number(z.sales_invoice)
                item.seq = Number(z.seq_no)

                Object.defineProperty(item, "rawData", {
                    value: z,
                    writable: false
                })
                return item
            }) : []

            Object.defineProperty(sd, "rawData", {
                value: d,
                writable: false
            })

            return sd
        }) : []
    } catch (e) {
        //
    }

    Object.defineProperty(s, "rawData", {
        value: data,
        writable: false
    })

    return s
}

export async function downloadImage(imageId: string) {
    const { method, url } = Endpoints.getShopSaleImage(imageId)
    try {
        const response = await ApiClient.request({
            method,
            url,
            headers: {
                "x-api-key": AppConfig.shop_sale_api_key
            }
        })
        return {
            status: response.status ? true : false,
            file: {
                content: response.file.content,
                extension: response.file.extension
            }
        };
    } catch (e) {
        return {
            status: false,
            file: {
                content: null,
                extension: null
            }
        }
    }
}

interface UpdateSaleParams {
    branchCode: string
    store: StoreModel.Store
    salesList: ShopSaleModel.ShopSaleItem[]
    date: string
    actionBy: string
    shopSaleData: ShopSaleModel.ShopSaleDateItem
}

export async function updateSaleData(params: UpdateSaleParams) {
    const data = {
        branch_code: params.branchCode,
        shop_name: params.store.displayName,
        shop_unit: params.store.floorRoom,
        sales_date: params.date,
        sales_list: params.salesList.map(sales => ({
            channel_id: sales.channel.channelId,
            image_list: sales.images,
            no_sales_flag: sales.noSaleFlag,
            sales_data: sales.data.map((d, idx) => ({
                seq_no: idx + 1,
                sales_amount: d.amount,
                sales_invoice: d.invoice
            })),
            credit_card_amount: sales.creditCard.amount,
            credit_card_invoice: sales.creditCard.invoice,
            channel_ref1: "",
            channel_ref2: "",
            channel_ref3: ""
        })),
        action_by: params.actionBy,
        ref1: params.shopSaleData.ref1,
        ref2: params.shopSaleData.ref2,
        ref3: params.shopSaleData.ref3
    }

    const headers = {
        "x-api-key": AppConfig.shop_sale_api_key,
        "x-req-sig": calculateSign(JSON.stringify(data))
    }

    const rs = await ApiClient.request({
        ...Endpoints.updateSale,
        data,
        headers
    })

    if (rs.result_code === "0000") {
        return rs
    }

    return Promise.reject(new Error(LanguageUtils.lang(rs.result_msg_th, rs.result_msg_en)))
}
