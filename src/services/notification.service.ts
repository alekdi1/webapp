import { Endpoints } from "@/config"
import ApiClient from "@/modules/api"
import { PostModel } from "@/models"

export const TYPES = Object.freeze({
    payment: "payment",
    contact_us: "contact_us",
    contract: "contract",
    // invoice: "invoice",
    payment_pending: "payment_pending",
    payment_success: "payment_success",
    maintenance: "maintenance",
    post: "post",
    promotion: "promotion",
    request_void: "request_void",
    approve_void: "approve_void",
    reject_void: "reject_void",
    branch_annonuce: "branch_annonuce"
})

export async function getOnlyForYou() {
    const { method, url } = Endpoints.getNotiV2

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url
        })

        if (resp.status === "Success") {
            const { data } = resp
            const rawNotis = []
            for (const key in data) {
                rawNotis.push(data[key])
            }
            const notis = rawNotis.flat()
            return Array.isArray(notis) ? notis.map(n => mapNotification(n)) : []
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error("Get Notifications error"))
    }
}

export async function getGuestOnlyForYou (bpNo: string) {
    const { method, url } = Endpoints.getGuestNotiV2

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + `?${bpNo}`
        })

        if (resp.status === "Success") {
            const { data } = resp
            const rawNotis = []
            for (const key in data) {
                rawNotis.push(data[key])
            }
            const notis = rawNotis.flat()
            return Array.isArray(notis) ? notis.map(n => mapNotification(n)) : []
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error("Get Notifications error"))
    }
}

export async function getNotification() {
    const { method, url } = Endpoints.getNoti

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url
        })

        if (resp.status === "Success") {
            const { data } = resp
            return Array.isArray(data) ? data.map(n => mapNotification(n)) : []
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error("Get Notifications error"))
    }
}

export async function getGuestNotification (bpNo: string) {
    const { method, url } = Endpoints.getGuestNoti

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + `?bp_number=${bpNo}`
        })

        if (resp.status === "Success") {
            const { data } = resp
            return Array.isArray(data) ? data.map(n => mapNotification(n)) : []
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error("Get Notifications error"))
    }
}

export async function markNotisAsRead(notiIds: (string|number)[]) {
    const { method, url } = Endpoints.markAsReadNotifications
    const rs = await ApiClient.request({
        method,
        url,
        data: {
            noti_ids : notiIds
        }
    })
    return rs
}

function mapNotification(d: any = {}) {
    const n = new PostModel.Notification()
    n.id =  d.id || ""
    n.type = d.type || ""
    n.title = d.title || d.noti_title || ""
    n.desc = d.description || d.noti_description || ""
    n.refId = d.reference_id || ""
    n.publishedBy = d.published_by || ""
    n.createdDate = d.created_at || ""
    n.updatedDate = d.updated_at || ""
    n.isRead = d.read === 1
    n.branchName = d.branch_name || ""
    return n
}
