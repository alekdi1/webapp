import axios, { AxiosRequestConfig } from "axios"
import https from "https"
import { AuthService } from "@/services"
import { Endpoints } from "@/config"
import router, { ROUTER_NAMES } from "@/router"
import { DialogUtils } from "@/utils"

const ApiModule = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    timeout: 90 * 1000 // 60 sec
})

const refreshToken = async () => {
    // TODO: Refresh token here
    return ""
}

const downloadPDFUrls = [
    ""
    // Endpoints.getInvoicesPDF.url,
    // Endpoints.getBillPaymentPDF.url
]

// request setting
ApiModule.interceptors.request.use(
    // config
    (config: RequestConfig) => {
        const { headers, noAuth } = config

        if (noAuth === true) {
            delete headers["Authorization"]
        } else {
            if (!headers["Authorization"]) {
                // check auth user token
                const token = AuthService.getAuthUserToken()
                if (token) {
                    headers["Authorization"] = "Bearer " + token
                }
            }
        }
        // check and set default headers content-type
        headers["Content-Type"] = headers["Content-Type"] || headers["content-type"] || "application/json"
        
        config.headers = headers

        return config
    },
    // on error
    e => Promise.reject(e)
)

// response handle
ApiModule.interceptors.response.use(
    res => {
        // console.log(res, res.data)
        const headerContentType = String(res.headers["content-type"]).toLowerCase()
        if (res.config.url && downloadPDFUrls.includes(res.config.url)) {
            const { data } = res

            if (typeof data === "object" && headerContentType.includes("application/json")) {
                return Promise.reject(new Error("Cannot generate this invoice."))
            }

            if (headerContentType.includes("application/pdf")) {
                const file = new Blob([data], { type: "application/pdf" })
                res.data = file
            }
        }

        if (String(res.config.url).startsWith(Endpoints.getShopSaleImage("").url)) {
            if (headerContentType.startsWith("image/")) {
                // TODO: Catch object
            }
        }

        return res
    },
    async e => {
        if (e.response?.status === 401) {
            // TODO Check path and refresh token here
            if (e.response?.data.error_code !== "close_logout") {
                await refreshToken()
            }
        }

        return Promise.reject(e)
    }
)

// custom add config value
interface RequestConfig extends AxiosRequestConfig {
    noAuth?: boolean
    originalError?: boolean
}

interface RequestParams {
    url: string
    method: Endpoints.RequestMethod,
    headers?: {[x: string]: string}
    data?: any
    config?: RequestConfig
}

class ApiClient {
    public async request({ url, method, headers, data, config }: RequestParams) {

        try {
            const response = await (m => {
                const reqConfig = {
                    ...(config || {}),
                    headers
                }

                switch (method) {
                    case "DELETE": return m.delete(url, {...reqConfig, data })
                    case "POST": return m.post(url, data, reqConfig)
                    case "PATCH": return m.patch(url, data, reqConfig)
                    case "PUT": return m.put(url, data, reqConfig)
                    default: return m.get(url, {...reqConfig, data })
                }
            })(ApiModule)
            return response.data
        } catch (e) {
            if (e.response?.data.error_code === AuthService.ERROR_CODE.force_logout) {
                const errMsg = "Your session has been logged out by admin"
                // clear user
                await AuthService.logout()

                // show error dialog
                if (!url.endsWith("user/login")) {
                    await DialogUtils.showErrorDialog({
                        text: errMsg
                    })
                }
                
                // redirect to login
                if (router.currentRoute.name !== ROUTER_NAMES.login) {
                    await router.replace({
                        name: ROUTER_NAMES.login,
                        query: {
                            _act: "FORCE_LOGOUT",
                            ts: Date.now().toString(36).replace("0.", "")
                        }
                    })
                } else {
                    return Promise.reject(e)
                }

                // resolve empty response for no catch in ui
                return Promise.resolve({
                    status: "Success",
                    message: errMsg,
                    data: null,
                    error_code: AuthService.ERROR_CODE.force_logout
                })
            }

            if (config?.originalError === true) {
                return Promise.reject(e)
            }
            return Promise.reject(e.response?.data || e.response || e)
        }
    }
}

const aipClient = new ApiClient()

export default aipClient
