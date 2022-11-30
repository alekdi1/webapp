import { Endpoints } from "@/config"
import { RentalModel } from "@/models"
import ApiClient from "@/modules/api"
import { getBranchList } from "./branch.service"
import { PERMISSIONS } from "./employee.service"
import * as VXService from "./vuex.service"

export const RENTAL_STATUS = {
    expired: "contract_expired",
    expiring: "contract_expiring",
    renew: "contract_renew",
    refund: "contract_refund"
}

function mapRentalStatusInformation(d: any = {}) {
    const s = new RentalModel.RentalStatusInformation()
    s.name = d.status_name
    s.type = d.status_type
    s.dateTime = d.date_time
    return s
}

function mapRentalStoreList(d: any = {}, branchList: any = []) {
    const branchCode = d.branch_code || ""
    const branch = branchList.find((b: any) => b.code === branchCode)
    const r = new RentalModel.RentalStore()
    r.id = d.id
    r.nameTh = d.shop_name || ""
    r.nameEn = d.shop_name || ""
    r.contractName = d.contract_name
    r.contractNumber = d.contract_number
    r.branchCode = d.branch_code
    r.branchName = d.branch_name
    r.status = d.renew_status
    r.refund = d.request_refund
    r.start = d.start_date
    r.end = d.end_date
    r.branch = branch || r.branch
    r.info = mapRentalStatusInformation(d.status_information)
    return r
}

export async function getRentalStoreList(bpNo: string, status?: string) {
    const { method, url } = Endpoints.getRentalInfoListFiltered
    const user = VXService.Root.getUser()

    if (!user) {
        throw new Error("User not found")
    }

    const permission = user.permissions.find(p => p.permission === PERMISSIONS.contract_info)
    if (!user.isOwner) {
        if (!permission) {
            throw new Error("User has no permission")
        } else {
            if (permission.shops.length === 0) {
                return []
            }
        }
    }

    const data: any = {
        bp_number: bpNo,
        filter_by: permission?.shops.map(s => ({
            shop_number: s.number || 0,
            industry_code: s.industryCode || 0,
            branch_code: s.branch.code || 0
        })) || []
    }

    if (status) {
        data.status = status
    }

    try {
        const resp = await ApiClient.request({
            method: method,
            url,
            data
        })

        const user = VXService.Root.getUser()
        let branchList = user?.branchList || []

        try {
            if (branchList.length === 0) {
                branchList = await getBranchList()
            }
        } catch (e) {
            //
        }

        if (resp.status === "Success") {
            const data = resp.data
            return Array.isArray(data) ? data.map(d => mapRentalStoreList(d, branchList)) : []
        }
        return Promise.reject(new Error("Get rental store list error"))
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

function mapRentalDetailRefundProgress(d: any = {}) {
    const r = new RentalModel.RefundProgress()
    r.status = d.status
    r.name = d.process_name
    r.desc = d.description
    return r
}

function mapRentalDetail(d: any = {}) {
    const r = new RentalModel.RentalDetail()
    r.id = d.id
    r.contractName = d.contract_name
    r.branchCode = d.branch_code
    r.branchName = d.branch_name
    r.status = d.renew_status
    r.contractNumber = d.contract_number
    r.contractTypeCode = d.contract_number
    r.contractTypeName = d.contract_type_name
    r.contractAddress = d.contract_address
    r.catCode = d.category_code
    r.industryCode = d.industry_code
    r.industryName = d.industry_name
    r.floorRoom = d.floor_room
    r.start = d.start_date
    r.end = d.end_date
    r.bpNo = d.bp_number
    r.businessEntityCode = d.business_entity_code
    r.cofNumber = d.cof_number
    r.pricePerMonth = d.price_per_month
    r.pricePerSqm = d.price_per_sqm
    r.cofCurrentFile = d.cof_current_file
    r.cofRenewFile = d.cof_renew_file
    r.cofRenew = d.cof_renew
    r.refundDecoration = d.refund_decoration
    r.refundDeposit = d.refund_deposit
    r.refundRental = d.refund_rental
    r.requestRefund = d.request_refund
    r.requestRefundDate = d.request_refund_date
    r.createdAt = d.created_at
    r.updatedAt = d.updated_at
    r.info = mapRentalStatusInformation(d.status_information)
    r.refundProgress = Array.isArray(d.refund_progress) ? d.refund_progress.map((r: any) => mapRentalDetailRefundProgress(r)) : []
    return r
}

export async function getRentalDetail(rentalId: string) {
    const { method, url } = Endpoints.getRentalInfoList

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + "/" + rentalId
        })

        if (resp.status === "Success") {
            const data = resp.data
            return mapRentalDetail(data)
        }
        return Promise.reject(new Error("Get rental error"))
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

function mapQuotationDetail(d: any = {}) {
    const q = new RentalModel.Quotation()
    q.id = d.id
    q.branchCode = d.branch_code
    q.branchName = d.branch_name
    q.cofNumber = d.cof_number
    q.cofName = d.cof_name
    q.bpNo = d.bp_number
    q.contractTypeCode = d.contract_type_code
    q.contractTypeName = d.contract_type_name
    q.startDate = d.start_date
    q.endDate = d.end_date
    q.contractAddress = d.contract_address
    q.businessEntityCode = d.business_entity_code
    q.catCode = d.category_code
    q.industryCode = d.industry_code
    q.industryName = d.industry_name
    q.rentalDeposit = d.rental_deposit
    q.floorRoom = d.floor_room
    q.pricePerMonth = d.price_per_month
    q.pricePerSqm = d.price_per_sqm
    q.saleAdUser = d.sale_ad_user
    q.saleAdEmail = d.sale_ad_email
    q.cofCreatedDate = d.cof_created_date
    // 2 cases: true or 1
    q.submittedRenew = d.submitted_renew || d.submittedRenew === 1
    q.submittedRenewDate = d.submitted_renew_date
    q.dropLeadContact = d.drop_lead_contact
    q.dropLeadDate = d.drop_lead_date
    q.updatedAt = d.updated_at
    q.cofRenew = d.cof_renew
    q.cofRenewFile = d.cof_renew_file
    q.status = d.status
    return q
}

export async function getQuotationDetail(id: string) {
    const { method, url } = Endpoints.getQuotationDetail

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + "/" + id
        })

        if (resp.status === "Success") {
            const data = resp.data
            return mapQuotationDetail(data)
        }
        return Promise.reject(new Error("Get quotation error"))
    } catch (e) {
        return Promise.reject(e)
    }
}

export async function downloadCofFile(filename: string) {
    const { method, url } = Endpoints.downloadCofFile

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + `?file_name=${filename}`
        })

        if (resp.status === "Success" && resp.data) {
            return resp.data.full_path || ""
        }
        return Promise.reject(new Error("Get quotation error"))
    } catch (e) {
        return Promise.reject(e)
    }
}

export async function _downloadCofFile(filename: string) {
    const { method, url } = Endpoints.downloadCofFile
    try {
        const blob: Blob = await ApiClient.request({
            method: method,
            url: url + `?file_name=${filename}`,
            config: {
                responseType: "blob"
            }
        })
        if (blob) {
            return blob
        }
        return Promise.reject(new Error("Get quotation error"))
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

export async function submitRenewQuotation(cofNo: string) {
    const { method, url } = Endpoints.submitRenewQuotation

    try {
        await ApiClient.request({
            method: method,
            url: url.replace(":cof_number", cofNo)
        })
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

export async function submitQuotationDropLead(cofNo: string, contact: string) {
    const { method, url } = Endpoints.submitQuotationDropLead

    const body = {
        contact: contact
    }

    try {
        await ApiClient.request({
            method: method,
            url: url.replace(":cof_number", cofNo),
            data: body
        })
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

export async function submitRefund(refundNo: string) {
    const { method, url } = Endpoints.submitRefund

    try {
        await ApiClient.request({
            method: method,
            url: url.replace(":refund_no", refundNo)
        })
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}
