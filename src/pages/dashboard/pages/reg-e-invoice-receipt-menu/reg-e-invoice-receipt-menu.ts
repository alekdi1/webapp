import { StoreServices } from "@/services"
import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { StoreModel } from "@/models"
import { LanguageUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"

const t = (k: string) => LanguageUtils.i18n.t("pages.reg_inv_receipt." + k).toString()

@Component
export default class RegEInvoiceReceiptStoreListPage extends Base {

    private loading = false
    private search = ""
    private selectedStore: StoreModel.Store|null = null
    private errorMessage = ""

    private get text() {
        return {
            page_title: t("title"),
            search_branch: this.$t("search_branch").toString()
        }
    }

    private get menus() {
        return {
            menu_e_invoice: {
                id: "menu_e_invoice",
                label: LanguageUtils.lang("สมัคร/ยกเลิกใบแจ้งหนี้ Invoice By Email", "Register/Cancel Invoice By Email"),
                value: StoreServices.SUBSCRIBE_SERVICES.invoice
            },
            menu_e_receipt: {
                id: "menu_e_receipt",
                label: LanguageUtils.lang("สมัคร/ยกเลิกใบเสร็จ e-Tax Invoice & e-Receipt", "Register/Cancel e-Tax Invoice & e-Receipt"),
                value: StoreServices.SUBSCRIBE_SERVICES.receipt
            }
        }
    }

    private selectMenu(id: string) {
        const { menus } = this
        const params = {
            store_id: this.selectedStore?.id || "",
            service: ""
        }
        if (id === menus.menu_e_invoice.id) {
            params.service = menus.menu_e_invoice.value
        } else {
            params.service = menus.menu_e_receipt.value
        }

        return this.$router.push({
            name: ROUTER_NAMES.reg_e_invoice_receipt_detail,
            params
        })
    }
}
