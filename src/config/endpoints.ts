import getEnv from '@/utils/getEnv'

const HOST = {
    // cpnserve: "https://cpnserveqas.centralpattana.co.th/",
    // cphqas: "http://18.138.41.107:8000/gw/payment/" /* "https://cphqas.centralpattana.co.th/" */,
    // cpnqas: "https://cpnserveqas.cpn.co.th/",
    // cpnservice: "http://localhost:8000/",
    // cpnproperty: "https://propertyd.cpn.co.th/api/",
    // the1partner: "https://api-qa.the1-partner.com/"
    cpnserve: getEnv('V_APP_CPN_SERVE_BASE'),
    cphqas: getEnv('V_APP_CPHQAS_BASE'),
    cpnqas: getEnv('V_APP_PERMISSION'),
    cpnservice: getEnv("V_APP_CPN_SERVICE"),
    cpnproperty: getEnv('V_APP_CPN_PROPERTY'),
    the1partner: getEnv('V_APP_THE1_PARTNER'),
}

const INVOICE_BASE = HOST.cpnserve + "api/ApplicationApi/invoice"
// const PAYMENT_BASE = HOST.cpnserve + "api/ApplicationApi/payment"
// const PAYMENT_GW_BASE = HOST.cphqas + "paygw/api/v1/"
const USER_BASE = HOST.cpnqas + "webservice/api"
const SERVICE_BASE_V1 = HOST.cpnservice + "api/v1"
// const PROPERTY = HOST.cpnproperty + "CPNServe"
const THE1_PARTNER_BASE = HOST.the1partner + "open-api"

export type RequestMethod = "GET" | "POST" | "DELETE" | "PATCH" | "PUT"

interface Endpoint {
    method: RequestMethod
    url: string
}

export const loginValidation: Endpoint = {
    method: "POST",
    url: USER_BASE + "/Getpermission"
}

export const getInvoice: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/invoice-service/invoice"
}

export const getBranchShop: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/branch-shop"
  
}

export const getPaymentHistory: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/invoice-service/payment-history"
}

export const makePayment: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/smart-invoice/payment/create-payment"
}

export const createPaymentGatewayOrder: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/payment"
}

export const getBillPaymentPDF: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/payment/bill-payment"
}

export const getContact: Endpoint = {
    method: "POST",
    url: USER_BASE + "/getcontact"
}

export const getRequestInvocieList: Endpoint = {
    method: "POST",
    // url: INVOICE_BASE + "/request-invoice-list"
    url: SERVICE_BASE_V1 + "/invoices/request-invoice-list"
}

export const getInvoicesPDF: Endpoint = {
    // url: INVOICE_BASE + "/request-invoice",
    url: SERVICE_BASE_V1 + "/invoices/request-invoice",
    method: "POST"
}

export const getPost: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/posts"
}

export const getPostGuest: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/guest/posts"
}

export const submitJoinEvent: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/accept-event"
}

export const getWebConfig: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/configurations/web"
}

export const getUserFavMenu: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/me/favorite-menus"
}

export const updateUserFavMenu: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/me/favorite-menus"
}

export const getBranchIds: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/branches"
}

export const getCategories: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/categories"
}

export const inquiryOrder: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/payment/inquiry"
}

export const registerOwner: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/credential"
}

export const registerEmployeeByOwner: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/employee-package/register"
}

export const retrieveRegisterInfo: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/employee-package/retrieve"
}

export const retrieveUserDetail: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/detail-by-token"
}

export const registerEmployee: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/credential"
}

export const resetAccountGetInfo: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/detail/email-phone"
}

export const submitSelectResetMethod: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/credential/forgot"
}

export const submitResetAccount: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/credential/reset"
}

export const getRequestReceiptList: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/smart-invoice/receipt/request-receipt-list"
}

export const requestReceiptToMail: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/smart-invoice/receipt/request-receipt"
}

export const requestInvoiceToMail: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/invoices/documents"
}

export const userLogin: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/login"
}

export const getUserInfo: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/me"
}

export const updateUserPhoneAndEmail: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/user/me"
}

export const getBranches: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/branches"
}

export const getBranchById = (id: string): Endpoint => ({
    method: "GET",
    url: SERVICE_BASE_V1 + "/branches/" + id
})

export const getNoti: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/me/notifications"
}

export const getGuestNoti: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/guest/notifications"
}

export const getNotiV2: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/me/notifications/only-for-you"
}

export const getGuestNotiV2: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/guest/notifications/only-for-you"
}

export const changeCredential: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/user/me/change-credential"
}

export const getHistoryLogin: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/me/members/login-history"
}

export const markAsReadNotifications: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/user/me/notifications"
}

export const RegisterInvoiceGet: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/get-invoice"
}

export const RegisterInvoiceCreate: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/invoice"
}

export const RegisterInvoiceUpdate: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/invoice"
}

export const RegisterInvoiceDelete: Endpoint = {
    method: "DELETE",
    url: SERVICE_BASE_V1 + "/invoice"
}

export const RegisterReceiptGet: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/get-receipt"
}

export const RegisterReceiptCreate: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/receipt"
}

export const RegisterReceiptUpdate: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/receipt"
}

export const RegisterReceiptDelete: Endpoint = {
    method: "DELETE",
    url: SERVICE_BASE_V1 + "/receipt"
}

export const createMaintainance: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/maintenances"
}

export const cancelMaintainance: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/maintenances/cancel"
}

export const rateSurvey: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/maintenances/rate-survey/:tenantId"
}

export const getStoreListByBP: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/maintenances"
}

export const createQA: Endpoint = {
    url: SERVICE_BASE_V1 + "/questions",
    method: "POST"
}

export const getQA = (id: string | number): Endpoint => ({
    method: "GET",
    url: SERVICE_BASE_V1 + "/questions/" + id
})

export const uploadImage: Endpoint = {
    url: SERVICE_BASE_V1 + "/upload/file",
    method: "POST"
}

export const getShopByBP: Endpoint = {
    url: SERVICE_BASE_V1 + "/shop-by-bp",
    method: "GET"
}

export const getActiveShopByBP: Endpoint = {
    url: SERVICE_BASE_V1 + "/active/shop-by-bp",
    method: "GET"
}

export const getActiveShopByBPFilter: Endpoint = {
    url: SERVICE_BASE_V1 + "/shop-by-bp/active/filter",
    method: "POST"
}

export const getBPEmployees: Endpoint = {
    url: SERVICE_BASE_V1 + "/employee-by-bp",
    method: "GET"
}

export const getEmployeeById = (empId: string): Endpoint => ({
    method: "GET",
    url: SERVICE_BASE_V1 + "/employee/" + empId
})

export const deleteEmployee = (empId: string): Endpoint => ({
    method: "DELETE",
    url: SERVICE_BASE_V1 + "/employee/" + empId
})

export const updateEmpRoleAndPermission: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/employee"
}

export const createEmpRoleAndPermission: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/employee"
}

export const getRentalInfoList: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/business-contracts"
}

export const getRentalInfoListFiltered: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/business-contracts/filter"
}

export const getRentalInfoDetail: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/business-contracts"
}

export const getQuotationDetail: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/business-contracts/cof"
}

export const submitRenewQuotation: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/business-contracts/cof/:cof_number/submit-renew"
}

export const submitQuotationDropLead: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/business-contracts/cof/:cof_number/drop-lead"
}

export const downloadCofFile: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/business-contracts/cof-file/download"
}

export const submitRefund: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/business-contracts/:refund_no/refund"
}

export const getForceClosePagePermissions: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/force-close-page/menu/permission"
}

export const addUserFavoritePost: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/favorite-post"
}

export const getUserFavoritePost: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/favorite-post/:post_id"
}

export const getUserFavoritePostByGroup: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/favorite-post/group"
}

export const deleteUserFavoritePost: Endpoint = {
    method: "DELETE",
    url: SERVICE_BASE_V1 + "/user/favorite-post/:post_id"
}

export const createContactAnonymous: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/questions/tenant"
}

export const checkUserConsent: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/consentStatus/check"
}

export const getConsent: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/consent/get"
}

export const updateUserConsent: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/consentStatus/update"
}

export const acceptTnC: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/user/me/accept-tc"
}

export const getShopSaleSalesChannel: Endpoint = {
    method: "GET",
    url: HOST.cpnservice + "api/v1/shopsales/master"
}

export const getShopSaleCreditChannel: Endpoint = {
    method: "GET",
    url: HOST.cpnservice + "api/v1/shopsales/show-hide-function-config"
}

export const uploadShopSaleImage: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/shopsales/upload"
}

export const createSale: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/shopsales/create"
}

export const updateSale: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/shopsales/update"
}

export const getShopSaleHistoryRange: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/shopsales/search"
}

export const getShopSaleImage = (img: string): Endpoint => ({
    method: "GET",
    url: HOST.cpnservice + "api/v1/shopsales/view/" + img
})

export const registerOnline: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/register-online/owner"
}

export const uploadRegisterImage: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/register-online/owner/upload/file"
}

export const getMaintainanceByNotiRefId = (refId: string | number): Endpoint => ({
    method: "GET",
    url: SERVICE_BASE_V1 + "/maintenances/" + refId
})

export const updateUserProfile: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/user/me"
}

export const searchThe1Member: Endpoint = {
    method: "POST",
    url: THE1_PARTNER_BASE + "/v2/member/search"
}

export const createTransactionEarnRedeem: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/rewards/create-transaction-earn-redeem"
}

export const verifyTransactionEarnRedeem: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/rewards/verify-transaction-earn-redeem"
}

export const getTransactionHistory: Endpoint = {
    method: "POST",
    url: THE1_PARTNER_BASE + "/v1/transaction/history"
}

export const getRewardConfigs: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/rewards/customer-configs"
}

export const approveTransectionVoid: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/rewards/approve-request-void"
}

export const rejectTransectionVoid: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/rewards/reject-request-void"
}

export const getPendingApproveVoidHistory: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/rewards/request-void-transaction-earn-redeem"
}

export const getApproveVoidedHistory: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/rewards/voided-transaction-earn-redeem"
}

export const getRewardTransactions: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/rewards/get-transaction-earn-redeem"
}

export const getRewardTransactionById = (id: string): Endpoint => ({
    method: "GET",
    url: SERVICE_BASE_V1 + "/rewards/get-transaction-earn-redeem/" + id
})

export const requestVoidTransaction: Endpoint = {
    method: "PUT",
    url: SERVICE_BASE_V1 + "/rewards/request-void"
}

export const transactionHistoryReport: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/rewards/history-report"
}

export const getBPByTenantId: Endpoint = {
    method: "GET",
    url: HOST.cpnservice + "api/CPNServe/Maintenance"
}

export const checkPermission: Endpoint = {
    method: "GET",
    url: HOST.cpnservice + "api/v1/ordering/myContracts"
}

export const downloadatlastmonth: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/ordering/get-month-end-report"
}

export const getVendorReport: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/ordering/get-vendor-report"
}

export const getBranchesAllName: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/branches/list"
}

export const checkIsvalideToken: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/credential/checkisvalidetoken"
}
// coupon endponts

export const checkCouponIsValide: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/coupon/isvalid"
}
export const checkCouponIsValidebyQR: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/guest/coupon/isValid"
}
export const markCouponIsUsed: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/coupon/uses"
}
export const markCouponIsUsedbyQR: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/guest/coupon/uses"
}
export const updateCouponIsUsed: Endpoint = {
    method: "PUT",
    url: HOST.cpnservice + "api/v1/coupon/uses"
}
export const updateCouponIsUsedbyQR: Endpoint = {
    method: "PUT",
    url: HOST.cpnservice + "api/v1/guest/coupon/uses"
}
export const getcouponHistory: Endpoint = {
    method: "GET",
    url: HOST.cpnservice + "api/v1/coupon/history"
}
export const getcouponHistorybyQR: Endpoint = {
    method: "GET",
    url: HOST.cpnservice + "api/v1/guest/coupon/history"
}
export const exportCouponHistory: Endpoint = {
    method: "GET",
    url: HOST.cpnservice + "api/v1/coupon/history-export"
}
export const exportCouponHistorybyQR: Endpoint = {
    method: "GET",
    url: HOST.cpnservice + "api/v1/guest/coupon/history-export"
}
export const updatePostIsReaded: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/posts/articles/update"
}
export const getPostDescUnReaded: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/posts/home"
}
export const createPersonalProfile: Endpoint = {
    method: "POST",
    url: SERVICE_BASE_V1 + "/user/create-personal-profile"
}
export const getPersonalProfile: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/get-personal-profile"
}
export const getShopsByUser: Endpoint = {
    method: "GET",
    url: SERVICE_BASE_V1 + "/user/shops"
}
export const getSettingExpireDate: Endpoint = {
    method: "GET",
    url: HOST.cpnservice + "api/v1/setting/expire"
}
export const updatePasswordCount: Endpoint = {
    method: "PUT",
    url: HOST.cpnservice + "api/v1/user/password"
}
export const genarateResetPassword: Endpoint = {
    method: "POST",
    url: HOST.cpnservice + "api/v1/user/password/reset"
}
