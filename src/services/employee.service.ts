import { Endpoints } from "@/config"
import ApiClient from "@/modules/api"
import { EmpModel } from "@/models"
import { LanguageUtils } from "@/utils"
import { ROUTER_NAMES as RN } from "@/router"

class EmployeeRole {
    value = ""
    nameEn = ""
    nameTh = ""
    image = ""

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}

export const ROLES = Object.freeze({
    manager: (v => {
        const r = new EmployeeRole()
        r.value = v
        r.image = require("@/assets/images/icons/role-manager.svg")
        r.nameEn = "Manager"
        r.nameTh = "ผู้จัดการ"
        return r
    })("manager"),
    finance_contractor: (v => {
        const r = new EmployeeRole()
        r.value = v
        r.image = require("@/assets/images/icons/role-finance.svg")
        r.nameEn = "Accounting/Finance"
        r.nameTh = "บัญชี/การเงิน"
        return r
    })("finance_contractor"),
    staff: (v => {
        const r = new EmployeeRole()
        r.value = v
        r.image = require("@/assets/images/icons/role-employee.svg")
        r.nameEn = "Staff"
        r.nameTh = "พนักงาน"
        return r
    })("staff"),
    staff_reward: (v => {
        const r = new EmployeeRole()
        r.value = v
        r.image = require("@/assets/images/dashboard-rewards.svg")
        r.nameEn = "Staff reward"
        r.nameTh = "พนักงานรีวอร์ด"
        return r
    })("staff_reward"),
    staff_shop_sale: (v => {
        const r = new EmployeeRole()
        r.value = v
        r.image = require("@/assets/images/dashboard-shop-sale.svg")
        r.nameEn = "Staff shop sale"
        r.nameTh = "พนักงาน Shop sale"
        return r
    })("staff_shop_sale")
})

export const PERMISSIONS = Object.freeze({
    contract_info: "contract_info",
    contract_renew_refund: "contract_renew_refund",
    /** customer reward */
    the_one_biz: "the_one_biz",
    payment: "payment",
    maintenance: "maintenance",
    employee_management: "employee_management",
    qr_code: "qr_code",
    shop_sale: "shop_sale",
    branch_announcement: "branch_announcement",
    req_invoice_receipt: "req_invoice_receipt",
    rewards_manage_point: "rewards_manage_point",
    rewards_cancel_point: "rewards_cancel_point",
    rewards_history: "rewards_history",
    rewards_dashboard: "rewards_dashboard",
    e_invoice_receipt: "e_invoice_receipt",
    rewards_history_download: "rewards_history_download",
    ordering: "ordering",
    ordering_last_month_report: "ordering_last_month_report",
    ordering_accounting_report: "ordering_accounting_report",
    ordering_report: "ordering_report",
    ordering_stock_report: "ordering_stock_report",
    coupon: "coupon",
    coupon_main: "coupon_main",
    coupon_history: "coupon_history"
})

export async function getEmployees(bpNumber: string | string) {
    const { method, url } = Endpoints.getBPEmployees

    try {
        const rs = await ApiClient.request({
            method,
            url: url + "?bp_number=" + bpNumber
        })

        if (rs.status === "Success") {
            const { data } = rs
            return Array.isArray(data) ? data.map(mapEmpData) : []
        }
        return Promise.reject(rs)
    } catch (e) {
        return Promise.reject(e)
    }
}

export async function getEmployeeById(empId: string) {
    const { method, url } = Endpoints.getEmployeeById(empId)
    const rs = await ApiClient.request({
        method,
        url
    })
    if (rs.status === "Success") {
        return mapEmpData(rs.data)
    }
    return Promise.reject(rs)
}

export function mapEmpData(data: any = {}) {
    const e = new EmpModel.Employee()

    e.bpNumber = data.bp_number || ""
    e.company.name = data.company_name || ""
    e.createdBy = data.created_by || []
    e.email = data.email || ""
    e.firstname = data.first_name || ""
    e.lastname = data.last_name || ""
    e.id = data.id || ""
    e.lastLogin = data.last_login || ""
    e.phone = data.phone_number || ""
    e.role.name = data.role_name || ""
    e.taxId = data.tax_id || ""

    try {
        const ub = data.updated_by
        e.updatedBy.firstname = ub?.first_name || ""
        e.updatedBy.lastname = ub?.last_name || ""
        e.updatedBy.updatedDate = ub?.updated_at || ""
        e.updatedBy.id = ub?.id || ""
    } catch (e) {
        //
    }
    e.username = data.username || ""

    try {
        const { permissions } = data
        if (Array.isArray(permissions)) {
            e.permissions = permissions.map(pd => {
                const { shops } = pd
                const p = new EmpModel.EmployeePermission()

                p.permission = String(pd.permission || "").trim()
                p.shops = Array.isArray(shops) ? shops.map(pds => {
                    const s = new EmpModel.EmployeePermissionShop()
                    s.id = pds.shop_id || pds.id || ""
                    s.nameTh = pds.shop_name || pds.name || ""
                    s.nameEn = pds.shop_name || pds.name || ""
                    s.branch.code = pds.branch_code || ""
                    s.branch.nameTh = pds.branch_name || ""
                    s.branch.nameEn = pds.branch_name || ""
                    s.isBangkokBranch = pds.is_bkk_branch === 1
                    s.floorCode = pds.floor_code || ""
                    s.floorRoom = pds.floor_room || ""
                    s.number = pds.shop_number || ""
                    s.industryCode = pds.industry_code || ""
                    return s
                }) : []

                return p
            })
        }
    } catch (e) {
        //
    }

    try {
        const branches = data.employee_branches
        if (Array.isArray(branches)) {
            e.branches = branches.map(bd => {
                const b = new EmpModel.EmployeeBranch()
                b.code = bd.branch_code || ""
                b.name = bd.branch_name || ""
                return b
            })
        }
    } catch (e) {
        //
    }

    return e
}

export async function deleteEmployee(empId: string) {
    const { method, url } = Endpoints.deleteEmployee(empId)
    const rs = await ApiClient.request({
        method,
        url
    })

    return rs
}

interface EmployeeInfoParams {
    first_name: string
    last_name: string
    phone_number: string
    bp_number: string
    role: string
    email: string
    permissions: {
        permission: string
        shop_ids: number[]
    }[]
}

export async function updateEmployee(empId: string | number, data: EmployeeInfoParams) {
    const { method, url } = Endpoints.updateEmpRoleAndPermission

    const rs = await ApiClient.request({
        method,
        url,
        data: {
            ...data,
            id: empId
        }
    })

    return rs.data
}

export async function createEmployee(data: EmployeeInfoParams) {
    const { method, url } = Endpoints.createEmpRoleAndPermission

    const rs = await ApiClient.request({
        method,
        url,
        data
    })
    return rs.data
}


export function getRoutePermission(routeName: string) {

    switch (true) {
        case [
            RN.rental_info_list,
            RN.rental_expired_list,
            RN.rental_detail,
            RN.rental_expired_detail,
        ].includes(routeName): return PERMISSIONS.contract_info

        case [
            RN.payment_invoice_list,
            RN.payment_confirm_payment,
            RN.payment_select_payment_method,
            RN.payment_result,
            RN.payment_instruction,
            RN.payment_unsuccess,
            RN.payment_push_noti,
            RN.payment_promptpay,
            RN.request_invoice_and_receipt_store_list,
            RN.dashboard_request_invoice_and_receipt,
            RN.request_form,
            RN.request_summary,
            RN.request_result,
            RN.dashboard_payment_history
        ].includes(routeName): return PERMISSIONS.payment

        case [
            RN.maintainance,
            RN.maintainance_shop_list,
            RN.maintainance_status_list,
            RN.maintainance_repair_form,
            RN.maintainance_form_success,
            RN.maintainance_survey,
            RN.maintainance_survey_success,
        ].includes(routeName): return PERMISSIONS.maintenance

        case [
            RN.dashboard_manage_employees,
            RN.manage_emp_list,
            RN.manage_emp_detail,
            RN.manage_emp_form_add,
            RN.manage_emp_form_edit,
        ].includes(routeName): return PERMISSIONS.employee_management

        case RN.dashboard_my_qr_code === routeName: return PERMISSIONS.qr_code

        case [
            RN.rewards_shop_list,
            RN.rewards_main,
            RN.rewards_search_the1_member,
            RN.rewards_earn_redeem_form,
            RN.rewards_redeem_otp,
            RN.rewards_earn_redeem_error,
            RN.rewards_earn_redeem_success,
            RN.rewards_transaction_history,
            RN.rewards_transaction_download_history,
            RN.rewards_transaction_download_success,
            RN.rewards_transaction_cancellation_form,
            RN.rewards_approve_void,
            RN.rewards_approve_void_success,
            RN.rewards_dashboard,
        ].includes(routeName): return [
            PERMISSIONS.rewards_manage_point,
            PERMISSIONS.rewards_cancel_point,
            PERMISSIONS.rewards_dashboard,
            PERMISSIONS.rewards_history
        ]

        case [
            RN.shop_sale_select_branch,
            RN.shop_sale_main_select_option
        ].includes(routeName): return PERMISSIONS.shop_sale

        case [
            RN.watch_sale,
            RN.watch_sale_select_branch,
            RN.watch_sale_main_select_option,
            RN.watch_sale_at_month,
            RN.watch_sale_history_list
        ].includes(routeName): return [
            PERMISSIONS.ordering,
            PERMISSIONS.ordering_last_month_report,
            PERMISSIONS.ordering_accounting_report,
            PERMISSIONS.ordering_report,
            PERMISSIONS.ordering_stock_report
        ]

        case [
            RN.dashboard_annoucement,
            RN.dashboard_annoucement_detail
        ].includes(routeName): return PERMISSIONS.branch_announcement

        case [
            RN.reg_e_invoice_receipt_menu,
            RN.reg_e_invoice_receipt_detail
        ].includes(routeName): return PERMISSIONS.e_invoice_receipt

        case [
            RN.coupon,
            RN.coupon_branch,
            RN.coupon_code,
            RN.coupon_detail,
            RN.coupon_confirm,
            RN.coupon_success,
            RN.coupon_wrong
        ].includes(routeName): return [
            PERMISSIONS.coupon,
            PERMISSIONS.coupon_main,
            PERMISSIONS.coupon_history,
        ]
    }

    return null
}
