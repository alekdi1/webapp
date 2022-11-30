import { Component } from "vue-property-decorator"
import Base from "../manage-employees-base"
import { CPMForm } from "@/pages/dashboard/models"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import Result from "./result.vue"
import { ROUTER_NAMES } from "@/router"
import { BranchModel, StoreModel, EmpModel } from "@/models"
import { EmployeeServices, StoreServices } from "@/services"
import PermissionStoreList from "../components/store-permission-list.vue"

class Branch extends BranchModel.Branch { }

const getWindow = () => ({
    width: window.innerWidth,
    height: window.innerHeight
})

const STORE_FLAG = {
    all_store: "all_store",
    all_in_bnk: "all_in_bnk"
}

const { PERMISSIONS, ROLES } = EmployeeServices
const PERMISSION_CUSTOMER_REWARD = "customer-reward"
const ORDERING = "ordering"
const COUPON = "coupon"
const ISSHOWREWARD = false

@Component({
    components: {
        "cpn-emp-result": Result,
        "permission-store-list": PermissionStoreList
    }
})
export default class EmpFormPage extends Base {

    private form = new EmpForm()
    private loading = false
    private permissionExpand = 0
    private showStatus = false
    private selectStoreDialog = new SelectStoreDialog()
    private window = getWindow()
    private stores: StoreModel.Store[] = []
    private isShowReward = false;

    private get avatarPlaceholder() {
        return require("@/assets/images/avatar-placeholder-image.jpg")
    }

    private get permissions() {
        return PERMISSIONS
    }

    private get text() {
        const { lang } = LanguageUtils
        return {
            title_add_new_emp: lang("เพิ่มผู้ใช้งาน", "Add new user"),
            title_edit_new_emp: lang("แก้ไขผู้ใช้งาน", "Edit new user"),
            firstname: lang("ชื่อ", "Firstname"),
            lastname: lang("นามสกุล", "Lastname"),
            phl_firstname: lang("กรุณากรอกชื่อพนักงาน", "Please fill employee firstname"),
            phl_lastname: lang("กรุณากรอกนามสกุลพนักงาน", "Please fill employee lastname"),
            email: this.$t("email").toString(),
            phl_email: lang("employeeemail@email.com", "employeeemail@email.com"),
            phone: this.$t("phone_number").toString(),
            phl_phone: lang("กรุณากรอกเบอร์โทรศัพท์พนักงาน", "Please fill employee phone number"),
            role: lang("ตำแหน่งหน้าที่", "Role & duty"),
            data_accesses: lang("ความสามารถในการเข้าถึงข้อมูล", "Ability to access information"),
            select_store: lang("เลือกร้านค้า", "Select store"),
            confirm_per: "ยืนยันสิทธิ์",
            search_branch: this.$t("pages.payment.search_branch").toString(),
            search_store: lang("ค้นหาร้านค้าหรือสาขา", "Search store or branch"),
            add_store: lang("เพิ่มร้านค้าที่มีสิทธ์", "Add granted shops"),
            rental_info: lang("ข้อมูลการเช่า", "Rental Information"),
            renew_contract_refund: lang("การต่อสัญญา/ขอคืนเงินมัดจำ", "Renew Contract/Refunds"),
            payment: lang("ชำระเงิน", "Payment"),
            maintenance: lang("แจ้งซ่อม", "Maintenance"),
            manage_user: lang("จัดการผู้ใช้งาน", "Manage Users"),
            qr_code: lang("QR code", "Shop QR Code"),
            reward: lang("รีวอร์ดลูกค้า", "Customer reward"),
            redeem_collect: lang("แลกคะแนน/สะสมคะแนน", "Redeem point/Collect point"),
            process_transaction: lang("ทำรายการ", "Process transaction"),
            cancel: lang("ยกเลิกรายการ", "Cancel"),
            shopsale: lang("บันทึกยอดขาย", "Shop Sales"),
            view_shopsale: lang("รายงานยอดขาย", "Sales Report"),
            sale_monthly: lang("รายงานการจ่ายเงิน", "Sale Report (montly)"),
            sale_account: lang("ยอดขาย (สำหรับบัญชี)", "Sales Report (for accounts)"),
            sale: lang("ยอดขาย", "Sale"),
            stock: lang("สินค้าคงเหลือ", "Stock Balance"),
            annoucement: lang("ประกาศศูนย์การค้า", "Announcement"),
            apply_e_inv_recp: lang("สมัคร E-invoice & E-receipt", "Register Invoice By Email, e-Receipt"),
            transaction_history: lang("ประวัติทำรายการ", "Trascation History"),
            void_transaction: lang("อนุมัติยกเลิกรายการ", "Approve void transaction"),
            transaction_dashboard: lang("แดชบอร์ด", "Dashboard"),
            transaction_download: lang("ดาวน์โหลดประวัติการทำรายการ", "Download transaction history"),
            please_select_store: lang("กรุณาเลือกร้านค้า", "Please select store"),
            please_select_sale_record: lang("กรุณาเลือกประเภทรายงานยอดขาย", "Please enable sale record"),
            please_enable_coupon: lang("กรุณาเลือกประเภทคูปอง", "Please enable coupon"),
            coupon_text: lang("คูปอง", "Coupon"),
            coupon_main: lang("คูปอง", "Coupon"),
            coupon_history: lang("ประวัติการใช้คูปอง", "Coupon History"),
        }
    }

    private get ishideReward() {
        return ISSHOWREWARD
    }

    private onWindowChange() {
        this.window = getWindow()
    }

    private displayStoreBranchAndRoom(s: StoreModel.Store) {
        const room = StoreServices.getStorefloorRoom(s)
        let text = s.branch.displayName

        if (room) {
            text += ` ${LanguageUtils.lang("ห้อง", "Room")} ${room}`
        }

        return text
    }

    private get roles() {
        return [
            ROLES.manager,
            ROLES.finance_contractor,
            ROLES.staff,
            // ROLES.staff_reward,
            ROLES.staff_shop_sale
        ].map(role => {
            const r = new EmpRole()
            r.id = role.value
            r.nameEn = role.nameEn
            r.nameTh = role.nameTh
            r.value = role.value
            r.image = role.image
            return r
        })
    }

    private selectRole(r: EmpRole) {
        this.form.role = r
        const user_permissions =  this.user.permissions
        const permissionForms = (() => {
            switch (r.id) {
                case ROLES.manager.value: {
                    
                    this.form.permissionCustomerReward.managePoint.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_manage_point)?true:false
                    this.form.permissionCustomerReward.cancelPoint.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_cancel_point)?true:false
                    this.form.permissionCustomerReward.transactionDashboard.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_dashboard)?true:false
                    this.form.permissionCustomerReward.transactionDownload.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_history_download)?true:false
                    this.form.permissionCustomerReward.transactionHistory.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_history)?true:false
                    this.form.permissionCoupon.main.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.coupon_main)?true:false
                    this.form.permissionCoupon.history.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.coupon_history)?true:false

                    return [
                        this.form.permissionMaintenance,
                        this.form.permissionRentalData,
                        this.form.permissionPayment,
                        this.form.permissionRenew,
                        this.form.permissionManageUser,
                        this.form.permissionQRCode,
                        this.form.permissionShopCenterAnnouncement,
                        this.form.permissionCustomerReward,
                        this.form.permissionCoupon
                    ]
                }

                case ROLES.finance_contractor.value: {

                    this.form.permissionCustomerReward.managePoint.enabled = !true
                    this.form.permissionCustomerReward.cancelPoint.enabled = !true
                    this.form.permissionCustomerReward.transactionDashboard.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_dashboard)?true:false
                    this.form.permissionCustomerReward.transactionDownload.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_history_download)?true:false
                    this.form.permissionCustomerReward.transactionHistory.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_history)?true:false

                    this.form.permissionViewSaleRecord.saleMonthly.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.ordering_last_month_report)?true:false
                    this.form.permissionViewSaleRecord.saleAccount.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.ordering_accounting_report)?true:false
                    this.form.permissionViewSaleRecord.sale.enabled = false
                    this.form.permissionViewSaleRecord.stock.enabled = false
                    // this.form.permissionCoupon.main.enabled = true
                    // this.form.permissionCoupon.history.enabled = true

                    return [
                        this.form.permissionPayment,
                        this.form.permissionMaintenance,
                        this.form.permissionRentalData,
                        this.form.permissionRenew,
                        this.form.permissionQRCode,
                        this.form.permissionShopCenterAnnouncement,
                        this.form.permissionRegEInvoiceEReceipt,
                        this.form.permissionCustomerReward,
                        this.form.permissionViewSaleRecord,
                        // this.form.permissionCoupon
                    ]
                }

                case ROLES.staff.value: {
                    this.form.permissionViewSaleRecord.saleMonthly.enabled = false
                    this.form.permissionViewSaleRecord.saleAccount.enabled = false
                    this.form.permissionViewSaleRecord.sale.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.ordering_report)?true:false
                    this.form.permissionViewSaleRecord.stock.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.ordering_stock_report)?true:false
                    this.form.permissionCoupon.main.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.coupon_main)?true:false
                    this.form.permissionCoupon.history.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.coupon_history)?true:false

                    return [
                        this.form.permissionMaintenance,
                        this.form.permissionQRCode,
                        this.form.permissionShopCenterAnnouncement,
                        this.form.permissionViewSaleRecord,
                        this.form.permissionCoupon
                    ]
                }

                case ROLES.staff_reward.value: {

                    this.form.permissionCustomerReward.managePoint.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_manage_point)?true:false
                    this.form.permissionCustomerReward.cancelPoint.enabled = !true
                    this.form.permissionCustomerReward.transactionDashboard.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_dashboard)?true:false
                    this.form.permissionCustomerReward.transactionDownload.enabled = !true
                    this.form.permissionCustomerReward.transactionHistory.enabled = user_permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.rewards_history)?true:false

                    return [
                        this.form.permissionMaintenance,
                        this.form.permissionQRCode,
                        this.form.permissionShopCenterAnnouncement,
                        this.form.permissionCustomerReward
                    ]
                }

                case ROLES.staff_shop_sale.value: return [
                    this.form.permissionShopCenterAnnouncement,
                    this.form.permissionMaintenance,
                    this.form.permissionQRCode,
                    this.form.permissionSaleRecord
                ]

                default: return []
            }
        })()

        for (const form of this.form.allPermissionForms) {
            form.enabled = false
        }

        for (const form of permissionForms) {
            // form.enabled =  user_permissions.find(p => p.permission === form.permission)?true:false
            // form.enabled = true
            if (this.user.isOwner) {
                form.enabled = true
            }else{
                form.enabled =  user_permissions.find(p => p.permission === form.permission)?true:false
            }

        }
    }

    private addStoreDialog(type: string) {
        const d = new SelectStoreDialog()
        console.log(this.user.permissions)
        const permission = this.user.permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.employee_management)
        d.show = true
        d.branchList = this.user.branchList
        console.log(permission);
        if (this.user.isOwner) {
            d.storeList = [...this.stores]
        }else{
            // d.storeList = this.stores.filter(s => permission?.shops?.some(ps => ps?.id === s?.id && (ps.branch.code=='PK2'?'PKT': (ps.branch.code=='PKT'?'PK1':ps.branch.code)) === s.branch.code))
            d.storeList = this.stores.filter(s => permission?.shops?.some(ps => ps?.id === s?.id && ps.branch.code === s.branch.code))
        }
        d.storeList = d.storeList.reduce((a: StoreModel.Store[],ps: StoreModel.Store) => {
                console.log(ps)
                if(a.filter((s: StoreModel.Store) => (ps?.nameEn === s?.nameEn && ps?.branch?.nameEn === s?.branch?.nameEn && ps?.floorRoom === s?.floorRoom ) && 
                (ps?.nameTh === s?.nameTh && ps?.branch?.nameTh === s?.branch?.nameTh && ps?.floorRoom === s?.floorRoom )).length==0){
                    a.push(ps);
                } 
                return a
     },[])
     console.log( d.storeList );
     

        d.type = type
        console.log( this.user.branchList);
        
        const form = this.getPermissionForm(type)
        d.selectedStore = [...(form?.stores || [])]
        if ("apply_all" === type) {
            d.selectedStore = [...this.form.allApplyStores]
            
        }
        console.log( form);

        d.formatStoreGroups()
        this.selectStoreDialog = d
    }

    private async confirmSelectStore() {
        const allStores = this.stores.map(s => s.id).sort()
        const bkkStores = this.stores.filter(s => s.isBangkokBranch).map(s => s.id).sort()
        const allStoresStr = JSON.stringify(allStores)
        const bkkStoresStr = JSON.stringify(bkkStores)
        const stores = [...this.selectStoreDialog.selectedStore]

        if (this.selectStoreDialog.type === "apply_all") {
            this.form.allApplyStores = stores.sort((
                v1: StoreModel.Store, v2: StoreModel.Store) => 
                v1.nameTh.toLowerCase().localeCompare(v2.nameTh.toLowerCase()) || 
                v1.branch.nameTh.toLowerCase().localeCompare(v2.branch.nameTh.toLowerCase()) || 
                v1.floorRoom.toLowerCase().localeCompare(v2.floorRoom.toLowerCase()
                ));
            const forms = this.form.enabledPermissionForms
            for (const form of forms) {
                console.log(form)
                if(this.user.isOwner || (form.permission==PERMISSION_CUSTOMER_REWARD && this.user.permissions.find(p => p.permission.includes('reward'))) || this.user.permissions.find(p => p.permission === form.permission))
                // (this.user.isOwner || this.user.permissions.find(p => p.permission === form.permission))
                if (form.stores.length === 0) {
                    form.stores.push(...stores)
                } else {
                    const formStore = [...form.stores]
                    for (const store of stores) {
                        if (!formStore.some(s => store.id === s.id)) {
                            formStore.push(store)
                        }
                    }
                    form.stores = formStore.sort((
                        v1: StoreModel.Store, v2: StoreModel.Store) => 
                        v1.nameTh.toLowerCase().localeCompare(v2.nameTh.toLowerCase()) || 
                        v1.branch.nameTh.toLowerCase().localeCompare(v2.branch.nameTh.toLowerCase()) || 
                        v1.floorRoom.toLowerCase().localeCompare(v2.floorRoom.toLowerCase()
                        ));
                }

                const fs = [...form.stores].map(s => s.id).sort()
                const bkkFs = [...form.stores].filter(s => s.isBangkokBranch).map(s => s.id).sort()

                // check store flag
                if (JSON.stringify(fs) === allStoresStr) {
                    form.storeFlag = STORE_FLAG.all_store
                } else if (JSON.stringify(bkkFs) === bkkStoresStr) {
                    form.storeFlag = STORE_FLAG.all_in_bnk
                }
            }

        } else {
            const form = this.getPermissionForm(this.selectStoreDialog.type)
            if (form) {
                const formStores = form.stores.map(s => s.id).sort()
                const selectedStored = stores.map(s => s.id).sort()

                // check change
                if (JSON.stringify(formStores) !== JSON.stringify(selectedStored)) {
                    this.form.allApplyStores = []
                }
                form.stores = [...stores].sort((
                    v1: StoreModel.Store, v2: StoreModel.Store) => 
                    v1.nameTh.toLowerCase().localeCompare(v2.nameTh.toLowerCase()) || 
                    v1.branch.nameTh.toLowerCase().localeCompare(v2.branch.nameTh.toLowerCase()) || 
                    v1.floorRoom.toLowerCase().localeCompare(v2.floorRoom.toLowerCase()
                    ));
            }
        }

        this.selectStoreDialog.show = false
    }

    private getPermissionForm(permission: string) {
        switch (permission) {
            case PERMISSIONS.contract_info: return this.form.permissionRentalData
            case PERMISSIONS.contract_renew_refund: return this.form.permissionRenew
            case PERMISSIONS.payment: return this.form.permissionPayment
            case PERMISSIONS.maintenance: return this.form.permissionMaintenance
            case PERMISSIONS.employee_management: return this.form.permissionManageUser
            case PERMISSIONS.qr_code: return this.form.permissionQRCode
            case PERMISSION_CUSTOMER_REWARD: return this.form.permissionCustomerReward
            case PERMISSIONS.shop_sale: return this.form.permissionSaleRecord
            case ORDERING: return this.form.permissionViewSaleRecord
            case PERMISSIONS.branch_announcement: return this.form.permissionShopCenterAnnouncement
            case PERMISSIONS.e_invoice_receipt: return this.form.permissionRegEInvoiceEReceipt
            case PERMISSIONS.coupon: return this.form.permissionCoupon
            default: return null
        }
    }

    private selectStoreFlag(permission: string, flagId: string) {
        console.log("permission --> ", permission)
        const form = this.getPermissionForm(permission)
        const my_permission = this.user.permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.employee_management)
        console.log("form --> ", form)
        if (form) {
            let stores: StoreModel.Store[] = []
            if (this.user.isOwner) {
                stores = this.stores
            }else{
                // d.storeList = this.stores.filter(s => permission?.shops?.some(ps => ps?.id === s?.id && (ps.branch.code=='PK2'?'PKT': (ps.branch.code=='PKT'?'PK1':ps.branch.code)) === s.branch.code))
                stores = this.stores.filter(s => my_permission?.shops?.some(ps => ps?.id === s?.id && ps.branch.code === s.branch.code))
                if (form.stores.length === 0) {
                    form.stores.push(...stores)
                } else {
                    const formStore = [...form.stores]
                    for (const store of stores) {
                        if (!formStore.some(s => store.id === s.id)) {
                            formStore.push(store)
                        }
                    }
                    stores = formStore.sort((
                        v1: StoreModel.Store, v2: StoreModel.Store) => 
                        v1.nameTh.toLowerCase().localeCompare(v2.nameTh.toLowerCase()) || 
                        v1.branch.nameTh.toLowerCase().localeCompare(v2.branch.nameTh.toLowerCase()) || 
                        v1.floorRoom.toLowerCase().localeCompare(v2.floorRoom.toLowerCase()
                        ));
                }
            }
            stores = stores.sort((
                v1: StoreModel.Store, v2: StoreModel.Store) => 
                v1.nameTh.toLowerCase().localeCompare(v2.nameTh.toLowerCase()) || 
                v1.branch.nameTh.toLowerCase().localeCompare(v2.branch.nameTh.toLowerCase()) || 
                v1.floorRoom.toLowerCase().localeCompare(v2.floorRoom.toLowerCase()
                ));
            const dummy_new: StoreModel.Store[] = []
            const dummy_new2: StoreModel.Store[] = []
            const dummy_stores = this.stores.filter(s => my_permission?.shops?.some(ps => ps?.id === s?.id && ps.branch.code === s.branch.code))

            for (const store of stores) {
                if (!dummy_stores.some(s => store.id === s.id)) {
                    dummy_new.push(store)
                }else{
                    dummy_new2.push(store)
                }
            }
            if (form.storeFlag === flagId) {
                console.log(1)
                form.storeFlag = ""
                if (flagId === STORE_FLAG.all_in_bnk) {
                    console.log(2)
                    stores = [...dummy_new]
                } else {
                    console.log(3)
                    stores = dummy_new
                }
            } else {
                console.log(4)
                if (flagId === STORE_FLAG.all_in_bnk) {
                    console.log(5)
                    stores = [...dummy_new,...dummy_new2.filter(s => s.isBangkokBranch)]
                }
                form.storeFlag = flagId
            }

            form.stores = stores

            if (form instanceof CustomerRewardPermission) {
                form.managePoint.storeFlag = flagId
                form.managePoint.stores = [...stores]

                form.cancelPoint.storeFlag = flagId
                form.cancelPoint.stores = [...stores]

                form.transactionHistory.storeFlag = flagId
                form.transactionHistory.stores = [...stores]

                form.transactionDashboard.storeFlag = flagId
                form.transactionDashboard.stores = [...stores]

                form.transactionDownload.storeFlag = flagId
                form.transactionDownload.stores = [...stores]
            }
            else if (form instanceof ViewSaleRecordPermission) {
                form.saleMonthly.storeFlag = flagId
                form.saleMonthly.stores = [...stores]

                form.saleAccount.storeFlag = flagId
                form.saleAccount.stores = [...stores]

                form.sale.storeFlag = flagId
                form.sale.stores = [...stores]

                form.stock.storeFlag = flagId
                form.stock.stores = [...stores]
            } else if (form instanceof CouponPermission) {
                form.main.storeFlag = flagId
                form.main.stores = [...stores]

                form.history.storeFlag = flagId
                form.history.stores = [...stores]
            }
        }
    }

    private async save() {
        this.form.validate = true
        if (!this.form.allValidated) {
            return
        }

        if (!this.form.phone.value && !this.form.email.value) {
            return DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("กรุณากรอกอีเมลหรือเบอร์โทรศัพท์", "Please input email or phone")
            }).then(() => {
                // @ts-ignore
                const input: HTMLInputElement = this.$refs["input-email"]
                if (input) {
                    input.focus()
                }
            })
        }

        const perCusRw = this.form.permissionCustomerReward
        const perCusRwSaleRec = this.form.permissionViewSaleRecord
        const perCoupon = this.form.permissionCoupon

        const permissions = [
            this.form.permissionRentalData,
            this.form.permissionRenew,
            this.form.permissionPayment,
            this.form.permissionMaintenance,
            this.form.permissionManageUser,
            this.form.permissionQRCode,
            this.form.permissionSaleRecord,
            this.form.permissionShopCenterAnnouncement,
            this.form.permissionRegEInvoiceEReceipt,
            this.form.permissionViewSaleRecord,
            this.form.permissionCoupon
        ]

        for (const p of [...permissions, perCusRw, perCusRwSaleRec, perCoupon]) {
            console.log(p)
            if (p.permission.includes("reward") && ISSHOWREWARD == false) {
                continue;
            }
            
            if(p instanceof ViewSaleRecordPermission){
                if( p?.enabled && !p?.sale?.enabled && !p?.saleAccount?.enabled && !p?.saleMonthly?.enabled && !p?.stock?.enabled){
                    return DialogUtils.showErrorDialog({
                        text: this.text.please_select_sale_record
                    }).then(() => {
                        // const div = this.$refs[p.permission] as HTMLDivElement
                        // console.log("Scroll to: " + p.permission)
                        // div?.scrollIntoView()
                    })
                }
            }

            if(p instanceof CouponPermission){
                if( p?.enabled && !p?.history?.enabled && !p?.main?.enabled){
                    return DialogUtils.showErrorDialog({
                        text: this.text.please_enable_coupon
                    }).then(() => {
                        // const div = this.$refs[p.permission] as HTMLDivElement
                        // console.log("Scroll to: " + p.permission)
                        // div?.scrollIntoView()
                    })
                }
            }

            if (p.enabled && p.stores.length === 0) {
                return DialogUtils.showErrorDialog({
                    text: this.text.please_select_store
                }).then(() => {
                    const div = this.$refs[p.permission] as HTMLDivElement
                    console.log("Scroll to: " + p.permission)
                    div?.scrollIntoView()
                })
            }
            
        }

        this.loading = true
        try {

            if (perCusRw.enabled) {
                perCusRw.managePoint.storeFlag = perCusRw.storeFlag
                perCusRw.managePoint.stores = [...perCusRw.stores]
                perCusRw.cancelPoint.storeFlag = perCusRw.storeFlag
                perCusRw.cancelPoint.stores = [...perCusRw.stores]
                perCusRw.transactionHistory.storeFlag = perCusRw.storeFlag
                perCusRw.transactionHistory.stores = [...perCusRw.stores]
                perCusRw.transactionDashboard.storeFlag = perCusRw.storeFlag
                perCusRw.transactionDashboard.stores = [...perCusRw.stores]
                perCusRw.transactionDownload.storeFlag = perCusRw.storeFlag
                perCusRw.transactionDownload.stores = [...perCusRw.stores]
                permissions.push(
                    perCusRw.cancelPoint,
                    perCusRw.managePoint,
                    perCusRw.transactionDashboard,
                    perCusRw.transactionHistory,
                    perCusRw.transactionDownload
                )
            }
            if (perCusRwSaleRec.enabled) {
                perCusRwSaleRec.saleMonthly.storeFlag = perCusRwSaleRec.storeFlag
                perCusRwSaleRec.saleMonthly.stores = [...perCusRwSaleRec.stores]
                perCusRwSaleRec.saleAccount.storeFlag = perCusRwSaleRec.storeFlag
                perCusRwSaleRec.saleAccount.stores = [...perCusRwSaleRec.stores]
                perCusRwSaleRec.sale.storeFlag = perCusRwSaleRec.storeFlag
                perCusRwSaleRec.sale.stores = [...perCusRwSaleRec.stores]
                perCusRwSaleRec.stock.storeFlag = perCusRwSaleRec.storeFlag
                perCusRwSaleRec.stock.stores = [...perCusRwSaleRec.stores]
                permissions.push(
                    perCusRwSaleRec.saleMonthly,
                    perCusRwSaleRec.saleAccount,
                    perCusRwSaleRec.sale,
                    perCusRwSaleRec.stock
                )
            }
            if (perCoupon.enabled) {
                perCoupon.main.storeFlag = perCoupon.storeFlag
                perCoupon.main.stores = [...perCoupon.stores]
                perCoupon.history.storeFlag = perCoupon.storeFlag
                perCoupon.history.stores = [...perCoupon.stores]
                permissions.push(
                    perCoupon.main,
                    perCoupon.history,
                )
            }

            const data = {
                first_name: this.form.firstname.value,
                last_name: this.form.lastname.value,
                phone_number: this.form.phone.value,
                bp_number: this.user.customerNo,
                role: this.form.role?.value || "",
                email: this.form.email.value,
                permissions: permissions
                    .filter(f => f.enabled)
                    .map(({ permission, stores }) => ({
                        permission,
                        shop_ids: stores.map(s => Number(s.id))
                    }))
            }

            if (this.isEdit) {
                const rs = await EmployeeServices.updateEmployee(this.empId, data)
                console.log("update result", rs)
            } else {
                const rs = await EmployeeServices.createEmployee(data)
                console.log("create result", rs)
            }

            this.showStatus = true
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = false
    }

    private restoreFormData(emp: EmpModel.Employee | null) {
        const copyForm = String(this.$route.query.copy_from || "")

        if (!copyForm && this.$route.name === ROUTER_NAMES.manage_emp_form_add) {
            return
        }

        if (emp) {
            const f = new EmpForm()
            if (this.isEdit) {

                f.email.value = emp.email
                f.firstname.value = emp.firstname
                f.lastname.value = emp.lastname
                f.phone.value = emp.phone
                f.role = this.roles.find(r => r.id === emp.role.name) || null

            } else if (copyForm && this.$route.name === ROUTER_NAMES.manage_emp_form_add) {

                f.email.value = emp.email
                f.firstname.value = emp.firstname
                f.lastname.value = emp.lastname
                f.phone.value = emp.phone
                f.role = this.roles.find(r => r.id === emp.role.name) || null
            }
            this.form = f

            for (const permission of emp.permissions) {
                const stores: StoreModel.Store[] = []

                for (const store of permission.shops) {
                    stores.push(this.stores.find(sss => sss.id === store.id) || store)
                }

                const enabled = stores.length > 0
                const flag = ""

                if ([
                    PERMISSIONS.rewards_cancel_point,
                    PERMISSIONS.rewards_manage_point,
                    PERMISSIONS.rewards_history,
                    PERMISSIONS.rewards_dashboard,
                    PERMISSIONS.rewards_history_download

                ].includes(permission.permission)) {
                    const field = this.form.permissionCustomerReward
                    field.enabled = true
                    field.stores = stores
                    field.storeFlag = flag

                    switch (permission.permission) {
                        case PERMISSIONS.rewards_cancel_point: {
                            field.cancelPoint.enabled = enabled
                            field.cancelPoint.stores = [...stores]
                            field.cancelPoint.storeFlag = flag
                            break
                        }

                        case PERMISSIONS.rewards_manage_point: {
                            field.managePoint.enabled = enabled
                            field.managePoint.stores = [...stores]
                            field.managePoint.storeFlag = flag
                            break
                        }

                        case PERMISSIONS.rewards_history: {
                            field.transactionHistory.enabled = enabled
                            field.transactionHistory.stores = [...stores]
                            field.transactionHistory.storeFlag = flag
                            break
                        }

                        case PERMISSIONS.rewards_dashboard: {
                            field.transactionDashboard.enabled = enabled
                            field.transactionDashboard.stores = [...stores]
                            field.transactionDashboard.storeFlag = flag
                            break
                        }

                        case PERMISSIONS.rewards_history_download: {
                            field.transactionDownload.enabled = enabled
                            field.transactionDownload.stores = [...stores]
                            field.transactionDownload.storeFlag = flag
                            break
                        }
                    }
                } else if ([
                    PERMISSIONS.ordering_last_month_report,
                    PERMISSIONS.ordering_accounting_report,
                    PERMISSIONS.ordering_report,
                    PERMISSIONS.ordering_stock_report

                ].includes(permission.permission)) {
                    const field = this.form.permissionViewSaleRecord
                    field.enabled = true
                    field.stores = stores
                    field.storeFlag = flag

                    switch (permission.permission) {
                        case PERMISSIONS.ordering_last_month_report: {
                            field.saleMonthly.enabled = enabled
                            field.saleMonthly.stores = [...stores]
                            field.saleMonthly.storeFlag = flag
                            break
                        }

                        case PERMISSIONS.ordering_accounting_report: {
                            field.saleAccount.enabled = enabled
                            field.saleAccount.stores = [...stores]
                            field.saleAccount.storeFlag = flag
                            break
                        }

                        case PERMISSIONS.ordering_report: {
                            field.sale.enabled = enabled
                            field.sale.stores = [...stores]
                            field.sale.storeFlag = flag
                            break
                        }

                        case PERMISSIONS.ordering_stock_report: {
                            field.stock.enabled = enabled
                            field.stock.stores = [...stores]
                            field.stock.storeFlag = flag
                            break
                        }
                    }
                } else if ([
                    PERMISSIONS.coupon_history,
                    PERMISSIONS.coupon_main,
                ].includes(permission.permission)) {
                    const field = this.form.permissionCoupon
                    field.enabled = true
                    field.stores = stores
                    field.storeFlag = flag

                    switch (permission.permission) {
                        case PERMISSIONS.coupon_main: {
                            field.main.enabled = enabled
                            field.main.stores = [...stores]
                            field.main.storeFlag = flag
                            break
                        }
                        case PERMISSIONS.coupon_history: {
                            field.history.enabled = enabled
                            field.history.stores = [...stores]
                            field.history.storeFlag = flag
                            break
                        }
                    }
                } else {
                    const field = this.getPermissionForm(permission.permission)
                    if (field) {
                        field.enabled = enabled
                        field.stores = stores
                        field.storeFlag = flag
                    }
                }
            }
        }
    }

    private get isEdit() {
        return this.$route.name === ROUTER_NAMES.manage_emp_form_edit
    }

    private get empId() {
        return this.$route.params.emp_id || ""
    }

    private async mounted() {
        this.form = new EmpForm()
        window.addEventListener("resize", this.onWindowChange)
        this.initialDatas()
    }

    private async initialDatas() {
        this.loading = true
        let { employee } = this
        await this.getUserStore()

        try {
            if (this.isEdit && !employee) {
                employee = await EmployeeServices.getEmployeeById(this.empId)
            } else {
                const copyForm = String(this.$route.query.copy_from || "")
                if (copyForm) {
                    employee = await EmployeeServices.getEmployeeById(copyForm)
                }
            }

        } catch (e) {
            //
        }

        this.restoreFormData(employee)
        this.loading = false
    }

    private beforeDestroy() {
        window.removeEventListener("resize", this.onWindowChange)
    }

    private get maxDialogContentHeight() {
        return this.window.height - 420
    }

    private async getUserStore() {
        try {
            const stores = await StoreServices.getStoresByBP(this.user.customerNo)
            this.stores = stores
            this.selectStoreDialog.storeList = [...stores]
        } catch (e) {
            console.log("Get store error", e.message || e)
        }
    }
}

class CustomerRewardPermission {
    enabled = false
    storeFlag = ""
    stores: StoreModel.Store[] = []
    permission = PERMISSION_CUSTOMER_REWARD

    managePoint = new EmpPermissionSetting(PERMISSIONS.rewards_manage_point)
    cancelPoint = new EmpPermissionSetting(PERMISSIONS.rewards_cancel_point)
    transactionHistory = new EmpPermissionSetting(PERMISSIONS.rewards_history)
    transactionDashboard = new EmpPermissionSetting(PERMISSIONS.rewards_dashboard)
    transactionDownload = new EmpPermissionSetting(PERMISSIONS.rewards_history_download)
}

class ViewSaleRecordPermission {
    enabled = false
    storeFlag = ""
    stores: StoreModel.Store[] = []
    permission = ORDERING

    saleMonthly = new EmpPermissionSetting(PERMISSIONS.ordering_last_month_report)
    saleAccount = new EmpPermissionSetting(PERMISSIONS.ordering_accounting_report)
    sale = new EmpPermissionSetting(PERMISSIONS.ordering_report)
    stock = new EmpPermissionSetting(PERMISSIONS.ordering_stock_report)
}

class CouponPermission {
    enabled = false
    storeFlag = ""
    stores: StoreModel.Store[] = []
    permission = COUPON

    main = new EmpPermissionSetting(PERMISSIONS.coupon_main)
    history = new EmpPermissionSetting(PERMISSIONS.coupon_history)
}

class EmpForm {
    validate = false
    avatar = new CPMForm.ImageFormValue()
    email = new CPMForm.FormValue()
    phone = new CPMForm.FormValue()
    firstname = new CPMForm.FormValue()
    lastname = new CPMForm.FormValue()
    role: EmpRole | null = null
    allApplyStores: StoreModel.Store[] = []

    permissionRentalData = new EmpPermissionSetting(PERMISSIONS.contract_info)
    permissionRenew = new EmpPermissionSetting(PERMISSIONS.contract_renew_refund)
    permissionPayment = new EmpPermissionSetting(PERMISSIONS.payment)
    // permissionThe1BIZ = new EmpPermissionSetting(PERMISSIONS.the_one_biz)

    permissionMaintenance = new EmpPermissionSetting(PERMISSIONS.maintenance)
    permissionManageUser = new EmpPermissionSetting(PERMISSIONS.employee_management)
    permissionQRCode = new EmpPermissionSetting(PERMISSIONS.qr_code)
    // permissionCustomerReward = new EmpPermissionSetting(PERMISSIONS.the_one_biz)
    permissionSaleRecord = new EmpPermissionSetting(PERMISSIONS.shop_sale)
    permissionViewSaleRecord = new ViewSaleRecordPermission()
    permissionShopCenterAnnouncement = new EmpPermissionSetting(PERMISSIONS.branch_announcement)
    permissionRegEInvoiceEReceipt = new EmpPermissionSetting(PERMISSIONS.e_invoice_receipt)
    permissionCustomerReward = new CustomerRewardPermission()
    permissionCoupon = new CouponPermission()

    get storeFlags() {
        return {
            all: {
                id: STORE_FLAG.all_store,
                label: LanguageUtils.lang("ทุกร้านค้า", "All store")
            },
            all_in_bnk: {
                id: STORE_FLAG.all_in_bnk,
                label: LanguageUtils.lang("ทุกร้านค้าเฉพาะในกรุงเทพ", "Every shop only in Bangkok")
            }
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    get errors() {
        const { lang } = LanguageUtils
        const { role, email, phone, firstname, lastname } = this
        return {
            role: (v => {
                if (!v) {
                    return lang("กรุณาเลือกตำแหน่งหน้าที่", "Please select role")
                }
                return null
            })(role),

            email: (v => {
                // if (!v) {
                //     return lang("กรุณากรอกอีเมล", "Please input email")
                // }

                if (v && !ValidateUtils.validateEmail(v)) {
                    return lang("อีเมลไม่ถูกต้อง", "Email invalid")
                }

                return null
            })(email.value),

            phone: (v => {
                // if (!v) {
                //     return lang("กรุณากรอกเบอร์โทรศัพท์", "Please input phone")
                // }

                if (v && !ValidateUtils.validatePhone(v)) {
                    return lang("เบอร์โทรศัพท์ไม่ถูกต้อง", "Phone invalid")
                }

                return null
            })(phone.value),

            firstname: (v => {
                if (!v) {
                    return lang("กรุณากรอกชื่อ", "Please input firstname")
                }

                return null
            })(firstname.value),

            lastname: (v => {
                if (!v) {
                    return lang("กรุณากรอกนามสกุล", "Please input lastname")
                }

                return null
            })(lastname.value),
        }
    }

    get allPermissionForms() {
        return [
            this.permissionRentalData,
            this.permissionRenew,
            this.permissionPayment,
            // this.permissionThe1BIZ,
            this.permissionMaintenance,
            this.permissionManageUser,
            this.permissionQRCode,
            this.permissionCustomerReward,
            this.permissionSaleRecord,
            this.permissionViewSaleRecord,
            this.permissionShopCenterAnnouncement,
            this.permissionRegEInvoiceEReceipt,
            this.permissionCoupon
        ]
    }

    get enabledPermissionForms() {
        return this.allPermissionForms.filter(p => p.enabled)
    }
}

class EmpPermissionSetting {
    enabled = false
    storeFlag = ""
    stores: StoreModel.Store[] = []
    permission = ""

    constructor(v: string) {
        this.permission = v
    }
}

class EmpRole {
    id = ""
    value = ""
    nameTh = ""
    nameEn = ""
    image = ""

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}

class SelectStoreDialog {
    show = false
    branchList: Branch[] = []
    showMenu = false
    search = ""
    loading = false
    storeList: StoreModel.Store[] = []
    selectedStore: StoreModel.Store[] = []
    type = ""

    storeGroups: StoreGroup[] = []

    clearSearch() {
        this.search = ""
    }

    get isSelectAll() {
        const search_string = this.search.toLowerCase()
        const searchStores = this.storeList.filter(s => (String(s.displayName).toLowerCase().includes(search_string) || s.branch.displayName.toLowerCase().includes(search_string)))
        const selectedStores = this.selectedStore
        let isNotLikeFromSearch = true;

        if (search_string != "") {
            for (const c of searchStores) {
                const isHavefromSearchStore = selectedStores.some(x => x.id == c.id)
                if (!isHavefromSearchStore) {
                    isNotLikeFromSearch = false;
                    break;
                }
            }
            return isNotLikeFromSearch;
            // return selectedStores.length == searchStores.length;
        } else {
            return this.storeList.length === this.selectedStore.length
        }
    }

    // -------------------- store -----------------------

    selectStore(s: StoreModel.Store) {
        if (this.isStoreSelected(s)) {
            this.selectedStore = this.selectedStore.filter(u => u.id !== s.id)
        } else {
            this.selectedStore.push(s)
        }
        
        if(LanguageUtils.lang("ห้อง", "Room") == 'ห้อง'){
            this.selectedStore = this.selectedStore.sort((
                v1: StoreModel.Store, v2: StoreModel.Store) => 
                v1.nameTh.toLowerCase().localeCompare(v2.nameTh.toLowerCase()) || 
                v1.branch.nameTh.toLowerCase().localeCompare(v2.branch.nameTh.toLowerCase()) || 
                v1.floorRoom.toLowerCase().localeCompare(v2.floorRoom.toLowerCase()
                ));
        }else{
            this.selectedStore = this.selectedStore.sort((
                v1: StoreModel.Store, v2: StoreModel.Store) => 
                v1.nameEn.toLowerCase().localeCompare(v2.nameEn.toLowerCase()) || 
                v1.branch.nameEn.toLowerCase().localeCompare(v2.branch.nameEn.toLowerCase()) || 
                v1.floorRoom.toLowerCase().localeCompare(v2.floorRoom.toLowerCase()
                ));
        }
    }

    toggleSelectAll() {
        const { storeList, search } = this
        const search_string = search.toLowerCase()
        const searchStores = storeList.filter(s => (String(s.displayName).toLowerCase().includes(search_string) || s.branch.displayName.toLowerCase().includes(search_string)))

        if (this.isSelectAll) {
            if (search_string != "" || search_string != null) {
                for (const c of searchStores) {
                    this.selectedStore = this.selectedStore.filter(x => x.id !== c.id)
                }
            } else {
                this.selectedStore = []
            }
        } else {
            if (search_string == "" || search_string == null) {
                this.selectedStore = [...this.storeList]
            } else {
                for (const c of searchStores) {
                    this.selectedStore.push(c)
                }
            }
        }
    }

    selectGroup(g: StoreGroup) {
        const notGroup = this.selectedStore.filter(s => !g.stores.some(gs => gs.id === s.id))
        if (this.isGroupChecked(g)) {
            this.selectedStore = notGroup
        } else {
            this.selectedStore = [...notGroup, ...g.stores]
        }
    }

    isStoreSelected(s: StoreModel.Store) {
        return this.selectedStore.some(t => t.id === s.id)
    }

    get isStoreSelectEmpty() {
        return this.selectedStore.length === 0
    }

    isSearching() {
        const { storeList, search } = this
        return (search != "" || search != null) ? true : false
    }

    formatStoreGroups() {
        const { storeList } = this

        const map = new Map<string, StoreGroup>()
        for (const store of storeList) {
            const key = JSON.stringify({
                name: store.displayName
            })

            let sg = map.get(key)
            if (!sg) {
                sg = new StoreGroup()
                sg.name = store.displayName
            }

            sg.stores.push(store)

            const idx = sg.branchList.findIndex(b => b.id === store.branch.id)
            let bg = sg.branchList[idx]
            if (!bg) {
                bg = new BranchStoreGroup()
                bg.id = store.branch.id
                bg.code = store.branch.code
                bg.branchName = store.branch.displayName
            }

            bg.stores.push(store)

            if (idx > -1) {
                sg.branchList[idx] = bg
            } else {
                sg.branchList.push(bg)
            }

            map.set(key, sg)
        }

        const groups: StoreGroup[] = []
        for (const group of map.values()) {
            groups.push(group)
        }
        this.storeGroups = groups
        return groups
    }

    // ----------------- check state --------------------

    isGroupChecked(g: StoreGroup) {
        const group = this.storeGroups.find(sg => sg.id === g.id)
        return group?.stores.some(s => this.isStoreSelected(s)) === true
    }

    selectStoreByBranch(b: BranchStoreGroup) {
        const notBranch: StoreModel.Store[] = []
        const branchStores: StoreModel.Store[] = []
        for (const store of this.selectedStore) {
            if (store.branch.id === b.id && b.stores.some(s => s.displayName === store.displayName)) {
                branchStores.push(store)
            } else {
                notBranch.push(store)
            }
        }

        if (branchStores.length > 0) {
            this.selectedStore = notBranch
        } else {
            this.selectedStore = [...notBranch, ...b.stores]
        }
    }

    isBranchSelected(b: BranchStoreGroup) {
        return this.selectedStore.some(s => b.stores.some(bs => bs.displayName === s.displayName) && s.branch.id === b.id)
    }

    get filteredStoreGroup() {
        const { storeGroups, search } = this
        if (!search) {
            return storeGroups
        }
        return storeGroups.filter(g => String(g.name).toLowerCase().includes(search))
    }

    get displaySelectedStore() {
        const stores: string[] = []
        for (const store of this.selectedStore) {
            if (!stores.includes(store.displayName)) {
                stores.push(store.displayName)
            }
        }
        return stores.join(", ")
    }

    get displayStores() {
        const { storeList, search } = this
        let sortStores
        if(LanguageUtils.lang("ห้อง", "Room") == 'ห้อง'){
            sortStores = [...storeList].sort((
                v1: StoreModel.Store, v2: StoreModel.Store) => 
                v1.nameTh.toLowerCase().localeCompare(v2.nameTh.toLowerCase()) || 
                v1.branch.nameTh.toLowerCase().localeCompare(v2.branch.nameTh.toLowerCase()) || 
                v1.floorRoom.toLowerCase().localeCompare(v2.floorRoom.toLowerCase()
                ));
        }else{
            sortStores = [...storeList].sort((
                v1: StoreModel.Store, v2: StoreModel.Store) => 
                v1.nameEn.toLowerCase().localeCompare(v2.nameEn.toLowerCase()) || 
                v1.branch.nameEn.toLowerCase().localeCompare(v2.branch.nameEn.toLowerCase()) || 
                v1.floorRoom.toLowerCase().localeCompare(v2.floorRoom.toLowerCase()
                ));
        }
        console.log(sortStores)
        if (!search) {
            return sortStores
        }
        const search_string = search.toLowerCase()
        return sortStores.filter(s => (String(s.displayName).toLowerCase().includes(search_string) || s.branch.displayName.toLowerCase().includes(search_string)
        ))
    }
}

class StoreGroup {
    id = Math.random().toString(13).replace("0.", "")
    name = ""
    stores: StoreModel.Store[] = []
    branchList: BranchStoreGroup[] = []
}

class BranchStoreGroup {
    id = ""
    branchName = ""
    code = ""
    stores: StoreModel.Store[] = []
}
