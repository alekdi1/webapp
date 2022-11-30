import { Endpoints } from "@/config"
import ApiClient from "@/modules/api"
import { StoreModel, UserModel } from "@/models"
import * as VXS from "./vuex.service"
import { getBranchList } from "./branch.service"
import { PERMISSIONS } from "./employee.service"
import ctjs from "crypto-js"

export const SUBSCRIBE_SERVICES = {
    invoice: "invoice",
    receipt: "receipt"
}

interface SubscribeServiceParams {
    /** Store's bp_number */
    emails?: string[]
    ccEmails?: string[]
    bpNumber: string,
    isAccept: number
}

const mapSubscribeBody = (params: SubscribeServiceParams) => ({
    bp_number: params.bpNumber || "",
    email: params.emails?.join(",") || "",
    cc_email: params.ccEmails?.join(",") || "",
    isAccept: params.isAccept
})

function mapStoreSubscribeInfoData(data: any = {}) {
    return {
        bpNumber: data.bp_number || "",
        ccEmails: String(data.cc_email || "").split(",").map(email => email.trim()),
        emails: String(data.email || "").split(",").map(email => email.trim()),
        isAccept: Number(data.is_consent_accepted)
    }
}

// -------------------- Invoice --------------------

export async function subscribeInvoice(params: SubscribeServiceParams) {
    const { method, url } = Endpoints.RegisterInvoiceCreate

    const rs = await ApiClient.request({
        data: mapSubscribeBody(params),
        method,
        url
    })

    if (rs.status === "Success") {
        return rs.data
    }
    return Promise.reject(new Error(rs.message))
}

export async function editSubscribeInvoice(params: SubscribeServiceParams) {
    const { method, url } = Endpoints.RegisterInvoiceUpdate
    const rs = await ApiClient.request({
        data: mapSubscribeBody(params),
        method,
        url
    })

    return rs
}

export async function deleteSubscribeInvoice(bpNumber: string) {
    const { method, url } = Endpoints.RegisterInvoiceDelete
    const rs = await ApiClient.request({
        method,
        url,
        data: {
            bp_number: bpNumber
        }
    })

    return rs
}

export async function getSubscribeInvoice(bpNumber: string) {
    const { method, url } = Endpoints.RegisterInvoiceGet
    const rs = await ApiClient.request({
        method,
        url,
        data: {
            bp_number: bpNumber
        },
        config: {
            originalError: true
        }
    })

    if (rs.status === "Success") {
        return mapStoreSubscribeInfoData(rs.data)
    }
    return Promise.reject(rs)
}

// -------------------- Receipt --------------------

export async function subscribeReceipt(params: SubscribeServiceParams) {
    const data = mapSubscribeBody(params)
    const { method, url } = Endpoints.RegisterReceiptCreate

    const rs = await ApiClient.request({
        data,
        method,
        url
    })

    if (rs.status === "Success") {
        return rs.data
    }
    return Promise.reject(new Error(rs.message))
}

export async function editSubscribeReceipt(params: SubscribeServiceParams) {
    const data = mapSubscribeBody(params)
    const { method, url } = Endpoints.RegisterReceiptUpdate
    const rs = await ApiClient.request({
        data,
        method,
        url
    })

    return rs
}

export async function deleteSubscribeReceipt(bpNumber: string) {
    const { method, url } = Endpoints.RegisterReceiptDelete
    const rs = await ApiClient.request({
        method,
        url,
        data: {
            bp_number: bpNumber
        }
    })

    return rs
}

export async function getSubscribeReceipt(bpNumber: string) {
    const { method, url } = Endpoints.RegisterReceiptGet
    const rs = await ApiClient.request({
        method,
        url,
        data: {
            bp_number: bpNumber
        },
        config: {
            originalError: true
        }
    })

    if (rs.status === "Success") {
        return mapStoreSubscribeInfoData(rs.data)
    }
    return Promise.reject(rs)
}

export async function getStoresByBP(bp: string) {
    const { method, url } = Endpoints.getActiveShopByBP

    try {
        const rs = await ApiClient.request({
            method,
            url: `${url}?bp_number=${bp}`,
            config: {
                originalError: true
            }
        })

        if (rs.status === "Success") {

            const user = VXS.Root.getUser()
            let branchList = user?.branchList || []

            try {
                if (branchList.length === 0) {
                    branchList = await getBranchList()
                }
            } catch (e) {
                //
            }

            const { data } = rs
            return Array.isArray(data) ? data.filter(x => x.contract_type_name.replaceAll(" ", "").toLowerCase() != "securitydeposit:unitdecorate").map(d => {
                const s = new StoreModel.Store()

                const branchCode = d.branch_code || ""
                const branch = branchList.find(b => b.code === branchCode)

                s.id = d.shop_id || ""
                s.nameTh = d.shop_name || ""
                s.nameEn = d.shop_name || ""
                s.branch.code = branchCode
                s.branch.nameTh = d.branch_name || ""
                s.branch.nameEn = d.branch_name || ""
                s.isBangkokBranch = d.is_bkk_branch === 1
                s.floorCode = d.floor_code || ""
                s.floorRoom = d.floor_room || ""
                s.branch = branch || s.branch

                return s
            }) : []
        }

        return Promise.reject(new Error(rs.message))
    } catch (e) {
        const { response } = e
        if (response) {
            if (response.status === 404) {
                return []
            }
            return Promise.reject(response.data)
        }
        return Promise.reject(e)
    }

}

export function getActiveStoresByBPForReward() {
    return getActiveStoresByBP([PERMISSIONS.rewards_manage_point, PERMISSIONS.rewards_manage_point])
}

export async function getActiveStoresByBPForShopSale() {
    return getActiveStoresByBP([PERMISSIONS.shop_sale])
}

export async function getActiveStoresByBPForCoupon() {
    return getActiveStoresByBP([PERMISSIONS.coupon_main])
}

export async function getActiveStoresByForEditeProfilePage() {
    const resultStores: StoreModel.Store[] = [];
    const user = VXS.Root.getUser()
    if (user == null) {
        return resultStores;
    } else {
        const checkHasPermission = user.permissions.filter((x: any) => x.permission == PERMISSIONS.shop_sale)
        if (checkHasPermission.length > 0 || user.isOwner) {
            return getActiveStoresByBP([PERMISSIONS.shop_sale])
        } else {
            return resultStores;
        }
    }
}

export async function getActiveStoresByBPForCouponHistory() {
    return getActiveStoresByBP([PERMISSIONS.coupon_history])
}


async function getActiveStoresByBP(permissionKeys: string[]) {
    const { method, url } = Endpoints.getActiveShopByBPFilter

    const user = VXS.Root.getUser()

    if (!user) {
        throw new Error("User not found")
    }

    interface FilterShop {
        shop_number: string
        industry_code: string
        branch_code: string
    }

    let stores: FilterShop[] = []
    if (!user.isOwner) {
        const permissions = user.permissions.filter(p => permissionKeys.includes(p.permission))

        if (permissions.length === 0) {
            throw new Error("User has no permission for this feature")
        } else {
            stores = permissions.map(p => p.shops.map(s => ({
                shop_number: s.number,
                industry_code: s.industryCode,
                branch_code: s.branch.code,
                floor_room: s.floorRoom
            }))).flat()

            stores = stores.filter(x =>
                x.shop_number != "" &&
                x.industry_code != "" &&
                x.branch_code != ""
            )

            if (stores.length === 0) {
                return []
            }
        }
    }

    const data: any = {
        bp_number: user.bpNumber || user.customerNo,
        filter_by: stores
    }

    try {
        const rs = await ApiClient.request({
            method,
            url,
            config: {
                originalError: true
            },
            data
        })

        if (rs.status === "Success") {

            const user = VXS.Root.getUser()
            let branchList = user?.branchList || []

            try {
                if (branchList.length === 0) {
                    branchList = await getBranchList()
                }
            } catch (e) {
                //
            }

            const { data } = rs
            return Array.isArray(data) ? data.map(d => {
                const s = new StoreModel.Store()

                const branchCode = d.branch_code || ""
                const branch = branchList.find(b => b.code === branchCode)

                s.nameTh = d.shop_name || ""
                s.nameEn = d.shop_name || ""
                s.branch.code = branchCode
                s.branch.nameTh = d.branch_name || ""
                s.branch.nameEn = d.branch_name || ""
                s.isBangkokBranch = d.is_bkk_branch === 1
                s.floorRoom = d.floor_room || ""
                s.branch = branch || s.branch
                s.id = d.id || d.shop_id || ctjs.MD5(JSON.stringify(d)).toString()
                s.industryCode = d.industry_code || ""
                s.number = d.shop_number || ""

                Object.defineProperty(s, "rawData", {
                    value: d,
                    writable: false
                })

                return s
            }) : []
        }

        return Promise.reject(new Error(rs.message))
    } catch (e) {
        const { response } = e
        if (response) {
            if (response.status === 404) {
                return []
            }
            return Promise.reject(response.data)
        }
        return Promise.reject(e)
    }

}

export function getStorefloorRoom(store: StoreModel.Store) {
    try {
        let starSign = ""
        const room = String(store.floorRoom || "")

        if (room) {
            starSign = (room.includes(",") || room.includes(";")) ? "*" : ""
        }

        let happy = room.split("_")[1] || ""

        if (happy.includes(";")) {
            happy = happy.split(";")[0] || ""
        }

        if (happy.includes(",")) {
            happy = happy.split(",")[0] || ""
        }

        return happy + starSign
    } catch (e) {
        return ""
    }
}

export async function checkPermissionOrdering() {
    const { method, url } = Endpoints.checkPermission

    try {
        const rs = await ApiClient.request({
            method,
            url,
            config: {
                originalError: true
            }
        })

        if (rs.status === "Success") {

            const user = VXS.Root.getUser()
            let branchList = user?.branchList || []

            try {
                if (branchList.length === 0) {
                    branchList = await getBranchList()
                }
            } catch (e) {
                //
            }

            const { data } = rs
            return Array.isArray(data) ? data.map(d => {
                const s = new StoreModel.Contract()

                const branchCode = d.branch_code || ""
                const branch = branchList.find(b => b.code === branchCode)

                // s.nameTh = d.shop_name || ""
                // s.nameEn = d.shop_name || ""
                // s.branch.code = branchCode
                // s.branch.nameTh = d.branch_name || ""
                // s.branch.nameEn = d.branch_name || ""
                // s.floor_room = d.floor_room || ""
                // s.branch = branch || s.branch
                // s.id = d.id 

                s.id = d.id || 0
                s.nameTh = d.contract_name || ""
                s.nameEn = d.contract_name || ""
                s.contract_number = d.contract_number || ""
                s.contract_name = d.contract_name || ""
                s.floor_room = d.floor_room || ""
                s.branch_code = d.branch_code || ""
                s.branch_name = d.branch_name || ""

                Object.defineProperty(s, "rawData", {
                    value: d,
                    writable: false
                })

                return s
            }) : []
        }

        return Promise.reject(new Error(rs.message))
    } catch (e) {
        const { response } = e
        if (response) {
            if (response.status === 404) {
                return []
            }
            return Promise.reject(response.data)
        }
        return Promise.reject(e)
    }
}
export async function getShopsByUser() {
    const { method, url } = Endpoints.getShopsByUser

    try {
        const rs = await ApiClient.request({
            method,
            url,
            config: {
                originalError: true
            }
        })

        const user = VXS.Root.getUser()
        let branchList = user?.branchList || []

        try {
            if (branchList.length === 0) {
                branchList = await getBranchList()
            }
        } catch (e) {
            //
        }
        const { data } = rs
        if (rs.status === "Success") {
            return Array.isArray(data) ? data.filter(x => x.contract_type_name.replaceAll(" ", "").toLowerCase() != "securitydeposit:unitdecorate").map(d => {
                const s = new StoreModel.Store()

                const branchCode = d.branch_code || ""
                const branch = branchList.find(b => b.code === branchCode)

                s.nameTh = d.shop_name || ""
                s.nameEn = d.shop_name || ""
                s.branch.code = branchCode
                s.branch.nameTh = d.branch_name || ""
                s.branch.nameEn = d.branch_name || ""
                s.isBangkokBranch = d.is_bkk_branch === 1
                s.floorRoom = d.floor_room || ""
                s.branch = branch || s.branch
                s.id = d.id || d.shop_id || ctjs.MD5(JSON.stringify(d)).toString()
                s.industryCode = d.industry_code || ""
                s.number = d.shop_number || ""

                Object.defineProperty(s, "rawData", {
                    value: d,
                    writable: false
                })

                return s
            }) : []
        }
        return Promise.reject(new Error(rs.message))
    } catch (e) {

        const { response } = e
        if (response) {
            if (response.status === 404) {
                return []
            }
            return Promise.reject(response.data)
        }
        return Promise.reject(e)
    }
}

export async function getSettingExpireDate() {
    const { method, url } = Endpoints.getSettingExpireDate

    try {
        const rs = await ApiClient.request({
            method,
            url,
            config: {
                originalError: true
            }
        })

        if (rs.status === "Success") {
            return rs.data;
        }

        return Promise.reject(new Error(rs.message))
    } catch (e) {
        const { response } = e
        if (response) {
            if (response.status === 404) {
                return []
            }
            return Promise.reject(response.data)
        }
        return Promise.reject(e)
    }
}
