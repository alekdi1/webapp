import { Endpoints } from "@/config"
import { AppModel } from "@/models"
import ApiClient from "@/modules/api"
import { Root as VXRoot } from "./vuex.service"
import { ROUTER_NAMES as RN } from "@/router"

export async function getWebConfig() {
    const { method, url } = Endpoints.getWebConfig

    const response = await ApiClient.request({
        method,
        url,
        headers: {
            "Content-Type": "application/json"
        }
    })

    return mapAppConfig(response.data)
}

export const LEAVE_PAGE_NAMES = Object.freeze({
    payment: "payment",
    contact_cpn: "contact_cpn",
    maintenance_request: "maintenance_request",
    employee: "employee",
    my_qr_code: "my_qr_code",
    my_rental: "my_rental",
    my_profile: "my_profile",
    change_password: "change_password",
    e_invoice: "e_invoice",
    business_center: "business_center",
    reward: "reward",
    shopsale: "shopsale",
    ordering: "ordering",
    coupon: "coupon",
    announcement: "announcement",
    Terms_of_use: "Terms_of_use",
    faq: "faq",
    history: "history",
})

export function mapAppConfig(data: any = {}) {
    const c = new AppModel.AppConfig()

    const { payment, notification } = data

    c.payment.otherPayFeePercent = Number(payment?.other || 0)
    c.payment.unionPayFeePercent = Number(payment?.union_pay || 0)

    const postType = data.post_type

    c.postType = Array.isArray(postType) ? postType.map(ptd => {
        const w = new AppModel.PostType()
        w.id = ptd.id
        w.name = ptd.name
        return w
    }) : []

    try {
        c.notification.types.contact_us = notification.types.contact_us
        c.notification.types.contract = notification.types.contract
        c.notification.types.payment_pending = notification.types.payment_pending
        c.notification.types.payment_success = notification.types.payment_success
        c.notification.types.maintenance = notification.types.maintenance
        c.notification.types.post = notification.types.post
        c.notification.types.promotion = notification.types.promotion
    } catch (e) {
        //
    }

    // Leave Page Config
    try {
        const configs = data.force_leave_page_config
        if (Array.isArray(configs)) {
            c.leavePages = configs.map(pcd => {
                const pc = new AppModel.LeavePageConfig()
                pc.id = pcd.id || 0
                pc.menu = pcd.menu || ""
                pc.time = pcd.time || 0
                pc.active = pcd.active === "Y"
                return pc
            })
        }
    } catch (e) {
        //
    }

    return c
}

export function getLeavePageConfig(pageName: string) {
    const config = VXRoot.getAppConfig()
    const menuKey = getRouteKey(pageName)

    if (menuKey === null) {
        return 0
    }
    const pageConfig = config.leavePages.find(pc => pc.active && pc.menu === menuKey)
    const time = pageConfig?.time || 0
    // const time = 65300
    return (typeof time === "number" && !isNaN(time)) ? time : 0
}

export async function getUserMenuPermissions() {
    try {
        const { method, url } = Endpoints.getForceClosePagePermissions
        const rs = await ApiClient.request({ url, method })
        const permissions: { [menu: string]: boolean } = rs.data || {}
        return permissions
    } catch (e) {
        console.log("get close page error", e.message || e)
        return {}
    }
}

export function getRouteKey(routeName: string) {

    switch (true) {
        case [
            // RN.watch_sale,
            RN.shop_sale_select_branch,
            RN.shop_sale_main_select_option,
            RN.shop_sale_sales_form,
            RN.shop_sale_sales_form_edit,
            RN.shop_sale_history_list,
            RN.shop_sale_history_detail,
            RN.shop_sale_create_success,
        ].includes(routeName): return LEAVE_PAGE_NAMES.shopsale

        case [
            RN.dashboard_faq
        ].includes(routeName): return LEAVE_PAGE_NAMES.faq

        case [
            RN.dashboard_change_pwd,
            RN.dashboard_change_username,
            RN.dashboard_change_username_pwd
        ].includes(routeName): return LEAVE_PAGE_NAMES.change_password

        case [
            RN.dashboard_edit_profile,
        ].includes(routeName): return LEAVE_PAGE_NAMES.my_profile

        case [
            RN.watch_sale,
        ].includes(routeName): return LEAVE_PAGE_NAMES.ordering

        case [
            RN.reg_e_invoice_receipt_menu,
            // RN.request_invoice_and_receipt_store_list,
            RN.reg_e_invoice_receipt_detail,
        ].includes(routeName): return LEAVE_PAGE_NAMES.e_invoice

        case [
            RN.coupon_branch,
            RN.coupon_history_shop_list,
        ].includes(routeName): return LEAVE_PAGE_NAMES.coupon
       
        // // case [
        // ].includes(routeName): return LEAVE_PAGE_NAMES.setting

        // case [
        //     RN.dashboard_notification
        // ].includes(routeName): return LEAVE_PAGE_NAMES.notification

        case [
            RN.dashboard_annoucement,
            RN.dashboard_annoucement_detail
        ].includes(routeName): return LEAVE_PAGE_NAMES.announcement

        case [
            RN.dashboard_tnc,
        ].includes(routeName): return LEAVE_PAGE_NAMES.Terms_of_use

        // case [
        //     RN.dashboard_shopping_center_info,
        //     RN.dashboard_shopping_center_list,
        // ].includes(routeName): return LEAVE_PAGE_NAMES.shopping_center_information

        case RN.dashboard_login_history === routeName: return LEAVE_PAGE_NAMES.history

        case [
            RN.dashboard_contact_us_select_branch,
            RN.dashboard_contact_us_form,
        ].includes(routeName): return LEAVE_PAGE_NAMES.contact_cpn

        case [
            RN.dashboard_payment_history,
            // RN.dashboard_request_invoice_and_receipt,
            RN.request_invoice_and_receipt_store_list,
            RN.payment_invoice_list,
            RN.payment_confirm_payment,
            RN.payment_select_payment_method,
            RN.payment_result,
            RN.payment_instruction,
            RN.payment_unsuccess,
            RN.payment_push_noti,
            RN.payment_promptpay,
        ].includes(routeName): return LEAVE_PAGE_NAMES.payment

        case [
            RN.dashboard_manage_employees,
            RN.manage_emp_list,
            RN.manage_emp_detail,
            RN.manage_emp_form_add,
            RN.manage_emp_form_edit,
        ].includes(routeName): return LEAVE_PAGE_NAMES.employee

        case RN.dashboard_my_qr_code === routeName: return LEAVE_PAGE_NAMES.my_qr_code

        case [
            RN.maintainance,
            RN.maintainance_shop_list,
            RN.maintainance_status_list,
            RN.maintainance_repair_form,
            RN.maintainance_form_success,
            RN.maintainance_survey,
            RN.maintainance_survey_success,
        ].includes(routeName): return LEAVE_PAGE_NAMES.maintenance_request

        case [
            RN.rental_info_list,
            RN.rental_expired_list,
            RN.rental_detail,
            RN.rental_expired_detail,
        ].includes(routeName): return LEAVE_PAGE_NAMES.my_rental

        case [
            RN.dashboard_shopping_center_list,
            RN.dashboard_shopping_center_info,
            RN.dashboard_business_insights,
            RN.dashboard_business_insights_detail,
            RN.dashboard_annoucement,
            RN.dashboard_annoucement_detail,
            RN.dashboard_news_and_activities,
            RN.dashboard_news_and_activities_detail,
            RN.dashboard_promotion,
            RN.dashboard_promotion_detail,
            RN.dashboard_shopping_center_map,
        ].includes(routeName): return LEAVE_PAGE_NAMES.business_center

        // case [
        //     RN.dashboard_edit_profile,
        //     RN.dashboard_change_username_pwd,
        //     RN.dashboard_change_pwd,
        //     RN.dashboard_change_username
        // ].includes(routeName): return LEAVE_PAGE_NAMES.my_account
    }

    return null
}
