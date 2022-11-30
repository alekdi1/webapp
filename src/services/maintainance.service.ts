import * as Endpoints from "@/config/endpoints"
import ApiClient from "@/modules/api"
import { StoreModel, MaintainanceModel } from "@/models"
import { uploadFile } from "./file.service"


export const MAINTENANCE_STATUS = {
    pending: "Pending",
    inprogress: "InProcress",
    complete: "Complete",
    cancel: "Cancel"
}

// ---------------------- Survey---------------------
interface SurveyParams {
    mrId: string
    q1: number
    q2: number
    q3: number
    q4: number
    description: string
}

export async function rateSurvey(tenantNo: string, data: SurveyParams) {
    const { method, url } = Endpoints.rateSurvey

    const headers = {
        "Contect-type": "application/x-www-form-urlencoded"
    }

    try {
        await ApiClient.request({
            method: method,
            url: url.replace(":tenantId", tenantNo),
            headers: headers,
            data: data
        })
    } catch (e) {
        return Promise.reject(new Error(`Failed to submit assessment with error: ${e}`))
    }
}

// -------------------- Store List --------------------
function mapSurvey(d: any = {}) {
    const s = new MaintainanceModel.Survey()
    s.status = d.status
    s.score = d.score
    s.createDate = d.createDate
    s.isRequired = d.is_req_survey
    return s
}

function mapMaintainanceTime(d: any = {}) {
    const t = new MaintainanceModel.MaintainanceTime()
    t.startDate = d.startDate
    t.endDate = d.endDate
    t.requestTime = d.requestTime
    return t
}

function mapMaintainanceResponse(d: any = {}) {
    const r = new MaintainanceModel.MaintainanceResponse()
    r.name = d ? d.name : ""
    r.contactNumber = d ? d.contactNumber : ""
    r.message = d ? d.responseMessage : ""
    return r
}

function mapMaintainance(d: any = {}) {
    const m = new MaintainanceModel.Maintainance()
    m.maintainanceId = d.mrId
    m.maintainanceNo = d.mrNo
    m.tenantId = d.tenantId
    m.contactName =  d.requestBy
    m.phoneNumber = d.contactNumber
    m.survey = mapSurvey(d.survey)
    m.desc = d.description
    m.createDate = d.createDate
    m.time = mapMaintainanceTime(d.time)
    m.typeId = d.typeId
    m.typeName = d.typeName
    m.typeOther = d.typeOther
    m.typeGroupId = d.typeGroupId
    m.typeGroupName = d.typeGroupName
    const imgs = d.attachments
    m.imageUrls = Array.isArray(imgs) ? imgs : []
    m.status = d.status
    if (d.responseBy) {
        m.responseBy = mapMaintainanceResponse(d.responseBy)
    }
    m.updateDate = d.updateDate
    m.updateBy = d.updateBy
    return m
}

function mapMaintainanceStore(d: any = {}) {
    const s = new StoreModel.MaintainanceStore()
    s.storeId = d.tenantId || ""
    s.storeName = d.tenantName || ""
    s.branchCode = d.branchCode || ""
    s.branchTH = d.branchNameTH || ""
    s.branchEN = d.branchNameENG || ""

    const maintenances = d.maintenances
    s.maintenances = Array.isArray(maintenances) ? maintenances.map(m => mapMaintainance(m)) : []
    return s
}

export function _mapMaintainanceStore(d: any = {}) {
    const s = new StoreModel.MaintainanceStore()
    s.storeId = d.tenantId || ""
    s.storeName = d.tenantName || ""
    s.branchCode = d.branchCode || ""
    s.branchTH = d.branchNameTH || ""
    s.branchEN = d.branchNameENG || ""

    const maintenances = d.maintenances
    s.maintenances = Array.isArray(maintenances) ? maintenances.map(m => mapMaintainance(m)) : []
    return s
}

export async function getStoreListByBP(bpNo?: string, tenantId?: string) {
    const { method, url } = Endpoints.getStoreListByBP

    let query = "?"

    if (bpNo) {
        query = query + `BP=${ bpNo }`
    }

    if (tenantId) {
        query = query + `&tenantId=${tenantId}`
    }

    const rs = await ApiClient.request({
        method: method,
        url: `${ url }` + query,
    })

    const resp = rs.data
    if (Array.isArray(resp)) {
        return resp.map(d => mapMaintainanceStore(d))
    }
    return []
}

// -------------------- Create Maintainance --------------------
interface MaintainaceParams {
    userId?: string
    bpId: string
    tenantId: string
    topic: string
    description: string
    images: (File|string)[]
    date: string
    time: string
    contactName: string
    phone: string
}

export async function createMaintainance (data: MaintainaceParams) {
    const { method, url } = Endpoints.createMaintainance

    const imageUrls: string[] = data.images.filter(f => typeof f === "string") as string[]
    const imageFiles: File[] = data.images.filter(f => typeof f !== "string") as File[]
    const images = await Promise.all(imageFiles.map(f => uploadFile(f)))
    for (const img of images) {
        imageUrls.push(img.url)
    }

    const body: { [key: string]: any } = {
        bp_number: data.bpId,
        tenantId: data.tenantId,
        type: data.topic,
        attachments: imageUrls,
        contactNumber: data.phone,
        description: data.description,
        requestBy: data.contactName,
        time: {
            requestTime: data.time,
            startDate: data.date
        }
    }

    if (data.userId) {
        body.user_id = data.userId
    }

    const rs = await ApiClient.request({
        method,
        url,
        data: body
    })

    return rs.result
}

interface MaintainaceCancelParams {
    maintainanceId: number,
    userId: string
    tenantId: string
}

export async function cancelMaintainance (data: MaintainaceCancelParams) {
    const { method, url } = Endpoints.cancelMaintainance

    const body = {
        tenantId: data.tenantId,
        mrId: data.maintainanceId,
        user_id: data.userId
    }

    await ApiClient.request({
        method,
        url,
        data:body
    })
}

export async function getMaintainanceByNotiRefId(refId: string) {
    const rs = await ApiClient.request({
        ...Endpoints.getMaintainanceByNotiRefId(refId)
    })

    const { data } = rs
    return {
        tenantId: data.tenant_id
    }
}
