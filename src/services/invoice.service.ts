import { InvoiceModel } from "@/models"
import { App, Endpoints } from "@/config"
import ApiClient from "@/modules/api"
import moment from "moment"
import { LanguageUtils } from "@/utils"
import { App as AppConfig } from "@/config"


const today     = moment().endOf("month").format("YYYY-MM-DD");
const startDate = moment().subtract(5, "months").startOf("month").format("YYYY-MM-DD");

export async function getInvoiceList(branches: string[] = [], customerNo: string, filters: any[] = []) {
    const { method, url } = Endpoints.getInvoice

    const data: any = {
        CustomerNo: customerNo,
        filters: filters||[]

    }

    // if (branches.length > 0) {
    //     data.filter = branches
    // }
    if (filters.length > 0) {
        data.filters = filters
    }

    const result = await ApiClient.request({
        method,
        data,
        url,
        config: {
            noAuth: false,
            timeout: 120 * 1000,
        }
    })

    try {
        // const totalAmount: number = result.totalAmount || 0
        const data = result.data
        if (Array.isArray(data)) {
            const invoices = data.map(x => mapInvoiceData(x))
            return invoices;
        }
        return []
    } catch (e) {
        console.log(e.message || e)
        return Promise.reject(new Error("Date format invalid"))
    }
}

export async function getBranchShopList( customerNo: string, filters: any[] = []) {
    const { method, url } = Endpoints.getBranchShop

    const data: any = {
        CustomerNo: customerNo,
        startDate: startDate,
        endDate: today,
        filters: filters||[]
    }

    // if (branches.length > 0) {
    //     data.filter = branches
    // }
    if (filters.length > 0) {
        data.filters = filters
    }

    const result = await ApiClient.request({
        method,
        data,
        url,
        config: {
            noAuth: false,
            timeout: 120 * 1000,
        }
    })

    try {
        // const totalAmount: number = result.totalAmount || 0
        const data = result
        console.log(result)
        if (Array.isArray(data)) {
            const invoices = data.map(x => mapBranchShopData(x))
            return invoices;
        }
        return result||[]
    } catch (e) {
        console.log(e.message || e)
        return Promise.reject(new Error("Date format invalid"))
    }
}

// eslint-disable-next-line
export async function getRequestInvoiceList(branchId: string, shopId: string, customerNo: string, industryCode: string) {
    const { method, url } = Endpoints.getRequestInvocieList

    const body = {
        token: AppConfig.payment_authorization,
        BranchId: branchId,
        ShopId: shopId,
        StartDate: moment().subtract(5, "months").startOf("month").format("YYYY-MM-DD"),
        EndDate: moment().endOf("month").format("YYYY-MM-DD"),
        CustomerNo: customerNo,
        industryCode: industryCode

    }

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url,
            data: body
        })

        const data = resp.data

        const dummy_data = []

        for (let index = 0; index < 6; index++) {
            const year = Number(moment().subtract(index, 'months').format('YYYY'))
            const month = Number(moment().subtract(index, 'months').format("M"))

            console.log(dummy_data.findIndex((obj => obj.year == year)))
            const objIndex = dummy_data.findIndex((obj => obj.year == year))
            const dummy_year_data = data?.find((dummy: { year: number }) => dummy.year == year)
            const dummy_month_data = dummy_year_data?.months?.find((dummy: { monthId: number }) => dummy.monthId == month)
            const invoiceList = dummy_month_data?.invoiceList
            console.log(year)
            console.log(data)
            console.log(dummy_year_data)
            console.log(dummy_month_data)
            console.log(invoiceList)
            if (invoiceList?.length > 0) {
                if (objIndex == - 1) {
                    dummy_data.push({ year: year, months: dummy_month_data ? [dummy_month_data] : [{ invoiceList: [], checked: false, monthId: month }] })
                } else {
                    if (dummy_month_data) {
                        dummy_data[objIndex].months.push(dummy_month_data)
                    } else {
                        dummy_data[objIndex].months.push({ invoiceList: [], checked: false, monthId: month })
                    }
                }
            }

        }
        return Array.isArray(dummy_data) ? dummy_data.map(r => mapRequestInvoice(r)) : []
    } catch (e) {
        return Promise.reject(new Error("Unable to get request invoice list"))
    }
}

export async function requestInvoiceToMail(customerNo: string, requestForm: InvoiceModel.RequestForm) {
    const { method, url } = Endpoints.requestInvoiceToMail

    const headers = {
        "Content-Type": "application/json"
    }

    const requestItms = []

    for (const yItem of requestForm.requestItms as InvoiceModel.RequestInvoice[]) {
        for (const mItem of yItem.months) {
            for (const invItm of mItem.invoices) {
                requestItms.push({
                    compCode: invItm.compCode,
                    businessArea: invItm.businessArea,
                    customerNo: customerNo,
                    invoiceId: invItm.id,
                    year: yItem.year
                })
            }
        }
    }

    const body = {
        email: requestForm.email,
        is_single_file: requestForm.fileType === "combined",
        request_invoices: requestItms
    }

    try {
        await ApiClient.request({
            method: method,
            url: url,
            headers: headers,
            data: body
        })
    } catch {
        return Promise.reject(new Error(LanguageUtils.lang("ระบบไม่พบข้อมูล PDF", "Not found PDF data")))
    }
}

export async function getRequestReceiptList(branchId: string, shopId: string, customerNo: string, industryCode: string) {
    const { method, url } = Endpoints.getRequestReceiptList

    const body = {
        BranchId: branchId,
        ShopId: shopId,
        StartDate: moment().subtract(5, "months").startOf("month").format("YYYY-MM-DD"),
        EndDate: moment().endOf("month").format("YYYY-MM-DD"),
        CustomerNo: customerNo,
        industryCode: industryCode
    }

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url,
            data: body
        })

        return Array.isArray(resp) ? resp.map(r => mapRequestReceipt(r)) : []
    } catch (e) {
        return Promise.reject(new Error("Unable to get request receipt list"))
    }
}

export async function requestReceiptToMail(customerNo: string, requestForm: InvoiceModel.RequestForm) {
    const { method, url } = Endpoints.requestReceiptToMail

    const requestItms = []

    for (const yItem of requestForm.requestItms as InvoiceModel.RequestReceipt[]) {
        for (const mItem of yItem.months) {
            for (const recpItm of mItem.receipts) {
                requestItms.push({
                    CompanyCode: recpItm.compCode,
                    DocumentNo: recpItm.documentNo,
                    ClearingYear: recpItm.clearingYear
                })
            }
        }
    }

    const body = {
        email: requestForm.email,
        is_single_file: requestForm.fileType === "combined",
        customer_no: customerNo,
        request_receipts: requestItms
    }

    try {
        await ApiClient.request({
            method: method,
            url: url,
            data: body
        })
    } catch {
        return Promise.reject(new Error(LanguageUtils.lang("ระบบไม่พบข้อมูล PDF", "Not found PDF data")))
    }
}

export function mapRequestReceipt(d: any = {}) {
    const r = new InvoiceModel.Receipt()

    r.compCode = d.companyCode || ""
    r.businessArea = d.businessArea || ""
    r.compNameEn = d.companyName || ""
    r.compNameTh = d.companyNameTh || ""
    r.receiptNo = d.receiptNo || ""
    r.clearingYear = d.clearingYear || ""
    r.clearingDate = d.clearingDate || ""

    const invs = d.data
    r.invoiceItems = Array.isArray(invs) ? invs.map((i: any) => mapInvoiceData(i)) : []

    return r
}

/** 
 * Map invoice api data into Invoice model 
 * @param {Object} d - The data from API.
 * */
export function mapInvoiceData(d: any = {}) {
    const v = new InvoiceModel.Invoice()
    Object.defineProperty(v, "rawData", {
        value: d,
        writable: false
    })
    v.id = d.invoiceId || ""
    v.isDiscount = d.isDiscount === true
    v.year = d.invoiceYear || 0
    v.description = d.description || ""
    v.status = d.status || ""
    v.createdDateTime = d.createDateDateTime || ""
    v.createdDate = d.createDate || ""
    v.endDate = d.endDate || ""
    v.endDateTime = d.endDateDateTime || ""
    v.checked = d.checked === true
    v.compCode = d.compCode || ""
    v.businessArea = d.businessArea || ""
    v.isPartial = d.isPartial === true
    v.uniqueId = `${v.compCode}-${v.year}-${v.id}`
    v.taxCode = d.taxCode
    v.invoiceReference = d.invoiceReference

    // -------------- branch ---------------
    try {
        const b = d.branch
        v.branch.id = b.branchId || ""
        v.branch.nameTh = b.nameTH || ""
        v.branch.nameEn = b.nameEN || ""
    } catch (e) {
        //
    }

    // -------------- shop ---------------
    try {
        const s = d.shop
        v.shop.id = s.shopId || ""
        v.shop.nameEn = s.nameEN || ""
        v.shop.nameTh = s.nameTH || ""
        v.shop.industryCode = s.industryCode || ""
    } catch (e) {
        //
    }

    // -------------- paymentDetail ---------------
    try {
        const pd = d.paymentDetail
        v.paymentDetail.discount = pd.discount || 0
        v.paymentDetail.tax = pd.taxValue || 0
        v.paymentDetail.vat = pd.vatValue || 0
        v.paymentDetail.total = pd.total || 0

        const items = pd.paymentItems

        if (Array.isArray(items)) {
            v.paymentDetail.paymentItems = items.map(pi => {
                const i = mapPaymentItem(pi)
                i.invoiceUniqueId = v.uniqueId
                return i
            })
        }
    } catch (e) {
        //
    }

    return v
}
export function mapBranchShopData(d: any = {}) {
    const v = new InvoiceModel.Branchshop()
    Object.defineProperty(v, "rawData", {
        value: d,
        writable: false
    })
    v.id = d.invoiceId || ""
    v.isDiscount = d.isDiscount === true
    v.year = d.invoiceYear || 0
    v.description = d.description || ""
    v.status = d.status || ""
    v.createdDateTime = d.createDateDateTime || ""
    v.createdDate = d.createDate || ""
    v.endDate = d.endDate || ""
    v.endDateTime = d.endDateDateTime || ""
    v.checked = d.checked === true
    v.compCode = d.compCode || ""
    v.businessArea = d.businessArea || ""
    v.isPartial = d.isPartial === true
    v.uniqueId = `${v.compCode}-${v.year}-${v.id}`
    v.taxCode = d.taxCode
    v.invoiceReference = d.invoiceReference

    // -------------- branch ---------------
    try {
    //     const b = d.branch
        v.branch.id = d.businessArea || ""
        v.branch.nameTh = d.companyNameTh || ""
        v.branch.nameEn = d.companyName || ""
    } catch (e) {
        //
    }

    // -------------- shop ---------------
    try {
        // const s = d.shop
        v.shop.id = d.shopNo || ""
        v.shop.nameEn = d.shopNameEn || ""
        v.shop.nameTh = d.shopNameTh || ""
        v.shop.industryCode = d.industry || ""
    } catch (e) {
        //
    }

    // -------------- paymentDetail ---------------
    // try {
    //     const pd = d.paymentDetail
    //     v.paymentDetail.discount = pd.discount || 0
    //     v.paymentDetail.tax = pd.taxValue || 0
    //     v.paymentDetail.vat = pd.vatValue || 0
    //     v.paymentDetail.total = pd.total || 0

    //     const items = pd.paymentItems

    //     if (Array.isArray(items)) {
    //         v.paymentDetail.paymentItems = items.map(pi => {
    //             const i = mapPaymentItem(pi)
    //             i.invoiceUniqueId = v.uniqueId
    //             return i
    //         })
    //     }
    // } catch (e) {
    //     //
    // }

    return v
}

export function mapPaymentItem(d: any = {}) {
    const i = new InvoiceModel.InvoicePaymentItem()

    Object.defineProperty(i, "rawData", {
        value: d,
        writable: false
    })

    i.id = d.id || ""
    i.name = d.name || ""
    i.desc = d.description || ""
    i.price = d.value || 0
    i.vat = d.vatValue || 0
    i.tax = d.taxValue || 0
    i.documentNo = d.documentNo || ""
    i.documentYear = d.documentYear || 0
    i.itemNo = d.itemNo || ""
    i.checked = d.checked === true

    const { discounts } = d
    i.discounts = Array.isArray(discounts) ? discounts.map(z => mapPaymentItemDiscount(z)) : []

    return i
}

export function mapPaymentItemDiscount(d: any = {}) {
    const s = new InvoiceModel.InvoicePaymentItemDiscount()

    Object.defineProperty(s, "rawData", {
        value: d,
        writable: false
    })

    s.id = d.id || ""
    s.documentNo = d.documentNo || ""
    s.documentYear = d.documentYear || 0
    s.itemNo = d.itemNo || ""
    s.name = d.name || ""
    s.desc = d.description || ""
    s.value = d.value || 0
    s.vat = d.vatValue || 0
    s.tax = d.taxValue || 0

    return s
}

export function mapRequestPaymentDetail(data: any = {}) {
    const pd = new InvoiceModel.RequestPaymentDetail()
    pd.total = data.total
    pd.discount = data.discount
    pd.vat = data.vatValue
    pd.tax = data.taxValue
    return pd
}

export function mapRequestInvoiceItem(data: any = {}) {
    const i = new InvoiceModel.RequestInvoiceItem()
    i.id = data.invoiceId
    i.compCode = data.compCode
    i.businessArea = data.businessArea
    i.checked = data.checked

    i.paymentDetail = mapRequestPaymentDetail(data.paymentDetail)

    const itms = data.paymentItems
    i.paymentItems = Array.isArray(itms) ? itms.map(i => mapPaymentItem(i)) : []

    return i
}

export function mapRequestInvoiceMonth(data: any = {}) {
    const m = new InvoiceModel.RequestInvoiceMonth()
    m.id = data.monthId
    m.checked = data.checked

    const invoices = data.invoiceList
    m.invoices = Array.isArray(invoices) ? invoices.map(i => mapRequestInvoiceItem(i)) : []
    return m
}

export function mapRequestInvoice(data: any = {}) {
    const s = new InvoiceModel.RequestInvoice2()
    s.year = data.year

    const months = data.months
    s.months = Array.isArray(months) ? months.map(m => mapRequestInvoiceMonth(m)) : []
    return s
}

export async function downloadInvoicesPDF(customerNo: string, invoices: InvoiceModel.Invoice[]) {
    const { method: reqMethod, url } = Endpoints.getInvoicesPDF

    const items: {
        compCode: string
        businessArea: string
        customerNo: string
        invoiceId: string
        year: string | number
    }[] = []

    for (const invoice of invoices) {
        for (const paymentItem of invoice.paymentDetail.paymentItems) {

            const add = (invoiceId: string, year: number) => {
                const item = {
                    businessArea: invoice.businessArea,
                    compCode: invoice.compCode,
                    customerNo,
                    invoiceId,
                    year
                }
                // filter check duplicate
                if (!items.some(t => t.invoiceId === item.invoiceId
                    && item.year === t.year
                    && item.compCode === t.compCode
                    && item.businessArea === t.businessArea)) {
                    items.push(item)
                }
            }

            add(paymentItem.documentNo, paymentItem.documentYear)
            for (const discount of paymentItem.discounts) {
                add(discount.documentNo, discount.documentYear)
            }
        }
    }

    console.log(invoices)
    console.log(items)

    const invoiceResponse = await ApiClient.request({
        method: reqMethod,
        url,
        // config: {
        //     responseType: "arraybuffer"
        // },
        // headers: {
        //     Authorization: App.payment_authorization,
        //     "Content-Type": "application/json"
        // },
        // data: items,
        data: {
            token: AppConfig.payment_authorization,
            invoices: items
        }
    })


    if (invoiceResponse.status == "success") {
        return invoiceResponse
    }

    return Promise.reject(new Error(invoiceResponse))
}

