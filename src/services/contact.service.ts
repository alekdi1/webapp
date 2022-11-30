import { Endpoints } from "@/config"
import { uploadFile } from "./file.service"
import ApiClient from "@/modules/api"
import { ContactModel } from "@/models"
import { getBranchById } from "./branch.service"

interface ContactParams {
    branchId: string
    title: string
    description: string
    images: File[]
    contactName: string
    phone: string
    email: string
}

export async function createContact(data: ContactParams) {
    const { method, url } = Endpoints.createQA

    const images = await Promise.all(data.images.map(f => uploadFile(f)))

    const body = {
        branch_id: data.branchId,
        title: data.title,
        description: data.description,
        images: images.map(i => i.name),
        contact_name: data.contactName,
        contact_phone: data.phone,
        contact_email: data.email
    }

    const rs = await ApiClient.request({
        method,
        url,
        data: body
    })

    if (rs.status === "Success") {
        return rs.data
    }

    return rs
}

export async function createContactAnonymous(data: ContactParams) {
    const { method, url } = Endpoints.createContactAnonymous
    const images = await Promise.all(data.images.map(f => uploadFile(f)))

    const body = {
        branch_id: data.branchId,
        title: data.title,
        description: data.description,
        images: images.map(i => i.name),
        contact_name: data.contactName,
        contact_phone: data.phone,
        contact_email: data.email
    }

    const rs = await ApiClient.request({
        method,
        url,
        data: body
    })

    if (rs.status === "Success") {
        return rs.data
    }

    return rs
}


export async function getContactDetail(id: string|number) {
    const { method, url } = Endpoints.getQA(id)
    const rs = await ApiClient.request({
        method,
        url
    })

    if (rs.status === "Success") {
        const d = mapContactDetailData(rs.data)

        try {
            const branch = await getBranchById(String(d.branchId))
            d.branch = branch
        } catch (c) {
            //
        }

        return d
    }

    return Promise.reject(rs)
}

const mapContactUser = (userData: any) => {
    const u = new ContactModel.CreatedUser()
    u.firstname = userData.first_name || ""
    u.id = userData.id || 0
    u.lastname = userData.last_name || ""
    u.createdDate = userData.created_at || ""
    return u
}

const mapReplyUser = (userData: any) => {
    const u = new ContactModel.ReplyUser()
    u.firstname = userData.first_name || ""
    u.id = userData.id || 0
    u.lastname = userData.last_name || ""
    u.repliedDate = userData.reply_date  || ""
    return u
}

export function mapContactDetailData(data: any = {}) {
    const c = new ContactModel.ContactDetail()

    c.id = data.id || 0
    c.branchId = data.branch_id || 0
    c.contactEmail = data.contact_email || ""
    c.contactName = data.contact_name || ""
    c.contactPhone = data.contact_phone || ""
    c.createdBy = mapContactUser(data.created_by)
    c.description = data.description || ""
    c.images = Array.isArray(data.images) ? data.images : []
    c.repliedBy = mapReplyUser(data.replied_by)
    c.replyImage = data.reply_image || ""
    c.replyMessage = data.reply_message || ""
    c.status = data.status || ""
    c.title = data.title || ""

    return c
}