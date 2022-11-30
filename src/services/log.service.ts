import { apiLogCollection  } from "@/firebases"
import moment from "moment"

export type EventType = "onPageLoad" | "onApiCallStart" | "onApiCallFinsih" | "onReady" | null

export class PLog {
    page = ""
    userNo = ""
    type: EventType = null
    timestamp = moment().toISOString()
    domain = window.origin
    api?: {
        url: string
        method: string
    }

    constructor (page: string, userNo: string, type: EventType, api = { url: "", method: "" }) {
        this.page = page
        this.userNo = userNo
        this.type = type
        this.api = api
    }
}

export async function addApiLog(apiObj: PLog) {
    try {
        await apiLogCollection.add(Object.assign({}, apiObj))
    } catch (e) {
        // 
    }
}
