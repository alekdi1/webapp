import Vue from "vue"
import VueRouter, { RouteConfig } from "vue-router"
import * as Pages from "@/pages"
import { AuthService, VuexServices } from "./services"

Vue.use(VueRouter)

export const ROUTER_NAMES = {
	dashboard_home_page: "dashboard_home_page",
	dashboard_manage_employees: "dashboard_manage_employees",
	dashboard_my_qr_code: "dashboard_my_qr_code",
	dashboard_payment: "dashboard_payment",
	dashboard_payment_history: "dashboard_payment_history",
	dashboard_request_invoice_and_receipt: "dashboard_request_invoice_and_receipt",
	dashboard_shopping_center_list: "dashboard_shopping_center_list",
	dashboard_shopping_center_info: "dashboard_shopping_center_info",
	dashboard_business_insights: "dashboard_business_insights",
	dashboard_business_insights_detail: "dashboard_business_insights_detail",
	dashboard_news_and_activities: "dashboard_news_and_activities",
	dashboard_news_and_activities_detail: "dashboard_news_and_activities_detail",
	dashboard_annoucement: "dashboard_annoucement",
	dashboard_annoucement_detail: "dashboard_annoucement_detail",
	dashboard_promotion: "dashboard_promotion",
	dashboard_promotion_detail: "dashboard_promotion_detail",
	dashboard_shopping_center_map: "dashboard_shopping_center_map",
	dashboard_edit_profile: "dashboard_edit_profile",
	dashboard_change_pwd: "dashboard_change_pwd",
	dashboard_change_username: "dashboard_change_username",
	dashboard_change_username_pwd: "dashboard_change_username_pwd",
	dashboard_satisfaction_questionnaire: "dashboard_satisfaction_questionnaire",
	dashboard_how_to_use_cpn_app: "dashboard_how_to_use_cpn_app",
	dashboard_faq: "dashboard_faq",
	dashboard_contact_us_root: "dashboard_contact_us_root",
	dashboard_contact_us_select_branch: "dashboard_contact_us_select_branch",
	dashboard_contact_us_form: "dashboard_contact_us_form",
	dashboard_tnc: "dashboard_tnc",
	dashboard_pvp: "dashboard_pvp",
	dashboard_login_history: "dashboard_login_history",
	dashboard_favorite: "favorite",
	dashboard_coupon_history: "dashboard_coupon_history",


	login: "login",
	forgot_password: "forgot_password",
	forgot_username: "forgot_username",
	auth_reset_password: "auth_reset_password",
	auth_reset_username: "auth_reset_username",
	forgot_pwd_select_recover_method: "forgot_pwd_select_recover_method",

	payment_invoice_list: "payment_invoice_list",
	payment_confirm_payment: "payment_confirm_payment",
	payment_select_payment_method: "payment_select_payment_method",
	payment_result: "payment_result",
	payment_instruction: "payment_instruction",
	payment_unsuccess: "payment_unsuccess",
	payment_push_noti: "payment_push_noti",
	payment_promptpay: "payment_promptpay",

	request_invoice_and_receipt_store_list: "request_invoice_and_receipt_store_list",
	request_form: "request_form",
	request_summary: "request_summary",
	request_result: "request_result",

	manage_emp_list: "manage_emp_list",
	manage_emp_detail: "manage_emp_detail",
	manage_emp_form_add: "manage_emp_form_add",
	manage_emp_form_edit: "manage_emp_form_edit",

	contact_answer_question_detail: "contact_answer_question_detail",

	reg_e_invoice_receipt_menu: "reg_e_invoice_receipt_menu",
	reg_e_invoice_receipt_detail: "reg_e_invoice_receipt_detail",

	dashboard_notification: "dashboard_notification",

	maintainance: "maintainance",
	maintainance_shop_list: "maintainance_shop_list",
	maintainance_status_list: "maintainance_status_list",
	maintainance_repair_form: "maintainance_repair_form",
	maintainance_form_success: "maintainance_form_success",
	maintainance_survey: "maintainance_survey",
	maintainance_survey_success: "maintainance_survey_success",

	coupon_history_shop_list:"coupon_history_shop_list",
	coupon_history_coupon_list_by_shop:"coupon_history_coupon_list_by_shop",

	rental_info_list: "rental_info_list",
	rental_expired_list: "rental_expired_list",
	rental_detail: "rental_detail",
	rental_expired_detail: "rental_expired_detail",
	rental_quotation: "rental_quotation",
	rental_renew_success: "rental_renew_success",
	rental_refund_detail: "rental_refund_detail",
	rental_refund_success: "rental_refund_success",

	shop_sale_select_branch: "shop_sale_select_branch",
	shop_sale_main_select_option: "shop_sale_main_select_option",
	shop_sale_sales_form: "shop_sale_sales_form",
	shop_sale_sales_form_edit: "shop_sale_sales_form_edit",
	shop_sale_history_list: "shop_sale_history_list",
	shop_sale_history_detail: "shop_sale_history_detail",
	shop_sale_create_success: "shop_sale_create_success",

	watch_sale: "watch_sale",
	watch_sale_select_branch: "watch_sale_select_branch",
	watch_sale_main_select_option: "watch_sale_main_select_option",
	watch_sale_at_month: "watch_sale_at_month",
	// watch_sale_sales_form: "watch_sale_sales_form",
	watch_sale_sales_form_edit: "watch_sale_sales_form_edit",
	watch_sale_history_list: "watch_sale_history_list",

	rewards_shop_list: "rewards_shop_list",
	rewards_main: "rewards_main",
	rewards_search_the1_member: "rewards_search_the1_member",
	rewards_earn_redeem_form: "rewards_earn_redeem_form",
	rewards_redeem_otp: "rewards_redeem_otp",
	rewards_earn_redeem_error: "rewards_earn_redeem_error",
	rewards_earn_redeem_success: "rewards_earn_redeem_success",
	rewards_transaction_history: "rewards_transaction_history",
	rewards_transaction_download_history: "rewards_transaction_download_history",
	rewards_transaction_download_success: "rewards_transaction_download_success",
	rewards_transaction_cancellation_form: "rewards_transaction_cancellation_form",
	rewards_approve_void: "rewards_approve_void",
	rewards_approve_void_success: "rewards_approve_void_success",
	rewards_dashboard: "rewards_dashboard",

	// public
	online_register: "online_register",
	success_register: "success_register",
	owner_register: "owner_register",
	emp_re_pass: "emp_re_pass",
	contact_center_anonymous: "contact_center_anonymous",
	public_tnc: "public_tnc",
	redirect_to_app: "redirect_to_app",
	redirect: "redirect",

	
	//coupon
	coupon: "coupon",
	coupon_branch: "coupon_branch",
	coupon_code: "coupon_code",
	coupon_detail: "coupon_detail",
	coupon_confirm: "coupon_confirm",
	coupon_success: "coupon_success",
	coupon_wrong: "coupon_wrong",
}

const couponPages = [
	ROUTER_NAMES.coupon,
	ROUTER_NAMES.coupon_branch,
	ROUTER_NAMES.coupon_code,
	ROUTER_NAMES.coupon_detail,
	ROUTER_NAMES.coupon_confirm,
	ROUTER_NAMES.coupon_success,
	ROUTER_NAMES.coupon_wrong,
]
const couponhistoryPages = [
	ROUTER_NAMES.coupon_history_coupon_list_by_shop,
	ROUTER_NAMES.coupon_history_shop_list,
]

const plblicPages = [
	ROUTER_NAMES.login,
	ROUTER_NAMES.forgot_password,
	ROUTER_NAMES.forgot_username,
	ROUTER_NAMES.auth_reset_username,
	ROUTER_NAMES.auth_reset_password,
	ROUTER_NAMES.owner_register,
	ROUTER_NAMES.online_register,
	ROUTER_NAMES.success_register,
	ROUTER_NAMES.emp_re_pass,
	ROUTER_NAMES.redirect_to_app,
]

const maintainancesPages = [
	ROUTER_NAMES.dashboard_home_page,
	ROUTER_NAMES.maintainance_shop_list,
	ROUTER_NAMES.maintainance_status_list,
	ROUTER_NAMES.maintainance_form_success,
	ROUTER_NAMES.maintainance_survey,
	ROUTER_NAMES.maintainance_survey_success,
	ROUTER_NAMES.dashboard_shopping_center_info,
	ROUTER_NAMES.dashboard_shopping_center_list,
	ROUTER_NAMES.dashboard_annoucement,
	ROUTER_NAMES.dashboard_annoucement_detail,
	ROUTER_NAMES.dashboard_business_insights,
	ROUTER_NAMES.dashboard_business_insights_detail,
	ROUTER_NAMES.dashboard_news_and_activities,
	ROUTER_NAMES.dashboard_news_and_activities_detail,
	ROUTER_NAMES.dashboard_promotion,
	ROUTER_NAMES.dashboard_promotion_detail,
	ROUTER_NAMES.dashboard_shopping_center_map
]

const routes: RouteConfig[] = [
	{
		path: "/login",
		name: ROUTER_NAMES.login,
		component: Pages.AuthPages.Login
	},
	{
		path: "/contact-center",
		name: ROUTER_NAMES.contact_center_anonymous,
		component: Pages.PublicPages.ContactCenterAnonymous
	},
	{
		path: "/forgot/password",
		name: ROUTER_NAMES.forgot_password,
		component: Pages.AuthPages.ForgotPasswordUsername
	},
	{
		path: "/forgot/username",
		name: ROUTER_NAMES.forgot_username,
		component: Pages.AuthPages.ForgotPasswordUsername
	},
	{
		path: "/reset/username",
		name: ROUTER_NAMES.auth_reset_username,
		component: Pages.AuthPages.ResetUsername
	},
	{
		path: "/reset/password",
		name: ROUTER_NAMES.auth_reset_password,
		component: Pages.AuthPages.ResetPassword
	},
	{
		path: "/register",
		name: ROUTER_NAMES.online_register,
		component: Pages.PublicPages.OnlineRegister
	},
	{
		path: "/register/success",
		name: ROUTER_NAMES.success_register,
		component: Pages.PublicPages.SuccessRegister
	},
	{
		path: "/owner-register",
		name: ROUTER_NAMES.owner_register,
		component: Pages.PublicPages.OwnerRegister
	},
	{
		path: "/employee/password",
		name: ROUTER_NAMES.emp_re_pass,
		component: Pages.PublicPages.EmployeeRePassword
	},
	{
		path: "/term-and-condition",
		component: Pages.PublicPages.TermAndCondition,
		name: ROUTER_NAMES.public_tnc
	},
	{
		path: "/redirect-to-app",
		component: Pages.PublicPages.RedirectToAppPage,
		name: ROUTER_NAMES.redirect_to_app
	},
	{
		path: "/navigate/:redirect?",
		component: Pages.PublicPages.Redirect,
		name: ROUTER_NAMES.redirect
	},
	{
		path: "/",
		component: Pages.DashboardRoot,
		beforeEnter(to, from, next) {
			const vxUser = VuexServices.Root.getUser()
			if (vxUser) {
				if (vxUser.isQRUser) {
					if (maintainancesPages.includes(to.name || "")) {
						return next()
					}
					if (couponPages.includes(to.name || "")) {
						return next()
					}
					if (couponhistoryPages.includes(to.name || "")) {
						return next()
					}
					return next({ name: ROUTER_NAMES.login })
				}
			}
			if (to.query.role === "QR") {
				if (maintainancesPages.includes(to.name || "")) {
					return next()
				}
				if (couponPages.includes(to.name || "")) {
					return next()
				}
				if (couponhistoryPages.includes(to.name || "")) {
					return next()
				}
				return next({ name: ROUTER_NAMES.login })
			}
			const user = AuthService.getLocalAuthUser()
			const isPublic = plblicPages.some(r => r === to.name)
			if (!user && !isPublic) {
				return next({ name: ROUTER_NAMES.login })
			}
			next()
		},
		children: [
			{
				path: "",
				name: ROUTER_NAMES.dashboard_home_page,
				components: {
					default: Pages.DashboardPages.Homepage,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "manage/maintenance",
				// name: ROUTER_NAMES.maintainance,
				components: {
					default: Pages.DashboardPages.Maintainance,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "",
						name: ROUTER_NAMES.maintainance_shop_list,
						component: Pages.DashboardPages.MaintainanceShopList
					},
					{
						path: "status",
						name: ROUTER_NAMES.maintainance_status_list,
						component: Pages.DashboardPages.MaintainanceStatusList
					},
					{
						path: "form",
						name: ROUTER_NAMES.maintainance_repair_form,
						component: Pages.DashboardPages.MaintainanceRepairForm
					},
					{
						path: "form/success",
						name: ROUTER_NAMES.maintainance_form_success,
						component: Pages.DashboardPages.MaintainanceFormSuccess
					}

				]
			},
			{
				path: "manage/survey",
				name: ROUTER_NAMES.maintainance_survey,
				components: {
					default: Pages.DashboardPages.MaintainanceSurvey,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "manage/survey/success",
				name: ROUTER_NAMES.maintainance_survey_success,
				components: {
					default: Pages.DashboardPages.MaintainanceSurveySuccess,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "manage/rental",
				components: {
					default: Pages.DashboardPages.Rental,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "list",
						name: ROUTER_NAMES.rental_info_list,
						component: Pages.DashboardPages.RentalInfoList
					},
					{
						path: "expired",
						name: ROUTER_NAMES.rental_expired_list,
						component: Pages.DashboardPages.RentalExpireList
					},
					{
						path: "detail",
						name: ROUTER_NAMES.rental_detail,
						component: Pages.DashboardPages.RentalDetail
					},
					{
						path: "detail/expired",
						name: ROUTER_NAMES.rental_expired_detail,
						component: Pages.DashboardPages.RentalExpiredDetail
					},
					{
						path: "detail/quotation",
						name: ROUTER_NAMES.rental_quotation,
						component: Pages.DashboardPages.RentalQuotation
					},
					{
						path: "renew/success",
						name: ROUTER_NAMES.rental_renew_success,
						component: Pages.DashboardPages.RentalRenewSuccess
					},
					{
						path: "refund/detail",
						name: ROUTER_NAMES.rental_refund_detail,
						component: Pages.DashboardPages.RentalRefundDetail
					},
					{
						path: "refund/success",
						name: ROUTER_NAMES.rental_refund_success,
						component: Pages.DashboardPages.RentalRefundSuccess
					},
					{
						path: "*",
						redirect: {
							name: ROUTER_NAMES.rental_info_list
						}
					}
				]
			},
			{
				path: "manage/employees",
				components: {
					default: Pages.DashboardPages.ManageEmployees,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "",
						redirect: { name: ROUTER_NAMES.manage_emp_list }
					},
					{
						path: "list",
						name: ROUTER_NAMES.manage_emp_list,
						component: Pages.DashboardPages.ManageEmpList
					},
					{
						path: "add",
						name: ROUTER_NAMES.manage_emp_form_add,
						component: Pages.DashboardPages.ManageEmpForm
					},
					{
						path: "edit/:emp_id",
						name: ROUTER_NAMES.manage_emp_form_edit,
						component: Pages.DashboardPages.ManageEmpForm
					},
					{
						path: "detail/:emp_id",
						name: ROUTER_NAMES.manage_emp_detail,
						component: Pages.DashboardPages.ManageEmpDetail
					}
				]
			},
			{
				path: "manage/my_qr_code",
				name: ROUTER_NAMES.dashboard_my_qr_code,
				components: {
					default: Pages.DashboardPages.MyQRCode,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "rewards",
				components: {
					default: Pages.DashboardPages.Rewards,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "shop/list",
						name: ROUTER_NAMES.rewards_shop_list,
						component: Pages.DashboardPages.RewardsShopList
					},
					{
						path: "shop/:shop_id/menu",
						name: ROUTER_NAMES.rewards_main,
						component: Pages.DashboardPages.RewardsMain
					},
					{
						path: "shop/:shop_id/search_member",
						name: ROUTER_NAMES.rewards_search_the1_member,
						component: Pages.DashboardPages.RewardsSearchThe1Member
					},
					{
						path: "shop/:shop_id/earn_redeem/create",
						name: ROUTER_NAMES.rewards_earn_redeem_form,
						component: Pages.DashboardPages.RewardsEarnRedeemForm
					},
					{
						path: "shop/:shop_id/earn_redeem/otp",
						name: ROUTER_NAMES.rewards_redeem_otp,
						component: Pages.DashboardPages.RewardsRedeemOTP
					},
					{
						path: "shop/:shop_id/earn_redeem/error",
						name: ROUTER_NAMES.rewards_earn_redeem_error,
						component: Pages.DashboardPages.RewardsEarnRedeemError
					},
					{
						path: "shop/:shop_id/earn_redeem/success",
						name: ROUTER_NAMES.rewards_earn_redeem_success,
						component: Pages.DashboardPages.RewardsEarnRedeemSuccess
					},
					{
						path: "shop/:shop_id/history",
						name: ROUTER_NAMES.rewards_transaction_history,
						component: Pages.DashboardPages.RewardsTransactionHistory
					},
					{
						path: "shop/:shop_id/history/download",
						name: ROUTER_NAMES.rewards_transaction_download_history,
						component: Pages.DashboardPages.RewardsTransactionDownloadHistory
					},
					{
						path: "shop/:shop_id/history/download/success",
						name: ROUTER_NAMES.rewards_transaction_download_success,
						component: Pages.DashboardPages.RewardsTransactionDownloadSuccess
					},
					{
						path: "shop/:shop_id/transaction/:transaction_id/void/request",
						name: ROUTER_NAMES.rewards_transaction_cancellation_form,
						component: Pages.DashboardPages.RewardsTransactionCancellationForm
					},
					{
						path: "shop/:shop_id/approve_void",
						name: ROUTER_NAMES.rewards_approve_void,
						component: Pages.DashboardPages.RewardsApproveVoid
					},
					{
						path: "shop/:shop_id/approve_void/success",
						name: ROUTER_NAMES.rewards_approve_void_success,
						component: Pages.DashboardPages.RewardsApproveVoidSuccess
					},
					{
						path: "shop/:shop_id/dashboard",
						name: ROUTER_NAMES.rewards_dashboard,
						component: Pages.DashboardPages.RewardsDashboard
					},
					{
						path: "*",
						redirect: {
							name: ROUTER_NAMES.rewards_shop_list
						}
					}
				]
			},
			{
				path: "manage/shop_sale",
				components: {
					default: Pages.DashboardPages.ShopSale,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "branch",
						name: ROUTER_NAMES.shop_sale_select_branch,
						component: Pages.DashboardPages.ShopSaleSelectBranch
					},
					{
						path: "branch/:branch_code/menu",
						name: ROUTER_NAMES.shop_sale_main_select_option,
						component: Pages.DashboardPages.ShopSaleMainSelectOption
					},
					{
						path: "branch/:branch_code/sales/create",
						name: ROUTER_NAMES.shop_sale_sales_form,
						component: Pages.DashboardPages.ShopSaleSalesForm
					},
					{
						path: "branch/:branch_code/sales/edit/:sale_date",
						name: ROUTER_NAMES.shop_sale_sales_form_edit,
						component: Pages.DashboardPages.ShopSaleSalesForm
					},
					{
						path: "branch/:branch_code/sales/create/success",
						name: ROUTER_NAMES.shop_sale_create_success,
						component: Pages.DashboardPages.ShopSaleCreateSuccess
					},
					{
						path: "branch/:branch_code/history/list",
						name: ROUTER_NAMES.shop_sale_history_list,
						component: Pages.DashboardPages.ShopSaleHistoryListPage
					},
					{
						path: "branch/:branch_code/history/detail/:date",
						name: ROUTER_NAMES.shop_sale_history_detail,
						component: Pages.DashboardPages.ShopSaleHistoryDetailPage
					},
					{
						path: "*",
						redirect: {
							name: ROUTER_NAMES.shop_sale_select_branch
						}
					}
				]
			},
			{
				path: "manage/watch_sale",
				components: {
					default: Pages.DashboardPages.WatchSale,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "branch",
						name: ROUTER_NAMES.watch_sale,
						component: Pages.DashboardPages.WatchSaleSelectBranch
					},
					{
						path: "branch",
						name: ROUTER_NAMES.watch_sale_select_branch,
						component: Pages.DashboardPages.WatchSaleSelectBranch
					},
					{
						path: "branch/:branch_code/menu",
						name: ROUTER_NAMES.watch_sale_main_select_option,
						component: Pages.DashboardPages.WatchSaleMainSelectOption
					},
					{
						path: "branch/:branch_code/sales/month",
						name: ROUTER_NAMES.watch_sale_at_month,
						component: Pages.DashboardPages.WatchSaleAtMonth
					},
					{
						path: "branch/:branch_code/sales/history",
						name: ROUTER_NAMES.watch_sale_history_list,
						component: Pages.DashboardPages.WatchSaleHistoryList
					},
					{
						path: "*",
						redirect: {
							name: ROUTER_NAMES.watch_sale_select_branch
						}
					}
				]
			},
			{
				path: "coupon",
				name: ROUTER_NAMES.coupon,
				components: {
					default: Pages.DashboardPages.Coupon,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "",
						redirect: {
							name: ROUTER_NAMES.coupon_branch,
						}
					},
					{
						path: "branch",
						name: ROUTER_NAMES.coupon_branch,
						component: Pages.DashboardPages.CouponฺฺBranch
					},
					{
						path: "branch/:branch_code/coupon_code",
						name: ROUTER_NAMES.coupon_code,
						component: Pages.DashboardPages.CouponCode
					},
					{
						path: "branch/:branch_code/detail",
						name: ROUTER_NAMES.coupon_detail,
						component: Pages.DashboardPages.CouponDetail
					},
					{
						path: "branch/:branch_code/confirm",
						name: ROUTER_NAMES.coupon_confirm,
						component: Pages.DashboardPages.CouponConfirm
					},
					{
						path: "success",
						name: ROUTER_NAMES.coupon_success,
						component: Pages.DashboardPages.CouponSuccess
					},
					{
						path: "wrong",
						name: ROUTER_NAMES.coupon_wrong,
						component: Pages.DashboardPages.CouponWrong
					},
					{
						path: "*",
						redirect: {
							name: ROUTER_NAMES.coupon_branch
						}
					}
				]
			},
			{
				path: "payment/history",
				name: ROUTER_NAMES.dashboard_payment_history,
				components: {
					default: Pages.DashboardPages.PaymentHistory,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "payment/req_inv_n_recp",
				// name: ROUTER_NAMES.dashboard_request_invoice_and_receipt,
				components: {
					default: Pages.DashboardPages.RequestInvoiceAndReceipt,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "",
						name: ROUTER_NAMES.request_invoice_and_receipt_store_list,
						component: Pages.DashboardPages.RequestInvoiceAndReceiptStoreList
					},
					{
						path: ":store_id/form",
						name: ROUTER_NAMES.request_form,
						component: Pages.DashboardPages.RequestFormPage
					},
					{
						path: ":store_id/summary/:type",
						name: ROUTER_NAMES.request_summary,
						component: Pages.DashboardPages.RequestSummaryPage
					},
					{
						path: ":store_id/result/:type",
						name: ROUTER_NAMES.request_result,
						component: Pages.DashboardPages.RequestResultPage
					}
				]
			},
			{
				path: "payment",
				// name: ROUTER_NAMES.dashboard_payment,
				components: {
					default: Pages.DashboardPages.Payment,
					footer: Pages.DashboardPages.Footers.Payment
				},
				children: [
					{
						path: "invoice/list",
						name: ROUTER_NAMES.payment_invoice_list,
						component: Pages.DashboardPages.PaymentInvoiceList
					},
					{
						path: "confirm",
						name: ROUTER_NAMES.payment_confirm_payment,
						component: Pages.DashboardPages.ConfirmPayment
					},
					{
						path: "select_method",
						name: ROUTER_NAMES.payment_select_payment_method,
						component: Pages.DashboardPages.SelectPaymentMethod
					},
					{
						path: "result",
						name: ROUTER_NAMES.payment_result,
						component: Pages.DashboardPages.PaymentResult
					},
					{
						path: "instruction",
						name: ROUTER_NAMES.payment_instruction,
						component: Pages.DashboardPages.PaymentInstruction
					},
					{
						path: "unsuccess",
						name: ROUTER_NAMES.payment_unsuccess,
						component: Pages.DashboardPages.PaymentUnsuccess
					},
					{
						path: "push_noti",
						name: ROUTER_NAMES.payment_push_noti,
						component: Pages.DashboardPages.PaymentPushNoti
					},
					{
						path: "promptpay",
						name: ROUTER_NAMES.payment_promptpay,
						component: Pages.DashboardPages.PaymentPromptPay
					},
					{
						path: "*",
						redirect: {
							name: ROUTER_NAMES.payment_invoice_list
						}
					}
				]
			},
			{
				path: "news/shopping_center/list",
				name: ROUTER_NAMES.dashboard_shopping_center_list,
				components: {
					default: Pages.DashboardPages.ShoppingCenterInfoList,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/shopping_center/info/:branch_id",
				name: ROUTER_NAMES.dashboard_shopping_center_info,
				components: {
					default: Pages.DashboardPages.ShoppingCenterInfo,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/shopping_center/map",
				name: ROUTER_NAMES.dashboard_shopping_center_map,
				components: {
					default: Pages.DashboardPages.ShoppingCenterMap,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/bussiness_insights",
				name: ROUTER_NAMES.dashboard_business_insights,
				components: {
					default: Pages.DashboardPages.BussinessInsights,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/bussiness_insights_detail/:id",
				name: ROUTER_NAMES.dashboard_business_insights_detail,
				components: {
					default: Pages.DashboardPages.BusinessInsightDetail,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/news_and_activity",
				name: ROUTER_NAMES.dashboard_news_and_activities,
				components: {
					default: Pages.DashboardPages.NewsAndActivities,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/news_and_activity_detail/:id",
				name: ROUTER_NAMES.dashboard_news_and_activities_detail,
				components: {
					default: Pages.DashboardPages.NewsAndActivitiesDetail,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/annoucement",
				name: ROUTER_NAMES.dashboard_annoucement,
				components: {
					default: Pages.DashboardPages.Annoucement,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/annoucement_detail/:id",
				name: ROUTER_NAMES.dashboard_annoucement_detail,
				components: {
					default: Pages.DashboardPages.AnnoucementDetail,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/promotion",
				name: ROUTER_NAMES.dashboard_promotion,
				components: {
					default: Pages.DashboardPages.Promotion,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "news/promotion_detail/:id",
				name: ROUTER_NAMES.dashboard_promotion_detail,
				components: {
					default: Pages.DashboardPages.PromotionDetail,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "account/edit",
				name: ROUTER_NAMES.dashboard_edit_profile,
				components: {
					default: Pages.DashboardPages.EditProfile,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "account/change_credential/password",
				name: ROUTER_NAMES.dashboard_change_pwd,
				components: {
					default: Pages.DashboardPages.ChangePwd,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "account/change_credential/username",
				name: ROUTER_NAMES.dashboard_change_username,
				components: {
					default: Pages.DashboardPages.ChangeUsername,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "account/change_credential",
				name: ROUTER_NAMES.dashboard_change_username_pwd,
				components: {
					default: Pages.DashboardPages.ChangeUsernamePassword,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "account/e-registration",
				name: ROUTER_NAMES.reg_e_invoice_receipt_menu,
				components: {
					default: Pages.DashboardPages.RegistrationEInvoiceAndReceiptMenu,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "account/e-registration/:service",
				name: ROUTER_NAMES.reg_e_invoice_receipt_detail,
				components: {
					default: Pages.DashboardPages.RegistrationEInvoiceReceiptStoreDetail,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			// {
			// 	path: "satisfaction_questionnair",
			// 	name: ROUTER_NAMES.dashboard_satisfaction_questionnaire,
			// 	components: {
			// 		default: Pages.DashboardPages.SatisfactionQuestionnaire,
			// 		footer: Pages.DashboardPages.Footers.Default
			// 	}
			// },
			// {
			// 	path: "help/how_to",
			// 	name: ROUTER_NAMES.dashboard_how_to_use_cpn_app,
			// 	components: {
			// 		default: Pages.DashboardPages.HowToUseCpnApp,
			// 		footer: Pages.DashboardPages.Footers.Default
			// 	}
			// },
			{
				path: "help/faq",
				name: ROUTER_NAMES.dashboard_faq,
				components: {
					default: Pages.DashboardPages.Faq,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "help/contact",
				components: {
					default: Pages.DashboardPages.ContactUs,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "",
						redirect: {
							name: ROUTER_NAMES.dashboard_contact_us_select_branch
						}
					},
					{
						path: "branch",
						name: ROUTER_NAMES.dashboard_contact_us_select_branch,
						component: Pages.DashboardPages.ContactUsSelectBranch
					},
					{
						path: "branch/:branch_id/form",
						name: ROUTER_NAMES.dashboard_contact_us_form,
						component: Pages.DashboardPages.ContactUsBranchForm
					},
					{
						path: "detail/:id",
						name: ROUTER_NAMES.contact_answer_question_detail,
						component: Pages.DashboardPages.AnswerQuestionDetail
					}
				]
			},
			{
				path: "help/term-and-condition",
				name: ROUTER_NAMES.dashboard_tnc,
				components: {
					default: Pages.DashboardPages.Tcn,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "help/privacy-policy",
				name: ROUTER_NAMES.dashboard_pvp,
				components: {
					default: Pages.DashboardPages.PrivacyPolicy,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "history",
				name: ROUTER_NAMES.dashboard_login_history,
				components: {
					default: Pages.DashboardPages.LoginHistory,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "notification",
				name: ROUTER_NAMES.dashboard_notification,
				components: {
					default: Pages.DashboardPages.Notification,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "favorite",
				name: ROUTER_NAMES.dashboard_favorite,
				components: {
					default: Pages.DashboardPages.Favorite,
					footer: Pages.DashboardPages.Footers.Default
				}
			},
			{
				path: "manage/coupon/history",
				name: ROUTER_NAMES.coupon_history_shop_list,
				components: {
					default: Pages.DashboardPages.CouponHistory,
					footer: Pages.DashboardPages.Footers.Default
				},
				children: [
					{
						path: "",
						name: ROUTER_NAMES.coupon_history_shop_list,
						component: Pages.DashboardPages.CouponHistoryShopList
					},
					{
						path: "couponlistbyshop",
						name: ROUTER_NAMES.coupon_history_coupon_list_by_shop,
						component: Pages.DashboardPages.CouponHistoryCouponListByShop
					}
				]
			},
			{
				path: "*",
				redirect: {
					name: ROUTER_NAMES.dashboard_home_page
				}
			}
		]
	}
]

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes
})

export default router
