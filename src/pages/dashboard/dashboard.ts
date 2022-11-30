import { Component, Vue, Watch } from "vue-property-decorator"
import SideMenu from "./components/side-menu.vue"
import { AppService, AuthService, BranchService, EmployeeServices, NotificationServices, PostService, UserServices, VuexServices } from "@/services"
import { AppModel, PostModel, UserModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import PageNames from "./pages/page-names"
import { DialogUtils, LanguageUtils, StorageUtils } from "@/utils"
import moment from "moment"

const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
    "mousedown",
    "mousemove",
    "keydown",
    "scroll",
    "touchstart",
    "wheel"
]

@Component({
    components: {
        "cpn-dsb-sidemenu": SideMenu,
    }
})
export default class DashboardRootPage extends Vue {

    private loading = false

    @VuexServices.Root.VXAppConfig()
    protected appConfig!: AppModel.AppConfig

    @VuexServices.Root.VXUser()
    private user!: UserModel.User | null

    @VuexServices.Root.VXFullScreenLoading()
    private fsLoading!: boolean

    @VuexServices.Root.VXFavoriteItems()
    private favs!: PostModel.FavoritePost[]

    private pageWatcherState: PageWatcherState | null = null

    private async mounted() {
        await this.checkUser()
    }

    private get qrUser() {
        return String(this.$route.query.role || "")
    }

    private get tenantNo() {
        return String(this.$route.query.tenantNo || "")
    }

    // From partner query
    private get tenantId() {
        return String(this.$route.query.TenantID || "")
    }

    private get bpNo() {
        return String(this.$route.query.bpNo || "")
    }

    private get qrBranchCode() {
        return String(this.$route.query.qrBranch || "")
    }

    private async getUser() {
        const au = AuthService.getLocalAuthUser()
        let result = null
        if (au) {
            try {
                result = await UserServices.getUserInfo(au.token)
            } catch (e) {
                result = null
            }
        }
        return result
    }

    private async checkUser() {
        this.loading = true
        try {
            if (this.qrUser === "QR") {
                AuthService.clearLocalAuthUser()
                const user = new UserModel.User()
                user.role = "QR"
                let bpNo = this.bpNo

                if (!this.bpNo && this.tenantId) {
                    const bp = await BranchService.getBPByTenantId(this.tenantId)
                    bpNo = bp.bpNo
                }
                const StoreList = await UserServices.getUserByTenantId(this.tenantNo)

                user.customerNo = bpNo
                user.firstName = StoreList.data[0].tenantName
                user.bpName = StoreList.bPName
                user.companyName = StoreList.data[0].branchNameTH
                
                const branches = await BranchService.getBranchList()
                user.branchList = branches
                const qrUserBranch = branches.find(b => b.code === this.qrBranchCode)
                if (qrUserBranch) {
                    // @ts-ignore
                    user.allowedBranchIds = [qrUserBranch.id]
                }
                StorageUtils.setItem("QR_TENANT_NO", this.tenantNo)
                VuexServices.Root.setUser(user)
                const config = await AppService.getWebConfig()
                // console.log("config --> getWebConfig --> ", config)
                await VuexServices.Root.setAppConfig(config)
                this.loading = false
                return this.$router.replace({
                    query: {
                        ts: new Date().getTime().toString()
                    }
                })
            }

            const user = await this.getUser()
            if (!user || user == null) {
                DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("Session หมดอายุ กรุณาเข้าใช้งานใหม่อีกครั้ง", "Session Timeout. Please try to login again.")
                })
                return this.$router.replace({
                    name: ROUTER_NAMES.login
                })
            }

            const branches = await BranchService.getBranchList()
            user.branchList = branches
            const config = await AppService.getWebConfig()

            const userPagePermission = await AppService.getUserMenuPermissions()
            config.userPagePermissions = userPagePermission
            // console.log("Web config ", config)
            await VuexServices.Root.setAppConfig(config)
            await VuexServices.Root.setUser(user)
        } catch (e) {
            console.log(e.message || e)
            AuthService.clearLocalAuthUser()
            return this.$router.replace({
                name: ROUTER_NAMES.login
            })
        }
        this.loading = false

        try {
            const notis = await NotificationServices.getNotification()
            await VuexServices.Root.setNotifications(notis)
        } catch (error) {
            console.log("get noti error", error.message)
        }

        try {
            await this.getFavorite()
        } catch (e) {
            console.error("get favorite error")
        }

        if (this.checkUserPagePermission(this.$route.name || "")) {
            this.setupPageEventWatcher()
        }
    }

    private checkUserPagePermission(rn: string) {

        const checkConfig = () => {

            if (this.user?.isQRUser) {
                return [
                    ROUTER_NAMES.coupon_history_coupon_list_by_shop,
                    ROUTER_NAMES.coupon_history_shop_list,
                    ROUTER_NAMES.coupon,
                    ROUTER_NAMES.coupon_branch,
                    ROUTER_NAMES.coupon_code,
                    ROUTER_NAMES.coupon_detail,
                    ROUTER_NAMES.coupon_confirm,
                    ROUTER_NAMES.coupon_success,
                    ROUTER_NAMES.coupon_wrong,
                    ROUTER_NAMES.maintainance_shop_list,
                    ROUTER_NAMES.maintainance_status_list,
                    ROUTER_NAMES.maintainance_repair_form,
                    ROUTER_NAMES.maintainance_survey,
                    ROUTER_NAMES.maintainance_survey_success,
                    ROUTER_NAMES.maintainance_form_success,
                    ROUTER_NAMES.dashboard_shopping_center_info,
                    ROUTER_NAMES.dashboard_shopping_center_list,
                    ROUTER_NAMES.dashboard_business_insights,
                    ROUTER_NAMES.dashboard_business_insights_detail,
                    ROUTER_NAMES.dashboard_annoucement,
                    ROUTER_NAMES.dashboard_annoucement_detail,
                    ROUTER_NAMES.dashboard_news_and_activities,
                    ROUTER_NAMES.dashboard_news_and_activities_detail,
                    ROUTER_NAMES.dashboard_promotion,
                    ROUTER_NAMES.dashboard_promotion_detail,
                    ROUTER_NAMES.dashboard_shopping_center_map,
                    ROUTER_NAMES.dashboard_home_page,
                    ROUTER_NAMES.dashboard_notification
                ].includes(rn)
            }

            const menuKey = AppService.getRouteKey(rn)

            let granted = true
            if (menuKey === null) {
                granted = true
            } else {
                granted = this.appConfig.userPagePermissions[menuKey] !== false
            }

            if (!this.user?.isOwner && granted) {
                const permissionKey = EmployeeServices.getRoutePermission(rn)

                if (!permissionKey) {
                    return true
                }

                if (Array.isArray(permissionKey)) {
                    return this.user?.permissions.some(p => permissionKey.includes(p.permission)) === true
                }

                return this.user?.permissions.some(p => p.permission === permissionKey) === true
            }
            return granted
        }

        const isGranted = checkConfig()
        if (!isGranted) {
            DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("คุณไม่สามารถเข้าเมนูนี้ได้<br>กรุณาติดต่อ 02-021-9999", "คุณไม่สามารถเข้าเมนูนี้ได้<br>กรุณาติดต่อ 02-021-9999")
            })
            this.$router.replace({
                name: ROUTER_NAMES.dashboard_home_page
            })
        }

        return isGranted
    }

    private async getFavorite() {
        const groups = await PostService.getUserAllFavoritePost()
        await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
    }

    // no cache pages
    private get exclude() {
        return [
            PageNames.change_username,
            PageNames.change_password,
            PageNames.shopping_center_info,
            PageNames.reg_e_invoice_receipt_detail,
            PageNames.payment_root,
            PageNames.payment_history,
            PageNames.notification,
            PageNames.contact_branch_root,
            PageNames.rental_root
        ]
    }

    @Watch("$route")
    private async onRouteChange() {
        if (this.user && !this.user.isQRUser) {
            try {
                const user = await this.getUser()
                if (!user || user == null) {
                    DialogUtils.showErrorDialog({
                        text: LanguageUtils.lang("Session หมดอายุ กรุณาล็อคอินใหม่อีกครั้ง", "Session time out Please login again.")
                    })
                    return this.$router.replace({
                        name: ROUTER_NAMES.login
                    })
                }
            } catch (e) {
                console.log("get user error", e)
            }
        }

        if (this.checkUserPagePermission(this.$route.name || "")) {
            if (this.user && !this.user.isQRUser) {
                this.setupPageEventWatcher()
            }
        }
    }

    private setupPageEventWatcher() {
        this.clearPageWatcherState()

        const time = AppService.getLeavePageConfig(this.$route.name || "")

        if (time > 0) {
            console.log("Setting time: " + time + " seconds")
            const pws = new PageWatcherState(time)
            pws.timeListener = setInterval(async () => {
                pws.currentTime = new Date()

                if (pws.isExpired) {
                    this.clearPageWatcherState()

                    await this.showSessionExpireDialog()
                    this.$router.replace({
                        name: ROUTER_NAMES.dashboard_home_page,
                        query: {
                            ref_action: "TIME_OUT",
                            ts: new Date().getTime().toString()
                        }
                    })
                }
            }, 1000)

            for (const ev of ACTIVITY_EVENTS) {
                document.addEventListener(ev, this.triggerUserEvent)
            }

            this.pageWatcherState = pws
        }
    }

    private clearPageWatcherState() {

        if (this.pageWatcherState) {
            if (this.pageWatcherState.timeListener) {
                clearInterval(this.pageWatcherState.timeListener)
            }

            for (const ev of ACTIVITY_EVENTS) {
                document.removeEventListener(ev, this.triggerUserEvent)
            }

            console.log("Event track clear")
        }
    }

    private triggerUserEvent() {
        if (this.pageWatcherState) {
            this.pageWatcherState.expireDate = moment().add(this.pageWatcherState.time, "seconds").toDate()
        }
    }

    private beforeDestroy() {
        this.clearPageWatcherState()
    }

    private showSessionExpireDialog() {
        return DialogUtils.showErrorDialog({ text: "Session timeout due to no activities in time" })
    }
}

class PageWatcherState {
    expireDate = new Date()
    currentTime = new Date()
    timeListener?: NodeJS.Timeout
    time = 0

    constructor(time: number) {
        this.time = time
        this.expireDate = moment().add(time, "seconds").toDate()
    }

    get isExpired() {
        return this.currentTime.getTime() >= this.expireDate.getTime()
    }
}
