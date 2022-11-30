import { Endpoints } from "@/config"
import { UserModel } from "@/models"
import { StorageUtils } from "@/utils"
import ApiClient from "@/modules/api"
import { mapUserInfo } from "./user.service"
import { Root as VuexRoot } from "./vuex.service"
import { getUserInfo } from "./user.service"
import moment from "moment"

const AUTH_USER_KEY = "AUTH-USER"

export const ERROR_CODE = Object.freeze({
    force_logout: "close_logout",
    user_pending: "user_pending",
    user_expired: "user_expired"
})

export async function loginValidation(username: string, password: string) {
    const { method, url } = Endpoints.loginValidation
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    const resp = await ApiClient.request({
        method: method,
        url: url,
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    })

    if (resp.IsSuccess === true) {
        return mapUserInfo(resp.data)
    }
    return Promise.reject(new Error(resp.ErrMessage))
}

export async function getAccountInfo(type: "tax" | "username", value: string) {
    const { method, url } = Endpoints.resetAccountGetInfo

    try {
        const res = await ApiClient.request({
            method,
            url: url + `?${type === "tax" ? "tax_id" : "username"}=${value}`
        })

        const { data } = res

        return {
            id: data.id || "",
            email: data.email || "",
            phone: data.phone_number || ""
        }
    } catch (e) {
        return Promise.reject(e)
    }
}

export async function submitSendResetAccount(resetType: "password" | "username", to: string, uid: string) {
    const { method, url } = Endpoints.submitSelectResetMethod

    const body = {
        user_id: uid,
        send_to: to,
        is_forgot_username: resetType === "username",
        is_forgot_password: resetType === "password"
    }

    try {
        const res = await ApiClient.request({
            method,
            url,
            data: body,
            config: {
                noAuth: true
            }
        })

        return res
    } catch (e) {
        return Promise.reject(e)
    }
}

export async function submitResetAccount(email: string, token: string, type: "password" | "username", value: string) {
    const { method, url } = Endpoints.submitResetAccount

    const data: any = {
        email,
        token,
        reset_type: type
    }

    if (type === "password") {
        data.new_password = value
    } else if (type === "username") {
        data.new_username = value
    }

    try {
        const res = await ApiClient.request({
            method,
            url,
            data,
            headers: {
                "Content-Type": "application/json"
            }
        })

        return res
    } catch (e) {
        return Promise.reject(e)
    }
}

export async function login(username: string, password: string) {
    try {
        const { method, url } = Endpoints.userLogin
        const rs = await ApiClient.request({
            method,
            url,
            data: {
                username,
                password
            },
            config: {
                originalError: true
            }
        })


        const res: {
            status: string
            message: string
            data: {
                access_token: string
                token_type: string
                expires_at: string
            }
        } = rs

        const u = new UserModel.AuthUser()
        u.token = res.data.access_token
        u.expiredDate = res.data.expires_at

        return u

    } catch (error) {
        return Promise.reject(error)
    }
}

export function storeAuthUserToLocal(user: UserModel.AuthUser) {
    StorageUtils.setItem(AUTH_USER_KEY, user, "LOCAL")
}

export function clearLocalAuthUser() {
    StorageUtils.removeItem(AUTH_USER_KEY, "LOCAL")
}

export function getLocalAuthUser(): UserModel.AuthUser | null {
    const ud = StorageUtils.getItem(AUTH_USER_KEY, "LOCAL")
    return ud ? Object.assign(new UserModel.AuthUser(), ud) : null
}

export function getAuthUserToken() {
    const u = getLocalAuthUser()
    return u?.token || ""
}

export async function changeCredential(type: "username" | "password", oldCredential: string, newCredential: string) {
    const { method, url } = Endpoints.changeCredential

    /**
     * ถ้า change username ส่ง is_change_password = false
     * ถ้าเปลี่ยน password ส่ง is_change_password = true
    */
    const data = {
        old_credential: oldCredential,
        new_credential: newCredential,
        is_change_password: type === "password"
    }

    const response = await ApiClient.request({
        method,
        url,
        data
    })

    return response
}

export async function logout() {
    clearLocalAuthUser()
    await VuexRoot.setUser(null)
}

export async function getUserConsentStatus(token: string) {
    const userInfo = await getUserInfo(token)
    try{
       
        if (!userInfo || userInfo == null) {
            return null
        }
        const rs = await ApiClient.request({
            url: Endpoints.checkUserConsent.url,
            method: Endpoints.checkUserConsent.method,
            data: {
                // first_name: userInfo.firstName,
                // last_name: userInfo.lastName,
                // mobile_no: userInfo.mobileNo,
                cpntid: userInfo.cpntid,
                // tax_id: userInfo.taxId
            },
            headers: {
                Authorization: "Bearer " + token
            }
        })

        return {
            calpdh:true,
            status: {
                tnc: userInfo.isAcceptTnC,
                consent: rs.require_consent !== "Y"
            },
            data: {
                user: userInfo,
                consent: rs
            }
        }
    } catch (e) {
        return {
            calpdh:false,
            status: {
                tnc: userInfo.isAcceptTnC,
                consent:false
            },
            data: {
                user: userInfo,
                consent: {}
            }
        }
    }
     // for pentest 

    // const responseData = rs.data;
    // return {
    //     status: {
    //         tnc: userInfo.isAcceptTnC,
    //         consent: responseData.require_consent !== "Y"
    //     },
    //     data: {
    //         user: userInfo,
    //         consent: responseData
    //     }
    // }

    /**
        api_type: "CONSENT_STATUS_CHECK"
        consent_channel: null
        consent_date: null
        consent_status: null
        consent_version: null
        cpntid: null
        first_name: "QA"
        last_name: "QA"
        mobile_no: "0962965455"
        require_consent: "Y"
        result_code: "0000"
        result_msg_en: "Success"
        result_msg_th: "สำเร็จ"
        tax_id: null
    */
    
}

export async function acceptConsentAndTnC(user: UserModel.User, version: number, token: string, accept: { consent: boolean, tnc: boolean }, status: string | null = null) {

    const result: {
        consent: any
        tnc: any
    } = {
        consent: null,
        tnc: null
    }

    const headers = { Authorization: "Bearer " + token }
    const consent_accept_condition_status = accept.consent ? "Y" : status ? "N" : "U";

    try {
        console.log("Updating consent status...")
        const data = {
            cpntid: user.cpntid,
            // tax_id: user.taxId,
            // first_name: user.firstName,
            // last_name: user.lastName,
            // mobile_no: user.mobileNo,
            consent_status: status ? status : consent_accept_condition_status,
            consent_version: version,
            consent_date: moment().format("YYYY-MM-DD") // "2021-03-16"
        }

        const rs = await ApiClient.request({ ...Endpoints.updateUserConsent, data, headers })
        result.consent = rs
        console.log("Update consent done")
    } catch (e) {
        console.log("Update consent error: ", e.message || e)
    }

    if (accept.tnc) {
        try {
            console.log("Updating term & condition status...")
            const rs = await ApiClient.request({ ...Endpoints.acceptTnC, headers })
            result.tnc = rs
            console.log("Update term & condition done")
        } catch (e) {
            console.log("accept tnc error: ", e.message || e)
        }
    }

    return result
}


export async function acceptConsent(user: UserModel.User, version: number, token: string, accept: { consent: boolean, tnc: boolean }, status: string | null = null) {

    const result: {
        consent: any
        tnc: any
    } = {
        consent: null,
        tnc: null
    }

    const headers = { Authorization: "Bearer " + token }
    const consent_accept_condition_status = accept.consent ? "Y" : status ? "N" : "U";

    try {
        console.log("Updating consent status...")
        const data = {
            cpntid: user.cpntid,
            // tax_id: user.taxId,
            // first_name: user.firstName,
            // last_name: user.lastName,
            // mobile_no: user.mobileNo,
            consent_status: status ? status : consent_accept_condition_status,
            consent_version: version,
            consent_date: moment().format("YYYY-MM-DD") // "2021-03-16"
        }

        const rs = await ApiClient.request({ ...Endpoints.updateUserConsent, data, headers })
        result.consent = rs
        console.log("Update consent done")
    } catch (e) {
        console.log("Update consent error: ", e.message || e)
    }
    return result
}

export async function getConsent(token?: string) {
    const headers: any = {}
    if (token) {
        headers.Authorization = "Bearer " + token
    }

    const rs = await ApiClient.request({
        ...Endpoints.getConsent,
        headers
    })

    /*
    api_type: "CONSENT_GET"
    consent_message_en: "html"
    consent_message_th: "html"
    consent_version: 6
    result_code: "0000"
    result_msg_en: "Success"
    result_msg_th: "สำเร็จ"
    term_and_condition_en: "..."
    term_and_condition_th: "..."
    */
    
    console.log("rs -- getConsent --> ", rs)

    // for pentest
    // const responseData = rs.data;
    // if (rs.status_code == 1 && responseData.result_code === "0000") {
    //     return {
    //         consentHtmlTh: String(responseData.consent_message_th || ""),
    //         consentHtmlEn: String(responseData.consent_message_en || ""),
    //         termAndConditionTh: String(responseData.term_and_condition_th || ""),
    //         termAndConditionEn: String(responseData.term_and_condition_en || ""),
    //         version: Number(responseData.consent_version)
    //     }
    // } else {
    //     return Promise.reject(rs)
    // }

    if (rs.result_code === "0000") {
        return {
            consentHtmlTh: String(rs.consent_message_th || ""),
            consentHtmlEn: String(rs.consent_message_en || ""),
            termAndConditionTh: String(rs.term_and_condition_th || ""),
            termAndConditionEn: String(rs.term_and_condition_en || ""),
            version: Number(rs.consent_version)
        }
    }

    return Promise.reject(rs)
}

export async function checkIsvalideToken(email: string, token: string, type: "new_user" | "password" | "username") {
    const { method, url } = Endpoints.checkIsvalideToken

    const data: any = {
        email,
        token,
        reset_type: type
    }

    try {
        const resp = await ApiClient.request({
            method,
            url,
            data,
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (resp.status === "Success") {
            return { data: true }
        }
        return Promise.reject(new Error("Check token is error"));
    } catch (e) {
        return Promise.reject(e)
    }
}