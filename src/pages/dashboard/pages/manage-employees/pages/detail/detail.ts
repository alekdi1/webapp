import { Component } from "vue-property-decorator"
import Base from "../manage-employees-base"
import { EmpModel, StoreModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { EmployeeServices, StoreServices } from "@/services"
import PermissionStoreList from "../components/store-permission-list.vue"
import { LanguageUtils } from "@/utils"

interface EmpPermission {
    id: string
    icon: any
    name: string
    storeList: StoreModel.Store[]
}

@Component({
    components: {
        "permission-store-list": PermissionStoreList
    }
})
export default class EmpDetailPage extends Base {

    private loading = false
    private emp: EmpModel.Employee | null = null
    private t = (k: string) => this.$t("pages.manage_emp." + k).toString()
    private stores: StoreModel.Store[] = []
    private permissions: EmpPermission[] = []

    private get text() {
        return {
            title_manage_user: this.t("title_manage_user"),
            edit_permission: this.t("edit_permission"),
            eligible_stores: this.t("eligible_stores"),
            data_accesses: this.t("data_accesses")
        }
    }

    private mounted() {
        this.getUserData()
    }

    private editEmp() {
        this.$emit("onEmpChange", this.emp)
        this.$router.push({
            name: ROUTER_NAMES.manage_emp_form_edit,
            params: {
                emp_id: this.emp?.id || ""
            },
            query: {
                ts: new Date().getTime().toString()
            }
        })
    }

    private async getUserStore() {
        try {
            const stores = await StoreServices.getStoresByBP(this.user.customerNo)
            this.stores = stores
        } catch (e) {
            console.log("Get store error", e.message || e)
        }
    }

    private async getUserData() {
        this.loading = true
        await this.getUserStore()
        try {
            const emp = await EmployeeServices.getEmployeeById(this.$route.params.emp_id)
            this.emp = emp
            this.$emit("onEmpChange", emp)
            // this.mapEmpPermissions()
        } catch (e) {
            console.log(e.message || e)
        }
        this.loading = !true
    }

    private copyUserToForm() {
        this.$emit("onEmpChange", this.emp)
        this.$router.push({
            name: ROUTER_NAMES.manage_emp_form_add,
            query: {
                copy_from: this.emp?.id || ""
            }
        })
    }

    private get empPermissions() {
        const { emp } = this
        const { PERMISSIONS } = EmployeeServices
        const { lang } = LanguageUtils
        const viewPermissions: EmpPermission[] = []

        if (emp) {
            for (const p of emp.permissions) {
                const stores: StoreModel.Store[] = []
                for (const s of p.shops) {
                    const store = stores.find(st => (
                        s.industryCode === st.industryCode &&
                        s.branch.code === st.branch.code &&
                        s.floorRoom === st.floorRoom &&
                        s.number == st.number
                    ))
                    stores.push(store || s)
                }
                const item = {
                    id: p.permission,
                    icon: "",
                    name: "",
                    storeList: stores
                }

                switch_permission: switch (p.permission) {
                    case PERMISSIONS.contract_info: {
                        item.icon = require("@/assets/images/dashboard-rental-value.svg")
                        item.name = lang("ข้อมูลการเช่า", "Rental information"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.contract_renew_refund: {
                        item.icon = require("@/assets/images/dashboard-reg-e-invoice.svg")
                        item.name = lang("การต่อสัญญา/ขอคืนเงินมัดจำ", "Renew contract/Refunds"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.payment: {
                        item.icon = require("@/assets/images/dashboard-payment.svg")
                        item.name = lang("ชำระเงิน","Payment"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    // case PERMISSIONS.the_one_biz: {
                    //     item.icon = require("@/assets/images/the-1-biz.jpg")
                    //     item.name = "The 1 BIZ"
                    //     viewPermissions.push(item)
                    //     break switch_permission
                    // }

                    case PERMISSIONS.maintenance: {
                        item.icon = require("@/assets/images/dashboard-repair-pose.svg")
                        item.name = lang("แจ้งซ่อม","Maintenance"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.employee_management: {
                        item.icon = require("@/assets/images/dashboard-manage-employees.svg")
                        item.name = lang("จัดการผู้ใช้งาน","Manage users"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.qr_code: {
                        item.icon = require("@/assets/images/dashboard-my-qr-code.svg")
                        item.name = lang("QR code","QR code"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.the_one_biz: {
                        item.icon = require("@/assets/images/dashboard-rewards.svg")
                        item.name = lang("รีวอร์ดลูกค้า","Customer reward"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.shop_sale: {
                        item.icon = require("@/assets/images/dashboard-shop-sale.svg")
                        item.name = lang("บันทึกยอดขาย", "Shop sale"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.branch_announcement: {
                        item.icon = require("@/assets/images/dashboard-news-and-activities.svg")
                        item.name = lang("ประกาศศูนย์การค้า", "Announcement"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.req_invoice_receipt: {
                        item.icon = require("@/assets/images/dashboard-request-invoice-and-receipt.svg")
                        item.name = "ขอใบแจ้งหนี้และใบเสร็จ"
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    /** Reward */

                    case PERMISSIONS.rewards_manage_point: {
                        item.icon = require("@/assets/images/dashboard-rewards.svg")
                        item.name = lang("รีวอร์ดลูกค้า ทำรายการ", "Customer reward Process transaction"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.rewards_history: {
                        item.icon = require("@/assets/images/dashboard-rewards.svg")
                        item.name = lang("รีวอร์ดลูกค้า ประวัติทำรายการ", "Customer reward Trascation History"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.rewards_history_download: {
                        item.icon = require("@/assets/images/dashboard-rewards.svg")
                        item.name = lang("รีวอร์ดลูกค้า ดาวน์โหลดประวัติการทำรายการ", "Customer reward Download transaction history"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.rewards_cancel_point: {
                        item.icon = require("@/assets/images/dashboard-rewards.svg")
                        item.name = lang("รีวอร์ดลูกค้า อนุมัติยกเลิกรายการ", "Customer reward Approve void transaction"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    case PERMISSIONS.rewards_dashboard: {
                        item.icon = require("@/assets/images/dashboard-rewards.svg")
                        item.name = lang("รีวอร์ดลูกค้า แดชบอร์ด", "Customer reward Dashboard"),
                        viewPermissions.push(item)
                        break switch_permission
                    }

                    /** Ordering */
                    case PERMISSIONS.ordering_last_month_report: {
                        item.icon = require("@/assets/images/dashboard-ordering.svg")
                        item.name = lang("รายงาน ณ สิ้นเดือน", " Ordering Lastmonth Report "),
                        viewPermissions.push(item)
                        break switch_permission
                    }
                     case PERMISSIONS.ordering_accounting_report: {
                        item.icon = require("@/assets/images/dashboard-ordering.svg")
                        item.name = lang("รายงาน บัญชี", "Ordering Account Report"),
                        viewPermissions.push(item)
                        break switch_permission
                    }
                     case PERMISSIONS.ordering_report: {
                        item.icon = require("@/assets/images/dashboard-ordering.svg")
                        item.name = lang("รายงาน ยอดขาย", "Ordering Report"),
                        viewPermissions.push(item)
                        break switch_permission
                    }
                     case PERMISSIONS.ordering_stock_report: {
                        item.icon = require("@/assets/images/dashboard-ordering.svg")
                        item.name = lang("รายงาน สต๊อก", "Ordering Stock Report"),
                        viewPermissions.push(item)
                        break switch_permission
                    }
                    /** Coupon */
                    case PERMISSIONS.coupon: {
                        item.icon = require("@/assets/images/icons/coupon.svg")
                        item.name = lang("คูปอง", "Coupon"),
                        viewPermissions.push(item)
                        break switch_permission
                    }
                     case PERMISSIONS.coupon_history: {
                        item.icon = require("@/assets/images/coupon-history-01.svg")
                        item.name = lang("ประวัติรายการแลกคูปอง", "Coupon History"),
                        viewPermissions.push(item)
                        break switch_permission
                    }
                }
            }
        }
        // this.permissions = viewPermissions
        return viewPermissions
    }

    private get displayRole() {
        const { emp } = this
        const r = Object.values(EmployeeServices.ROLES).find(r => r.value === emp?.role.name)
        return r?.displayName || emp?.role.name || ""
    }

    private get phone() {
        return this.emp?.phone || ""
    }
}
