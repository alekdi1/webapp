import { UserModel, EmpModel } from "@/models"
import { Endpoints } from "@/config"
import ApiClient from "@/modules/api"

export async function getContact(customerNo: string) {
    const { method, url } = Endpoints.getContact
    const formData = new FormData()
    formData.append("BP", customerNo)

    const resp = await ApiClient.request({
        method: method,
        url: url,
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    })

    if (resp.IsSuccess === true) {
        const respData = resp.data
        return Array.isArray(respData) ? respData.map((c: any) => mapContact(c)) : []
    }
    return Promise.reject(new Error(resp.ErrMessage))
}

export async function getUserByTenantId( tenantId?: string) {
    const { method, url } = Endpoints.getStoreListByBP

    let query = "?"
    if (tenantId) {
        query = query + `&tenantId=${tenantId}`
    }

    const rs = await ApiClient.request({
        method: method,
        url: `${ url }` + query,
    })

    const resp = rs.data
    if (Array.isArray(resp)) {
        return rs
    }
    return {}
}

export async function getUserFavMenu() {
    const { method, url } = Endpoints.getUserFavMenu

    const resp = await ApiClient.request({
        method: method,
        url: url,
    })

    if (resp.status === "Success") {
        const favs = resp.data
        return Array.isArray(favs) ? favs.map(m => mapUserFavMenu(m)) : []
    }
    return Promise.reject(new Error(resp.message))
}

export async function updateUserFavMenu(menus: UserModel.UserFavMenu[]) {
    const { method, url } = Endpoints.updateUserFavMenu

    const data = {
        items: menus.map(m => {
            return {
                menu_id: m.id,
                menu_name: m.name,
                position: m.position
            }
        })
    }

    try {
        await ApiClient.request({
            method: method,
            url: url,
            data: data
        })
    } catch (e) {
        return Promise.reject(new Error("Failed to update favorite menu list"))
    }
}

export async function ownerRegister(token: string, regInfo: UserModel.OwnerRegister) {
    const { method, url } = Endpoints.registerOwner
    const data = {
        email: regInfo.email,
        username: regInfo.username,
        password: regInfo.password,
        token: token,
        staffs: regInfo.staffs.length > 0 ? regInfo.staffs.map(r => {
            const o: any = {}
            o.role = r.role
            if (r.email) {
                o.email = r.email
            }

            if (r.phone) {
                o.phone_number = r.phone
            }
            return o
        }) : []
    }

    try {
        return await ApiClient.request({
            method: method,
            url: url,
            data: data
        })
    } catch (e) {
        return e
    }
}

interface EmployeeByOwnerParams {
    role: string
    token: string
    email?: string
    phone_number?: string
}

export async function registerEmployee(staff: EmployeeByOwnerParams) {
    const { method, url } = Endpoints.registerEmployeeByOwner

    const data: EmployeeByOwnerParams = {
        role: staff.role,
        token: staff.token,
    }

    if (staff.email) {
        data.email = staff.email
    }

    if (staff.phone_number) {
        data.phone_number = staff.phone_number
    }

    try {
        await ApiClient.request({
            method: method,
            url: url,
            data: data
        })
    } catch (e) {
        return Promise.reject(new Error(e.message))
    }
}

function mapRegisteredStaff(d: any = {}) {
    const s = new EmpModel.RegisteredStaff()
    s.id = d.id
    s.email = d.email
    s.phone = d.phone_number
    s.role = d.role
    s.url = d.create_credential_link
    return s
}

function mapRegisteredInfo(d: any = {}) {
    const o = new EmpModel.RegisteredInfo()
    o.ownerName = d.owner_username

    const s = d.staffs
    o.staffs = Array.isArray(s) ? s.map(d => mapRegisteredStaff(d)) : []

    return o
}

export async function retriveEmployee(token: string) {
    const { method, url } = Endpoints.retrieveRegisterInfo

    const data = { token }

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url,
            data: data
        })

        if (resp.status === "Success") {
            return mapRegisteredInfo(resp.data)
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error(e.message))
    }
}

export async function retriveUserDetail(token: string) {
    const { method, url } = Endpoints.retrieveUserDetail

    const data = { token }

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url,
            data: data
        })

        /* Full response:
            {
                "id": 218,
                "first_name": null,
                "last_name": null,
                "email": "pichasamon@gmail.com",
                "username": null,
                "bp_number": "0001000034",
                "phone_number": null,
                "tax_id": null,
                "is_active": 1,
                "last_login": null,
                "login_count": 0,
                "role_id": 2,
                "manager_id": null,
                "token": "eyJpdiI6IjRucDE2N0xSR1loL1ZuRXVkcTNtVEE9PSIsInZhbHVlIjoiSDV6UXp5a3V0Q3cvS05xL0dvZUxtQT09IiwibWFjIjoiNzhmYTRjMDg5ZWVhYTk1ZDgzZDc3NjE2MjYxZWI1ZjMwZmEwZmNjZDdkM2QzODExMWU3ZTZhOTc2NTUzMjg3NCJ9",
                "player_id": null,
                "credential_created": null,
                "package_owner_id": 217,
                "effective_start_date": "2012-12-03",
                "effective_end_date": "2020-12-02",
                "user_level": "0102",
                "is_new_user": null,
                "user_type": "user",
                "created_by": null,
                "updated_by": null,
                "created_at": "2021-05-20T15:46:32.000000Z",
                "updated_at": "2021-05-20T15:46:32.000000Z",
                "force_logout_status": "N",
                "created_by_ad_user": null,
                "updated_by_ad_user": null,
                "created_by_system": null,
                "contact_type": null,
                "accept_tc": 0,
                "cpntid": null,
                "profile_type": "I",
                "is_convert_to_member": 1
            }
        */

        return {
            firstname: resp.first_name,
            lastname: resp.last_name,
            email: resp.email,
            phone: resp.phone_number,
            isActive: resp.is_active
        }
    } catch (e) {
        return Promise.reject(new Error(e.message))
    }

}

interface EmployeeParams {
    firstname: string,
    lastname: string,
    username: string,
    password: string,
    email?: string,
    phone?: string,
}

interface EmployeeRequestParams {
    first_name: string
    last_name: string
    username: string
    password: string
    token: string
    email?: string
    phone_number?: string
}

export async function employeeRegister(token: string, regInfo: EmployeeParams) {
    const { method, url } = Endpoints.registerEmployee

    const data: EmployeeRequestParams = {
        first_name: regInfo.firstname,
        last_name: regInfo.lastname,
        username: regInfo.username,
        password: regInfo.password,
        token: token
    }

    if (regInfo.email) {
        data.email = regInfo.email
    }

    if (regInfo.phone) {
        data.phone_number = regInfo.phone
    }

    try {
        await ApiClient.request({
            method: method,
            url: url,
            data: data
        })
    } catch (e) {
        return Promise.reject(new Error(e.message))
    }
}

interface RegisterParams {
    firstname: string
    lastname: string
    email: string
    phone: string
    shopName: string
    branchId: string
    userType: string
    contactType: number
    fileNames: string[]
    companyName?: string
    taxId?: string
    cid?: string
}

interface RequestRegisterParams {
    firstname: string
    lastname: string
    email?: string
    phone_number?: string
    branches_code: string
    contact_type: number
    // I: Ordinary, C: Cooperation
    user_type: string
    shop_name: string
    file_upload_list: string[]
    citizen_id?: string
    tax_id?: string
    company_name?: string
}

interface RegisterErrorResponse {
    data: null
    message: string
    status: string
    error_code: number
}

function getRegisterErrorMessage(type: string, error: RegisterErrorResponse) {
    const code = error.error_code
    const protocal = window.location.protocol
    const hostname = protocal + '//' + window.location.hostname
    switch (code) {
        case 403: return `ท่านเคยทำการลงทะเบียนแล้ว หากท่านจำรหัสผู้ใช้งานไม่ได้ <a href="${hostname}/forgot/username
        " target="_blank" style="color: rgb(179, 150, 86) !important; "> โปรดคลิกที่นี่ </a> หรือติดต่อ call center 02-021-9999`
        case 404: return "ไม่พบสาขาที่ต้องการลงทะเบียน"
        default: return JSON.stringify(error.message)
    }
}

export async function onlineRegister(info: RegisterParams) {
    const { method, url } = Endpoints.registerOnline

    const data: RequestRegisterParams = {
        firstname: info.firstname,
        lastname: info.lastname,
        branches_code: info.branchId,
        contact_type: info.contactType,
        shop_name: info.shopName,
        user_type: info.userType,
        file_upload_list: info.fileNames,
    }

    if (info.email) {
        data.email = info.email
    }

    if (info.phone) {
        data.phone_number = info.phone
    }

    if (info.userType === "I") {
        data.citizen_id = info.cid
    }

    if (info.userType === "C") {
        data.company_name = info.companyName
        data.tax_id = info.taxId
    }

    try {
        const resp = await ApiClient.request({ method, url, data })
        return resp
    } catch (e) {
        return { status: "Error", message: getRegisterErrorMessage(info.userType, e) }
    }
}

export function mapUserInfo(data: any = {}) {
    const u = new UserModel.User()
    u.id = data.UserId
    u.customerNo = data.CustomerNo
    u.email = data.Email
    u.firstName = data.FirstName
    u.hashedPassword = data.HashedPassword
    u.lastName = data.LastName
    u.mobileNo = data.MobileNo
    u.role = data.UserRole
    u.contractNumbers = data.ContractNumbers
    u.disable = data.Disable
    u.paymentToken = data.PaymentToken
    u.privacy = data.Privacy

    return u
}

export function mapContact(d: any = {}) {
    const c = new UserModel.Contact()
    c.name = d.NameContact
    c.email = d.EmailContact
    c.mobile = d.MobileContact
    c.contactNumber = d.ContractNumber
    c.contactSaleType = d.ContractSaleType
    c.startDate = d.StartDate
    c.endDate = d.EndDate
    c.currentDate = d.CurrentDate
    c.rentalName = d.RentalObjectName
    c.industryName = d.IndustryName
    c.contactType = d.ContractTypename
    c.branch = d.Branch
    c.brachAddress = d.BrachAddress
    c.shopName = d.ShopName
    c.customerName = d.CustomerName
    c.endDateTime = d.dtEndDate
    c.dateTotal = d.dateTotal
    c.expired = false
    return c
}

export function mapUserFavMenu(d: any = {}) {
    const m = new UserModel.UserFavMenu()
    m.id = d.menu_id
    m.name = d.menu_name
    m.position = d.position
    return m
}

export async function getUserInfo(token: string) {
    const { method, url } = Endpoints.getUserInfo

    try {
        const rs = await ApiClient.request({
            url,
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })

        /**
        {
            status: string
            message: string
            data:  {
                id: number
                first_name: string
                last_name: string
                email: string
                username: string
                role_id: number
                manager_id?: any
                bp_number: string
                phone_number: string
                tax_id: string
                is_active: number
                last_login: string
                login_count: number
                token?: any
                credential_created: string
                created_at: Date
                created_by: string
                updated_at: Date
                updated_by: string
                user_branch_ids: number[]
            }
        }
        */
        const res = rs.data
        const user = mapUserInfoData(res)
        user.token = token

        return user

    } catch (e) {
        return Promise.reject(e)
    }
}

interface UpdateUserPhoneAndEmailRequest {
    email: string
    phone: string
}

export async function updateUserPhoneAndEmail(data: UpdateUserPhoneAndEmailRequest) {
    const { method, url } = Endpoints.updateUserPhoneAndEmail

    const body = {
        email: data.email,
        phone_number: data.phone
    }

    try {
        await ApiClient.request({
            method,
            url,
            data: body
        })
    } catch (e) {
        return Promise.reject(e)
    }
}

function mapUserInfoData(data: any = {}) {
    const u = new UserModel.User()

    u.id = data.id
    u.firstName = data.first_name || ""
    u.lastName = data.last_name || ""
    u.email = data.email || ""
    u.mobileNo = data.phone_number || ""
    u.customerNo = data.bp_number || ""
    u.role = data.role_name || ""
    u.companyName = data.company_name || ""
    u.username = data.username || ""
    u.cpntid = data.cpntid || ""
    u.taxId = data.tax_id || ""
    u.isAcceptTnC = data.accept_tc === 1
    u.bpName = data.bp_name || ""
    u.legal_form_code = data.legal_form_code || ""
    u.bpNumber = data.bp_number || ""
    u.forceLogout = data.force_logout_status === "Y"
    u.allowedBranchIds = Array.isArray(data.user_branch_ids) ? data.user_branch_ids : []
    u.passwordExpireDate = data.password_expire_date
    u.wrongPasswordCount = data.wrong_password_count

    Object.defineProperty(u, "rawData", {
        value: data,
        writable: false
    })

    /*
    bp_number: "0001000004"
    email: "rongruang.r+1000004@gmail.com"
    first_name: "1000004"
    id: 34
    last_login: "2021-03-27 21:25:14"
    last_name: "."
    phone_number: "0862124879"
    role_name: "owner"
    tax_id: "1234567899874"
    username: "1000004"
    */

    try {
        const { permissions } = data
        if (Array.isArray(permissions)) {
            u.permissions = permissions.map(pd => {
                const { shops } = pd
                const p = new EmpModel.EmployeePermission()

                p.permission = String(pd.permission || "").trim()
                p.shops = Array.isArray(shops) ? shops.map(pds => {
                    const s = new EmpModel.EmployeePermissionShop()
                    s.id = pds.shop_id || pds.id || ""
                    s.nameTh = pds.shop_name || pds.name || ""
                    s.nameEn = pds.shop_name || pds.name || ""
                    s.number = pds.shop_number || ""
                    s.industryCode = pds.industry_code || ""
                    s.branch.code = pds.branch_code || ""
                    s.branch.nameTh = pds.branch_name || ""
                    s.branch.nameEn = pds.branch_name || ""
                    s.isBangkokBranch = pds.is_bkk_branch === 1
                    s.floorCode = pds.floor_code || ""
                    s.floorRoom = pds.floor_room || ""
                    return s
                }) : []

                return p
            })

            // u.permissions.push((() => {
            //     const p = new EmpModel.EmployeePermission()
            //     p.permission = "contract_info"
            //     return p
            // })())

            // u.permissions.push((() => {
            //     const p = new EmpModel.EmployeePermission()
            //     p.permission = "contract_renew_refund"
            //     return p
            // })())
        }
    } catch (e) {
        //
    }

    return u
}

export async function getHistoryLogin() {
    const { method, url } = Endpoints.getHistoryLogin

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url
        })

        if (resp.status === "Success") {
            const { data } = resp
            return Array.isArray(data) ? data.map(rowData => mapHistoryLogin(rowData)) : []
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error("Get history login failed"))
    }
}

function mapHistoryLogin(d: any = {}) {
    const h = new UserModel.HistoryLogin()

    h.id = d.id
    h.role = d.role_name
    h.firstName = d.first_name
    h.lastName = d.last_name
    h.lastLogin = d.login_date

    return h
}

interface UserProfileParams {
    firstname: string
    lastname: string
    phone: string
    email: string
}

export async function updateUserProfile(params: UserProfileParams, token: string) {

    const data = {
        firstname: params.firstname,
        lastname: params.lastname,
        email: params.email,
        phone_number: params.phone
    }

    const rs = await ApiClient.request({
        ...Endpoints.updateUserProfile,
        data,
        headers: {
            "Authorization": "Bearer " + token
        }
    })

    return rs
}

export async function createPersonalProfile(id: string) {
    const { method, url } = Endpoints.createPersonalProfile
    const data = {
        id: id
    }
    try {
        const resp = await ApiClient.request({
            method: method,
            url: url,
            data
        })

        if (resp.status === "Success") {
            const { data } = resp
            return data;
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error("Get history login failed"))
    }
}

export async function getPersonalProfile(id: string) {
    const { method, url } = Endpoints.getPersonalProfile

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + `/${id}`
        })

        if (resp.status === "Success") {
            const { data } = resp
            return data;
        }
        return Promise.reject(new Error(resp.message))
    } catch (e) {
        return Promise.reject(new Error("Get history login failed"))
    }
}

export async function updatePasswordCount(data: any) {
    const { method, url } = Endpoints.updatePasswordCount

    const body = {
        username: data.username,
        count: data.count,
        isPassLogin: data.count == 0 ? true: false
    }

    try {
        const resp = await ApiClient.request({
            method,
            url,
            data: body
        })
        if (resp.status === "Success") {
            const { data } = resp
            return data;
        }
    } catch (e) {
        return Promise.reject(e)
    }
}
export async function genarateResetPassword(userId: string) {
    const { method, url } = Endpoints.genarateResetPassword

    const body = {
        user_id: userId
    }

    try {
        const resp = await ApiClient.request({
            method,
            url,
            data: body
        })
        if (resp.status === "Success") {
            const { data } = resp
            return data;
        }
    } catch (e) {
        return Promise.reject(e)
    }
}
