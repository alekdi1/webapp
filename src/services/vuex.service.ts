import store, { VX, ACTIONS, ITEMS, emptyState } from "@/store"
import * as Models from "@/models"

const set = (action: string, data: any) => store.dispatch(action, data)

const get = <T>(key: string, defaultValue: T): T => store.getters[key] || defaultValue

export const CustomerReward = (() => {

    const mapPath = (k: string) => "customerRewardModule/" + k
    const items = { ...ITEMS.customer_reward }
    const actions = { ...ACTIONS.customer_reward }

    return {
        store: (() => {
            type RewardStore = null | Models.StoreModel.Store
            return {
                VX: () => VX(mapPath(items.store)),
                set: (s: RewardStore) => set(mapPath(actions.update_store), s),
                get: () => get<RewardStore>(mapPath(items.store), null)
            }
        })(),

        configs: (() => {
            type RewardConfigs = Models.RewardModel.RewardConfig[]
            return {
                VX: () => VX(mapPath(items.configs)),
                set: (rcs: RewardConfigs) => set(mapPath(actions.update_configs), rcs),
                get: () => get<RewardConfigs>(mapPath(items.configs), [])
            }
        })(),

        transaction: (item => {
            type TransactionItem = Models.RewardModel.RewardTransaction | null
            return {
                VX: () => VX(item),
                set: (transaction: TransactionItem) => set(mapPath(actions.update_transaction), transaction),
                get: () => get<TransactionItem>(item, null)
            }
        })(mapPath(items.transaction)),

        async clear() {
            await this.store.set(null)
            await this.configs.set([])
            await this.transaction.set(null)
        }
    }
})()

class PaymentVXService {

    private get PATH() {
        return "paymentModule"
    }

    private get ITEMS() {
        return { ...ITEMS.payment }
    }

    private get ACTIONS() {
        return { ...ACTIONS.payment }
    }

    private mapPath(key: string) {
        return `${this.PATH}/${key}`
    }

    // -------------------- selected invoices ------------------------

    VXSelectedInvoices() {
        return VX(this.mapPath(this.ITEMS.selected_invoices))
    }

    setSelectedInvoices(list: Models.InvoiceModel.Invoice[]) {

        // const allvalues: any = [];
        // list.map(x => {
        //     x.paymentDetail.paymentItems.map(x => {
        //         allvalues.push({
        //             price: x.price,
        //             vat: x.vat,
        //             tax: x.tax
        //         });
        //     })
        // })

        // console.log("allvalues --> ", allvalues)

        // list.map(x => {
        //     if (x.id.startsWith("15") && x.invoiceReference.startsWith("11") ||
        //         x.id.startsWith("15") && x.invoiceReference.startsWith("992") ||
        //         x.id.startsWith("213") ||
        //         x.id.startsWith("15") && x.invoiceReference.startsWith("231") ||
        //         x.id.startsWith("15") && x.invoiceReference.startsWith("233") ||
        //         x.id.startsWith("211") ||
        //         x.id.startsWith("15") && x.invoiceReference.startsWith("230") ||
        //         x.id.startsWith("15") && x.invoiceReference.startsWith("232") ||
        //         x.id.startsWith("212")) {
        //         x.paymentDetail.paymentItems.map(x => {
        //             x.price = -Math.abs(x.price)
        //             x.tax = -Math.abs(x.tax)
        //             x.vat = -Math.abs(x.vat)
        //         })
        //     }
        // }
        // )

        return set(this.mapPath(this.ACTIONS.update_selected_invoices), list)
    }

    getSelectedInvoices() {
        return get<Models.InvoiceModel.Invoice[]>(this.mapPath(this.ITEMS.selected_invoices), [])
    }

    // -------------------- invoices ------------------------

    VXInvoices() {
        return VX(this.mapPath(this.ITEMS.invoices))
    }

    setInvoices(list: Models.InvoiceModel.Invoice[]) {
        return set(this.mapPath(this.ACTIONS.update_invoices), list)
    }

    getInvoices() {
        return get<Models.InvoiceModel.Invoice[]>(this.mapPath(this.ITEMS.invoices), [])
    }

    // -------------------- invoice ------------------------

    VXInvoice() {
        return VX(this.mapPath(this.ITEMS.invoice))
    }

    setInvoice(invoice: Models.InvoiceModel.Invoice | null) {
        return set(this.mapPath(this.ACTIONS.update_invoice), invoice)
    }

    getInvoice() {
        return get<Models.InvoiceModel.Invoice | null>(this.mapPath(this.ITEMS.invoice), null)
    }

    // -------------------- invoice ------------------------

    VXBanks() {
        return VX(this.mapPath(this.ITEMS.banks))
    }

    setBanks(banks: Models.PaymentModel.Bank[]) {
        return set(this.mapPath(this.ACTIONS.update_banks), banks)
    }

    getBanks() {
        return get<Models.PaymentModel.Bank[]>(this.mapPath(this.ITEMS.banks), [])
    }

    // -------------------- selected payment method ------------------------

    VXPaymentMethod() {
        return VX(this.mapPath(this.ITEMS.payment_method))
    }

    setPaymentMethod(paymentMethod: Models.PaymentModel.PaymentMethod | null) {
        return set(this.mapPath(this.ACTIONS.update_selected_method), paymentMethod)
    }

    getPaymentMethod() {
        return get<Models.PaymentModel.PaymentMethod | null>(this.mapPath(this.ITEMS.payment_method), null)
    }

    // -------------------- request invoices form ------------------------

    VXReqInvoiceForm() {
        return VX(this.mapPath(this.ITEMS.req_invoice_form))
    }

    setReqInvoiceForm(f: Models.InvoiceModel.RequestForm | null) {
        return set(this.mapPath(this.ACTIONS.update_req_invoice_form), f)
    }

    getReqInvoiceForm() {
        return get<Models.InvoiceModel.RequestForm | null>(this.mapPath(this.ITEMS.req_invoice_form), null)
    }

    // -------------------- push nofi ------------------------

    VXPushNoti() {
        return VX(this.mapPath(this.ITEMS.push_noti))
    }

    setPushNoti(f = { phone: "", loading: false }) {
        return set(this.mapPath(this.ACTIONS.update_push_noti), f)
    }

    setPushNotiLoading(loading: boolean) {
        const noti = { ...this.getPushNoti(), loading }
        return set(this.mapPath(this.ACTIONS.update_push_noti), noti)
    }

    setPushNotiPhone(phone: string) {
        const noti = { ...this.getPushNoti(), phone }
        return set(this.mapPath(this.ACTIONS.update_push_noti), noti)
    }

    getPushNoti() {
        return get<{ phone: string; loading: boolean }>(this.mapPath(this.ITEMS.push_noti), { phone: "", loading: false })
    }

    // -------------------- Promptpay state ------------------------

    VXPromptpayState() {
        return VX(this.mapPath(this.ITEMS.promptpay_state))
    }

    setPromptpayState(ps: Models.PaymentModel.PromptpayState | null) {
        return set(this.mapPath(this.ACTIONS.update_promptpay_state), ps)
    }

    setPromptpayStatePrice(price: number) {
        const ps = new Models.PaymentModel.PromptpayState()
        ps.loading = this.getPromptpayState()?.loading === true
        ps.price = price
        return set(this.mapPath(this.ACTIONS.update_promptpay_state), ps)
    }

    setPromptpayStatePhone(phone: string) {
        const ps = new Models.PaymentModel.PromptpayState()
        ps.loading = this.getPromptpayState()?.loading === true
        ps.phone = phone
        return set(this.mapPath(this.ACTIONS.update_promptpay_state), ps)
    }

    setPromptpayStateLoading(loading: boolean) {
        const ps = new Models.PaymentModel.PromptpayState()
        ps.loading = loading === true
        ps.phone = this.getPromptpayState()?.phone || ""
        return set(this.mapPath(this.ACTIONS.update_promptpay_state), ps)
    }

    getPromptpayState() {
        return get<Models.PaymentModel.PromptpayState | null>(this.mapPath(this.ITEMS.promptpay_state), null)
    }

    // -------------------- request select receipt type ------------------------

    VXSelectReceiptType() {
        return VX(this.mapPath(this.ITEMS.select_receipt))
    }

    setReceiptType(f: Models.PaymentModel.SelectTypeReceipt | null) {
        return set(this.mapPath(this.ACTIONS.update_select_receipt_type), f)
    }

    getReceiptType() {
        return get<Models.PaymentModel.SelectTypeReceipt | null>(this.mapPath(this.ITEMS.select_receipt), null)
    }

    // ------------ clear state ------------
    clearStore() {
        this.setInvoices([])
        this.setInvoice(null)
        this.setPaymentMethod(null)
        this.setPromptpayState(null)
        this.setPushNoti()
        this.setReqInvoiceForm(null)
        this.setSelectedInvoices([])
        this.setReceiptType(null)
    }
}

class RootVXService {

    private get ITEMS() {
        return { ...ITEMS.root }
    }

    private get ACTIONS() {
        return { ...ACTIONS.root }
    }

    // -------------------- User ------------------------

    VXUser() {
        return VX(this.ITEMS.user)
    }

    setUser(user: Models.UserModel.User | null) {
        return set(this.ACTIONS.update_user, user)
    }

    getUser() {
        return get<Models.UserModel.User | null>(this.ITEMS.user, null)
    }

    // -------------------- Full screen loading ------------------------

    VXFullScreenLoading() {
        return VX(this.ITEMS.fs_loading)
    }

    setFullScreenLoading(loading: boolean) {
        return set(this.ACTIONS.update_fs_loading, loading)
    }

    getFullScreenLoading() {
        return get<boolean>(this.ITEMS.fs_loading, false)
    }

    // -------------------- App config ------------------------

    VXAppConfig() {
        return VX(this.ITEMS.app_config)
    }

    setAppConfig(config: Models.AppModel.AppConfig) {
        return set(this.ACTIONS.update_app_config, config)
    }

    getAppConfig() {
        return get(this.ITEMS.app_config, new Models.AppModel.AppConfig())
    }

    // -------------------- Branches ------------------------

    VXBranches() {
        return VX(this.ITEMS.branches)
    }

    setBranches(branches: Models.BranchModel.Branch[]) {
        return set(this.ACTIONS.update_branches, branches)
    }

    getBranches() {
        return get<Models.BranchModel.Branch[]>(this.ITEMS.branches, [])
    }

    // -------------------- Stores ------------------------

    VXStores() {
        return VX(this.ITEMS.stores)
    }

    setStores(stores: Models.StoreModel.Store[]) {
        return set(this.ACTIONS.update_stores, stores)
    }

    getStores() {
        return get<Models.StoreModel.Store[]>(this.ITEMS.stores, [])
    }

    // -------------------- Stores ------------------------

    VXNotifications() {
        return VX(this.ITEMS.notifications)
    }

    setNotifications(notifications: Models.PostModel.Notification[]) {
        return set(this.ACTIONS.update_notifications, notifications)
    }

    getNotifications() {
        return get<Models.PostModel.Notification[]>(this.ITEMS.notifications, [])
    }

    // -------------------- favorite ------------------------

    VXFavoriteItems() {
        return VX(this.ITEMS.favorite_items)
    }

    setFavoriteItems(favs: Models.PostModel.FavoritePost[]) {
        return set(this.ACTIONS.update_favorite_items, favs)
    }

    addOrUpdateFavoriteItem(fav: Models.PostModel.FavoritePost) {
        const favs = [...this.getFavoriteItems()]
        const idx = favs.findIndex(f => f.id === fav.id)
        if (idx > -1) {
            favs[idx] = fav
        } else {
            favs.push(fav)
        }
        return set(this.ACTIONS.update_favorite_items, favs)
    }

    deleteFavoriteItem(fav: Models.PostModel.FavoritePost) {
        const favs = [...this.getFavoriteItems()]
        const idx = favs.findIndex(f => f.id === fav.id)
        if (idx > -1) {
            favs.splice(idx, 1)
        }
        return set(this.ACTIONS.update_favorite_items, favs)
    }

    getFavoriteItems() {
        return get<Models.PostModel.FavoritePost[]>(this.ITEMS.favorite_items, [])
    }

    // ---------------------- maintainance -------------------------

    VXMaintainanceItem() {
        return VX(this.ITEMS.maintainance)
    }

    setMaintainanceItem(maintainance: Models.MaintainanceModel.Maintainance | null) {
        return set(this.ACTIONS.update_maintainance, maintainance)
    }

    getMaintainance() {
        return get<Models.MaintainanceModel.Maintainance | null>(this.ITEMS.maintainance, null)
    }

    // -------------------- The1 Member ------------------------

    VXThe1Member() {
        return VX(this.ITEMS.the1_member)
    }

    setThe1Member(member: Models.RewardModel.The1Member | null) {
        return set(this.ACTIONS.update_the1_member, member)
    }

    getThe1Member() {
        return get<Models.RewardModel.The1Member | null>(this.ITEMS.the1_member, null)
    }

    // ------------------  Coupon -----------------------------

    VXCoupon() {
        return VX(this.ITEMS.coupon)
    }

    setCoupon(coupon: Models.Coupon.Coupon | null) {
        return set(this.ACTIONS.update_coupon, coupon)
    }

    getCoupon() {
        return get<Models.Coupon.Coupon | null>(this.ITEMS.coupon, null)
    }
}

export const Payment = new PaymentVXService()
export const Root = new RootVXService()

export async function clearState() {
    return store.replaceState(emptyState.root())
}
