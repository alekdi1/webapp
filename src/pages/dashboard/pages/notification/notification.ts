import { Component } from "vue-property-decorator"
import DBPageNames from "../page-names"
import Base from "../../dashboard-base"
import { DialogUtils, LanguageUtils } from "@/utils"
import { MaintainanceServices, NotificationServices, RewardServices, VuexServices } from "@/services"
import { PostModel } from "@/models"
import moment from "moment"
import { ROUTER_NAMES } from "@/router"
import ctjs, { kdf } from "crypto-js"
import { compile } from "vue/types/umd"
import { notification } from "@/lang/th/pages"
import { CPMForm } from "../../models"

const t = (k: string) => LanguageUtils.i18n.t("pages.notification." + k).toString()

interface FilterTypeItem {
    label: string
    value: string[]
}

@Component({
    name: DBPageNames.notification
})
export default class NotificationRoot extends Base {

    private loading = false
    private filterDialog = false
    private filteredType: string[] = []
    private notificatios: PostModel.Notification[] = []
    private errorMessage = ""
    private filterNotRaed = true;
    private filterRaeded = true;

    private get text() {
        return Object.freeze({
            page_title: t("title"),
            title_select_type: t("title_select_type"),
            type_show_all: t("type_show_all")
        })
    }

    // ---------------- filter -----------------
    private get filteredLabel() {
        const { filterItems, isFilteredAll, text, filteredType } = this
        if (isFilteredAll) {
            return text.type_show_all
        }
        const item = filterItems.find(i => i.value === filteredType)
        return item?.label || ""
    }

    private get isFilteredAll() {
        return this.filteredType.length === 0
    }

    private get filterItems(): FilterTypeItem[] {
        const { types } = this.appConfig.notification
        const NOTI_TYPES = NotificationServices.TYPES

        if (this.user.isQRUser) {
            return [
                {
                    label: LanguageUtils.lang("ดูทั้งหมด", "View all"),
                    value: []
                },
                {
                    label: types.maintenance || LanguageUtils.lang("แจ้งซ่อม", "Maintenance"),
                    value: [NOTI_TYPES.maintenance]
                },
                {
                    label: types[NOTI_TYPES.post] || LanguageUtils.lang("ประกาศศูนย์การค้า", "Announcement"),
                    value: [NOTI_TYPES.post]
                },
                {
                    label: types[NOTI_TYPES.promotion] || LanguageUtils.lang("โปรโมชัน", "Promotions"),
                    value: [NOTI_TYPES.promotion]
                }
            ]
        }

        return [
            {
                label: LanguageUtils.lang("ดูทั้งหมด", "View all"),
                value: []
            },
            {
                label: types[NOTI_TYPES.payment_success] || types[NOTI_TYPES.payment_pending] || LanguageUtils.lang("ใบแจ้งหนี้", "Payment"),
                value: [NOTI_TYPES.payment_success, NOTI_TYPES.payment_pending]
            },
            {
                label: types[NOTI_TYPES.maintenance] || LanguageUtils.lang("แจ้งซ่อม", "Maintenance"),
                value: [NOTI_TYPES.maintenance]
            },
            // {
            //     label: types[NOTI_TYPES.reject_void] || types[NOTI_TYPES.approve_void] || types[NOTI_TYPES.request_void] || LanguageUtils.lang("รีวอร์ดลูกค้า", "Reward"),
            //     value: [NOTI_TYPES.reject_void, NOTI_TYPES.approve_void, NOTI_TYPES.request_void]
            // },
            {
                label: types.contract || LanguageUtils.lang("สัญญาเช่า", "Rental Contract"),
                value: [NOTI_TYPES.contract]
            },
            {
                label: types[NOTI_TYPES.post] || LanguageUtils.lang("ประกาศศูนย์การค้า", "Announcement"),
                value: [NOTI_TYPES.branch_annonuce]
            },
            {
                label: LanguageUtils.lang("ข่าวสารและกิจกรรม", "News And Activity"),
                value: [NOTI_TYPES.post]
            },
            {
                label: types[NOTI_TYPES.promotion] || LanguageUtils.lang("โปรโมชัน", "Promotions"),
                value: [NOTI_TYPES.promotion]
            },
            {
                label: types[NOTI_TYPES.contact_us] || LanguageUtils.lang("ติดต่อเรา", "Contact us"),
                value: [NOTI_TYPES.contact_us]
            }
        ]
    }

    private selectFilter(item: FilterTypeItem) {
        this.filterDialog = false
        this.filteredType = item.value
    }

    isFilterSelected(item: FilterTypeItem) {
        if (this.filteredType.length === 0) {
            // all
            if (item.value.length === 0) {
                return true
            }
            return false
        }
        return this.filteredType.every(i => item.value.some(s => s === i))
    }

    // ---------------- data ------------------

    private async mounted() {
        await this.getNotifications()
    }

    private async getNotifications() {
        let newNotis: (string | number)[] = []
        this.loading = true
        try {
            let notis: PostModel.Notification[] = []
            if (this.user.isQRUser) {
                notis = await NotificationServices.getGuestNotification(this.user.customerNo)
            } else {
                notis = await NotificationServices.getNotification()
            }
            this.notificatios = notis;
            newNotis = notis.filter(n => !n.isRead).map(n => n.id)
            await VuexServices.Root.setNotifications(this.notificatios)

            console.log("notificatios --> ", this.notificatios)
        } catch (e) {
            // console.log(e.message || e)
            this.errorMessage = e.message
        }
        this.loading = false
    }

    private get displayNotifications() {
        const { isFilteredAll, filteredType, notificatios } = this
        let notificatios_filter: PostModel.Notification[] = [];

        if ((this.filterNotRaed && this.filterRaeded) || (!this.filterNotRaed && !this.filterRaeded)) {
            notificatios_filter = notificatios;
        } else if (this.filterNotRaed && !this.filterRaeded) {
            notificatios_filter = notificatios.filter((a: PostModel.Notification) => a.isRead == false)
        } else if (this.filterRaeded && !this.filterNotRaed) {
            notificatios_filter = notificatios.filter((a: PostModel.Notification) => a.isRead == true)
        }

        const filer_notification = notificatios_filter.filter(n => filteredType.includes(n.type))
        return !isFilteredAll ? filer_notification : notificatios_filter
    }

    private get displayNotificationItems() {
        const display = [...this.displayNotifications]
            // sort desc by created date
            .sort((n1, n2) => n2.createdDate.localeCompare(n1.createdDate))
            // map to view model
            .map(n => new NotificationItem(n))
        return display;
    }

    private get error() {
        const { errorMessage, displayNotifications } = this
        if (errorMessage) {
            return `<span class="error--text">${errorMessage}</span>`
        }

        if (displayNotifications.length === 0) {
            return LanguageUtils.lang(
                "ไม่มีรายการแจ้งเตือน",
                "No notification"
            )
        }
        return ""
    }

    private async notiClick(item: NotificationItem) {

        const { TYPES } = NotificationServices
        const notification = this.notificatios.find((x: PostModel.Notification) => x.refId == item.refId); // for real
        const notiId = notification ? notification.id : 0;
        try {
            if (notification != undefined && !notification.isRead && item.type != TYPES.payment_success) {
                const updateResult = await NotificationServices.markNotisAsRead([notification.id]) // for real
                const notis = this.notificatios.filter((x: PostModel.Notification) => x.refId == item.refId).map(n => {
                    n.isRead = true
                    return n
                })
                await VuexServices.Root.setNotifications(notis)
            }
        } catch (e) {
            console.log("Mark as read error", e.message || e)
        }

        switch (item.type) {
            case TYPES.contact_us: return this.$router.push({
                name: ROUTER_NAMES.contact_answer_question_detail,
                params: {
                    id: String(item.refId)
                },
                query: {
                    noti_id: String(item.item.id),
                    ts: new Date().getTime().toString()
                }
            })

            case TYPES.maintenance: {
                try {
                    const rs = await MaintainanceServices.getMaintainanceByNotiRefId(String(item.refId))
                    return this.$router.push({
                        name: ROUTER_NAMES.maintainance_status_list,
                        query: {
                            bpNo: this.user.bpNumber,
                            tenantNo: rs.tenantId,
                            status: "success"
                        }
                    })
                } catch (e) {
                    console.log(e)
                    DialogUtils.showErrorDialog({
                        text: e.message || "Get maintainance detail error"
                    })
                }

                break
            }

            case TYPES.promotion: return this.$router.push({
                name: ROUTER_NAMES.dashboard_promotion_detail,
                params: {
                    id: String(item.refId)
                }
            })

            case TYPES.post: return this.$router.push({
                name: ROUTER_NAMES.dashboard_news_and_activities_detail,
                params: {
                    id: String(item.refId)
                }
            })

            case TYPES.payment_success: return this.$router.push({
                name: ROUTER_NAMES.payment_result,
                query: {
                    order_id: String(item.refId),
                    show_from: "notification",
                    state: ctjs.SHA1(JSON.stringify(item) + JSON.stringify(this.user) + ROUTER_NAMES.payment_result).toString(),
                    noti_id: String(notiId)
                }
            })

            case TYPES.payment_pending: return this.$router.push({
                name: ROUTER_NAMES.payment_invoice_list,
                query: {
                    order_id: String(item.refId),
                    show_from: "notification",
                    notification_id: String(item.item.id),
                    state: ctjs.SHA1(JSON.stringify(item) + JSON.stringify(this.user) + ROUTER_NAMES.payment_invoice_list).toString()
                }
            })

            case TYPES.branch_annonuce: return this.$router.push({
                name: ROUTER_NAMES.dashboard_annoucement_detail,
                params: {
                    id: String(item.refId)
                }
            })

            case TYPES.request_void:
            case TYPES.reject_void:
            case TYPES.approve_void: {

                try {
                    const transData = await RewardServices.getTransactionById(String(item.refId))
                    const rn = TYPES.reject_void === item.type ?
                        ROUTER_NAMES.rewards_transaction_history : ROUTER_NAMES.rewards_approve_void
                    const store = transData.shop_detail
                    return this.$router.push({
                        name: rn,
                        query: {
                            show_from: "notification",
                            noti_id: String(item.item.id),
                            transaction_id: transData.transaction_id,
                            item_id: String(transData.id),
                            action: "expand",
                            shop_name: store.shop_name,
                            shop_unit: store.floor_room,
                            branch_name: store.branch_name,
                            shop_number: store.shop_number,
                            industry_code: store.industry_code,
                            branch_code: store.branch_code,
                            floor_room: store.floor_room,
                            hs: ctjs.SHA1(JSON.stringify(store) + rn + new Date().getTime()).toString(),
                            status_tab: transData.status
                        },
                        params: {
                            shop_id: String(store.id)
                        }
                    })
                } catch (e) {
                    console.log(e)
                    DialogUtils.showErrorDialog({
                        text: e.message || "Get reward transaction detail error"
                    })
                }
                break
            }
        }
    }

    private async checkReadNotifications(e: any) {
        const value = e.target.value;
        const isChecked = e.target.checked;

        if (value == "1") {
            this.filterNotRaed = isChecked
        } else {
            this.filterRaeded = isChecked
        }

        if (!this.filterRaeded && !this.filterNotRaed) {
            e.target.checked = true
            if (value == "1") {
                this.filterNotRaed = true
            } else {
                this.filterRaeded = true
            }
            return;
        }
    }
}

class NotificationItem {
    item: PostModel.Notification
    constructor(noti: PostModel.Notification) {
        this.item = noti
    }

    get refId() {
        return this.item.refId
    }

    get title() {
        return this.item.title || ""
    }

    get desc() {
        return this.item.desc || ""
    }

    get isReaded() {
        return this.item.isRead
    }

    get isNew() {
        return !this.item.isRead
    }

    get type() {
        return this.item.type
    }

    get iconImage(): string {
        switch (this.item.type) {
            case NotificationServices.TYPES.payment: return require("@/assets/images/notification/noti-invoice.svg")
            default: return require("@/assets/images/notification/noti-default.svg")
        }
    }

    get displayDate() {
        const md = moment(this.item.createdDate, moment.ISO_8601)
        return md.isValid() ? `${md.locale(LanguageUtils.getCurrentLang()).format("DD MMM")} ${LanguageUtils.getLangYear(md)}` : ""
    }
}
