import Vue from "vue"
import Vuex, { ActionTree, GetterTree, MutationTree } from "vuex"
import * as ACTIONS from "./actions"
import * as ITEMS from "./items"

import * as Models from "@/models"
import { createDecorator } from "vue-class-component"
import { ModifierFlags } from "typescript"

Vue.use(Vuex)

export {
	ACTIONS,
	ITEMS
}

export const emptyState = {
	root: () => new RootState(),
	payment: () => new PaymentState()
}

class RootState {
	user: Models.UserModel.User|null = null
	fullScreenLoading = false
	appConfig = new Models.AppModel.AppConfig()
	branches: Models.BranchModel.Branch[] = []
	stores: Models.StoreModel.Store[] = []
	notifications: Models.PostModel.Notification[] = []
	favoriteItems: Models.PostModel.FavoritePost[] = []
	maintainance: Models.MaintainanceModel.Maintainance| null = null
	the1Member: Models.RewardModel.The1Member| null = null
	coupon: Models.Coupon.Coupon|null = null
}

const rootActions: ActionTree<RootState, RootState> = {
	[ACTIONS.root.update_user]: ({ commit }, user: Models.UserModel.User|null) => commit(ACTIONS.root.update_user, user),
	[ACTIONS.root.update_fs_loading]: ({ commit }, loading) => commit(ACTIONS.root.update_fs_loading, loading === true),
	[ACTIONS.root.update_app_config]: ({ commit }, config) => commit(ACTIONS.root.update_app_config, config),
	[ACTIONS.root.update_branches]: ({ commit }, branches) => commit(ACTIONS.root.update_branches, branches),
	[ACTIONS.root.update_stores]: ({ commit }, stores) => commit(ACTIONS.root.update_stores, stores),
	[ACTIONS.root.update_notifications]: ({ commit }, notis) => commit(ACTIONS.root.update_notifications, notis),
	[ACTIONS.root.update_favorite_items]: ({ commit }, favs) => commit(ACTIONS.root.update_favorite_items, favs),
	[ACTIONS.root.update_maintainance]: ({ commit }, maintainance: Models.MaintainanceModel.Maintainance|null) => commit(ACTIONS.root.update_maintainance, maintainance),
	[ACTIONS.root.update_the1_member]: ({ commit }, member: Models.RewardModel.The1Member|null) => commit(ACTIONS.root.update_the1_member, member),
	[ACTIONS.root.update_coupon]: ({ commit }, coupon: Models.Coupon.Coupon|null) => commit(ACTIONS.root.update_coupon, coupon),
}

const rootMutations: MutationTree<RootState> = {
	[ACTIONS.root.update_user]: (state, user: Models.UserModel.User|null) => state.user = user,
	[ACTIONS.root.update_fs_loading]: (state, loading) => state.fullScreenLoading = loading === true,
	[ACTIONS.root.update_app_config]: (state, config) => state.appConfig = config,
	[ACTIONS.root.update_branches]: (state, branches) => state.branches = branches,
	[ACTIONS.root.update_stores]: (state, stores) => state.stores = stores,
	[ACTIONS.root.update_notifications]: (state, notis) => state.notifications = notis,
	[ACTIONS.root.update_favorite_items]: (state, favs) => state.favoriteItems = favs,
	[ACTIONS.root.update_maintainance]: (state, maintainance: Models.MaintainanceModel.Maintainance|null) => state.maintainance = maintainance,
	[ACTIONS.root.update_the1_member]: (state, member: Models.RewardModel.The1Member|null) => state.the1Member = member,
	[ACTIONS.root.update_coupon]: (state, coupon: Models.Coupon.Coupon|null) => state.coupon = coupon,
}

const rootGetters: GetterTree<RootState, RootState> = {
	[ITEMS.root.user]: state => state.user,
	[ITEMS.root.app_config]: state => state.appConfig,
	[ITEMS.root.fs_loading]: state => state.fullScreenLoading === true,
	[ITEMS.root.branches]: state => state.branches,
	[ITEMS.root.stores]: state => state.stores,
	[ITEMS.root.notifications]: state => state.notifications,
	[ITEMS.root.favorite_items]: state => state.favoriteItems,
	[ITEMS.root.maintainance]: state => state.maintainance,
	[ITEMS.root.the1_member]: state => state.the1Member,
	[ITEMS.root.coupon]: state => state.coupon
}

// ------------- payment -------------

class PaymentState {
	selectedInvoices: Models.InvoiceModel.Invoice[] = []
	invoices: Models.InvoiceModel.Invoice[] = []
	invoice: Models.InvoiceModel.Invoice|null = null
	banks: Models.PaymentModel.Bank[] = []
	paymentMethod: Models.PaymentModel.PaymentMethod|null = null
	requestInvoiceForm: Models.InvoiceModel.RequestForm|null = null
	pushNoti = {
		phone: "",
		loading: false
	}
	promptpayState: Models.PaymentModel.PromptpayState|null = null
	selecttypereceipt: Models.PaymentModel.SelectTypeReceipt|null = null
}

const paymentActions: ActionTree<PaymentState, RootState> = {
	[ACTIONS.payment.update_selected_invoices]: ({ commit }, invoiceList) => commit(ACTIONS.payment.update_selected_invoices, invoiceList),
	[ACTIONS.payment.update_invoices]: ({ commit }, invoiceList) => commit(ACTIONS.payment.update_invoices, invoiceList),
	[ACTIONS.payment.update_invoice]: ({ commit }, invoice) => commit(ACTIONS.payment.update_invoice, invoice),
	[ACTIONS.payment.update_banks]: ({ commit }, banks) => commit(ACTIONS.payment.update_banks, banks),
	[ACTIONS.payment.update_selected_method]: ({ commit }, paymentMethod) => commit(ACTIONS.payment.update_selected_method, paymentMethod),
	[ACTIONS.payment.update_req_invoice_form]: ({ commit }, f) => commit(ACTIONS.payment.update_req_invoice_form, f),
	[ACTIONS.payment.update_push_noti]: ({ commit }, pn) => commit(ACTIONS.payment.update_push_noti, pn),
	[ACTIONS.payment.update_promptpay_state]: ({ commit }, ps) => commit(ACTIONS.payment.update_promptpay_state, ps),
	[ACTIONS.payment.update_select_receipt_type]: ({ commit }, sr) => commit(ACTIONS.payment.update_select_receipt_type, sr),
}

const paymentMutations: MutationTree<PaymentState> = {
	[ACTIONS.payment.update_selected_invoices]: (state, invoiceList) => state.selectedInvoices = invoiceList,
	[ACTIONS.payment.update_invoices]: (state, invoiceList) => state.invoices = invoiceList,
	[ACTIONS.payment.update_invoice]: (state, inv) => state.invoice = inv,
	[ACTIONS.payment.update_banks]: (state, banks) => state.banks = banks,
	[ACTIONS.payment.update_selected_method]: (state, paymentMethod) => state.paymentMethod = paymentMethod,
	[ACTIONS.payment.update_req_invoice_form]: (state, f) => state.requestInvoiceForm = f,
	[ACTIONS.payment.update_push_noti]: (state, p) => state.pushNoti = p,
	[ACTIONS.payment.update_promptpay_state]: (state, ps) => state.promptpayState = ps,
	[ACTIONS.payment.update_select_receipt_type]: (state, receipttype) => state.selecttypereceipt = receipttype
}

const paymentGetters: GetterTree<PaymentState, RootState> = {
	[ITEMS.payment.selected_invoices]: state => state.selectedInvoices,
	[ITEMS.payment.invoices]: state => state.invoices,
	[ITEMS.payment.invoice]: state => state.invoice,
	[ITEMS.payment.banks]: state => state.banks,
	[ITEMS.payment.payment_method]: state => state.paymentMethod,
	[ITEMS.payment.req_invoice_form]: state => state.requestInvoiceForm,
	[ITEMS.payment.push_noti_loading]: state => state.pushNoti.loading,
	[ITEMS.payment.push_noti_phone]: state => state.pushNoti.phone,
	[ITEMS.payment.push_noti]: state => state.pushNoti,
	[ITEMS.payment.promptpay_state]: state => state.promptpayState,
	[ITEMS.payment.select_receipt]: state => state.selecttypereceipt,
}

// ------------- reward -------------

class CustomerRewardState {
	store: Models.StoreModel.Store|null = null
	configs: Models.RewardModel.RewardConfig[] = []
	transaction: Models.RewardModel.RewardTransaction|null = null
}

const customerRewardActions: ActionTree<CustomerRewardState, RootState> = {
	[ACTIONS.customer_reward.update_store]: ({ commit }, s) => commit(ACTIONS.customer_reward.update_store, s),
	[ACTIONS.customer_reward.update_configs]: ({ commit }, rcs) => commit(ACTIONS.customer_reward.update_configs, rcs),
	[ACTIONS.customer_reward.update_transaction]: ({ commit }, transaction) => commit(ACTIONS.customer_reward.update_transaction, transaction)
}

const customerRewardMutations: MutationTree<CustomerRewardState> = {
	[ACTIONS.customer_reward.update_store]: (state, s) => state.store = s,
	[ACTIONS.customer_reward.update_configs]: (state, rcs) => state.configs = rcs,
	[ACTIONS.customer_reward.update_transaction]: (state, transaction) => state.transaction = transaction
}

const customerRewardGetters: GetterTree<CustomerRewardState, RootState> = {
	[ITEMS.customer_reward.store]: state => state.store,
	[ITEMS.customer_reward.configs]: state => state.configs,
	[ITEMS.customer_reward.transaction]: state => state.transaction
}

export const State = {
	RootState,
	PaymentState,
	CustomerRewardState
}

export default new Vuex.Store({
	state: new RootState(),
	mutations: rootMutations,
	actions: rootActions,
	getters: rootGetters,
	modules: {
		paymentModule: {
			namespaced: true,
			state: new PaymentState(),
			actions: paymentActions,
			mutations: paymentMutations,
			getters: paymentGetters
		},
		customerRewardModule: {
			namespaced: true,
			state: new CustomerRewardState(),
			actions: customerRewardActions,
			mutations: customerRewardMutations,
			getters: customerRewardGetters
		}
	}
})

export const VX = (type: string) => createDecorator((options, key) => {
	options.computed = !options.computed ? {} : options.computed
	options.computed[key] = function () {
		// @ts-ignore
		return this.$store.getters[type]
	}
})
